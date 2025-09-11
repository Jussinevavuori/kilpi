import type { Decision } from "./decision";
import { KilpiError } from "./error";
import type { DeepObject, RecursiveKeysTo, RecursiveValueByKey } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Policy inputs either take in exactly 0 or 1 objects.
 */
type AnyPolicyInput = [] | [any];

/**
 * A policy is a function that takes in a subject and optionally an object and returns an
 * authorization representing whether the subject is allowed to perform the specified action
 * (on the specified object).
 *
 * A passed authorization check can also return a narrowed down version of the subject.
 */
export type Policy<
  TInputs extends AnyPolicyInput,
  TSubjectInput,
  TSubjectOutput = TSubjectInput,
> = (
  subject: TSubjectInput,
  ...inputs: TInputs
) => Decision<TSubjectOutput> | Promise<Decision<TSubjectOutput>>;

/**
 * Utility type for inferring the inputs of a policy.
 */
export type InferPolicyInputs<T> = T extends Policy<infer TInputs, any, any> ? TInputs : [];

/**
 * Utility type for inferring the narrowed down subject of a policy.
 */
export type InferPolicySubject<T> = T extends Policy<any, any, infer TSubject> ? TSubject : never;

/**
 * Separator for action keys (e.g. "blog:edit").
 */
const SEPARATOR = ":" as const;

/**
 * Policyset is a deep-object of policies which all share a common base subject type.
 */
export type Policyset<TSubject> = DeepObject<Policy<any, TSubject, any>>;

/**
 * List of all actions in a PolicySet.
 */
export type PolicysetActions<TPolicyset extends Policyset<any>> = RecursiveKeysTo<
  TPolicyset,
  TPolicyset extends Policyset<infer TSubject> ? Policy<any, TSubject, any> : never,
  typeof SEPARATOR
>;

/**
 * Get list of actions that do not take in an object.
 */
export type PolicySetActionsWithoutObject<TPolicyset extends Policyset<any>> = {
  [K in PolicysetActions<TPolicyset>]: InferPolicyInputs<
    GetPolicyByAction<TPolicyset, K>
  > extends []
    ? K
    : never;
}[PolicysetActions<TPolicyset>];

/**
 * Get list of actions that do take in an object.
 */
export type PolicysetActionsWithObject<TPolicyset extends Policyset<any>> = {
  [K in PolicysetActions<TPolicyset>]: InferPolicyInputs<GetPolicyByAction<TPolicyset, K>> extends [
    any,
  ]
    ? K
    : never;
}[PolicysetActions<TPolicyset>];

/**
 * Ensure a value is a policy.
 */
type EnsureTypeIsPolicy<T> = T extends Policy<any, any, any> ? T : never;

/**
 * Type of a policy from a policyset given an action.
 */
export type GetPolicyByAction<
  TPolicyset extends Policyset<any>,
  TAction extends PolicysetActions<TPolicyset>,
> = EnsureTypeIsPolicy<RecursiveValueByKey<TPolicyset, TAction, typeof SEPARATOR>>;

/**
 * Typesafe function to extract a policy from a policyset by the action.
 */
export function getPolicyByAction<
  const TPolicyset extends Policyset<any>,
  TAction extends PolicysetActions<TPolicyset>,
>(policyset: TPolicyset, action: TAction): GetPolicyByAction<TPolicyset, TAction> {
  // Access policy by action
  const parts = action.split(SEPARATOR);
  const policy = parts.reduce<any>((index, k) => index[k], policyset);

  // Ensure policy found
  if (typeof policy !== "function") {
    throw new KilpiError.Internal(`Policy not found: "${action}"`);
  }

  // Typecast as this can not be done type-safely without
  return policy as GetPolicyByAction<TPolicyset, TAction>;
}
