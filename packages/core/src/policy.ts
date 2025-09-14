import type { Decision } from "./decision";
import { KilpiError } from "./error";
import type { DeepObject, RecursiveValueByKey } from "./utils/types";

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
 * Policyset is a deep-object of policies which all share a common base subject type.
 */
export type Policyset<TSubject> = DeepObject<Policy<any, TSubject, any>>;

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
 * Specialized version of RecursiveKeysTo that matches by function parameter type instead of
 * exact type.
 */
export type RecursiveKeysToFnByParams<
  Object,
  TargetParams,
  Separator extends string = ".",
> = Object extends object
  ? {
      [Key in keyof Object]: Key extends string | number
        ? Object[Key] extends (...args: infer FnParams) => any
          ? FnParams extends TargetParams
            ? Key
            : never
          : `${Key}${Separator}${RecursiveKeysToFnByParams<Object[Key], TargetParams, Separator>}`
        : never;
    }[keyof Object]
  : never;

/**
 * Get list of actions that do not take in an object.
 */
export type PolicysetActionsWithoutObject<TPolicyset extends Policyset<any>> =
  RecursiveKeysToFnByParams<TPolicyset, [] | [any], typeof SEPARATOR>;

/**
 * Get list of actions that do take in an object.
 */
export type PolicysetActionsWithObject<TPolicyset extends Policyset<any>> =
  RecursiveKeysToFnByParams<TPolicyset, [any, any], typeof SEPARATOR>;

/**
 * List of all actions in a Policyset.
 */
export type PolicysetActions<TPolicyset extends Policyset<any>> =
  | PolicysetActionsWithObject<TPolicyset>
  | PolicysetActionsWithoutObject<TPolicyset>;

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
>(policyset: TPolicyset, action: TAction) {
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
