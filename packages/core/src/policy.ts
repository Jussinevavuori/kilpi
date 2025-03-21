import { Authorization } from "./authorization";
import { KilpiError } from "./error";
import type { DeepObject, RecursiveKeysTo, RecursiveValueByKey } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Policy inputs either take in exactly 0 or 1 resources.
 */
export type AnyPolicyInput = [] | [any];

/**
 * A policy is a function that takes in a subject and optionally a resource and returns an
 * authorization representing whether the subject is allowed to perform the specified action
 * (on the specified resource).
 *
 * A passed authorization check can also return a narrowed down version of the subject.
 */
export type Policy<
  TInputs extends AnyPolicyInput,
  TSubjectInput,
  TSubjectOutput = TSubjectInput,
> = (subject: TSubjectInput, ...inputs: TInputs) => Promise<Authorization<TSubjectOutput>>;

/**
 * Utility type for inferring the inputs of a policy.
 */
export type InferPolicyInputs<T> = T extends Policy<infer TInputs, any, any> ? TInputs : [];

/**
 * Utility type for inferring the narrowed down subject of a policy.
 */
export type InferPolicySubject<T> = T extends Policy<any, any, infer TSubject> ? TSubject : never;

/**
 * Policy construction utilities. Use either as:
 *
 * @example
 * ```ts
 * // 1. Create a policy guard
 * const AuthedPolicy = Policy.as((subject: Subject | null) => (subject ? { subject } : null))
 *
 * // 2. Create a new policy from guard
 * AuthedPolicy((subject, id: string, count: number) => {
 *   return subject.id === id && count > 0;
 * });
 * ```
 */
export const Policy = {
  /**
   * Create a new policy constructor by first passing a subject narrowing function.
   */
  as<TSubjectInput, TSubjectOutput>(
    getGuardedSubject: (subject: TSubjectInput) => { subject: TSubjectOutput } | null | undefined,
  ) {
    /**
     * Create a new policy using a boolean-style constructor (true = granted, false = denied),
     * after narrowing down the subject.
     */
    return function createPolicy<TInputs extends AnyPolicyInput>(
      evaluate: (subject: TSubjectOutput, ...inputs: TInputs) => boolean | Promise<boolean>,
    ): Policy<TInputs, TSubjectInput, TSubjectOutput> {
      return async (subject, ...inputs) => {
        // Narrow down the subject. If the narrowing fails, deny the authorization.
        const guarded = getGuardedSubject(subject);
        if (!guarded) return Authorization.Deny();

        // Evaluate the policy function and return the authorization result.
        return (await evaluate(guarded.subject, ...inputs))
          ? Authorization.Grant(guarded.subject)
          : Authorization.Deny();
      };
    };
  },

  /**
   * Utility RBAC constructor
   */
  rbac<TSubjectInput, TSubjectOutput, TRole extends string = string>(
    getGuardedSubject: (
      subject: TSubjectInput,
    ) => { subject: TSubjectOutput; roles: TRole[] } | null | undefined,
  ) {
    return function createPolicy(...roles: TRole[]): Policy<[], TSubjectInput, TSubjectOutput> {
      return async (subject) => {
        // Narrow down the subject and extract roles. If the narrowing fails, deny the authorization.
        const guarded = getGuardedSubject(subject);
        if (!guarded) return Authorization.Deny();

        // Evaluate the policy function and return the authorization result.
        return roles.some((role) => guarded.roles.includes(role))
          ? Authorization.Grant(guarded.subject)
          : Authorization.Deny();
      };
    };
  },
};

/**
 * Separator for policy keys.
 */
export const POLICY_KEY_SEPARATOR = ":" as const;

/**
 * Policyset is a deep-object of policies which all share a common base subject type.
 */
export type Policyset<TSubject> = DeepObject<Policy<any, TSubject, any>>;

/**
 * List of all keys in policyset.
 */
export type PolicysetKeys<TPolicyset extends Policyset<any>> = RecursiveKeysTo<
  TPolicyset,
  TPolicyset extends Policyset<infer TSubject> ? Policy<any, TSubject, any> : never,
  typeof POLICY_KEY_SEPARATOR
>;

/**
 * Get list of policy keys that do not take in a resource.
 */
export type PolicySetKeysWithoutResource<TPolicyset extends Policyset<any>> = {
  [K in PolicysetKeys<TPolicyset>]: InferPolicyInputs<GetPolicyByKey<TPolicyset, K>> extends []
    ? K
    : never;
}[PolicysetKeys<TPolicyset>];

/**
 * Get list of policy keys that do take in a resource.
 */
export type PolicysetKeysWithResource<TPolicyset extends Policyset<any>> = {
  [K in PolicysetKeys<TPolicyset>]: InferPolicyInputs<GetPolicyByKey<TPolicyset, K>> extends [any]
    ? K
    : never;
}[PolicysetKeys<TPolicyset>];

/**
 * Ensure a value is a policy.
 */
export type EnsureTypeIsPolicy<T> = T extends Policy<any, any, any> ? T : never;

/**
 * Type of a policy from a policyset given a key.
 */
export type GetPolicyByKey<
  TPolicyset extends Policyset<any>,
  TKey extends PolicysetKeys<TPolicyset>,
> = EnsureTypeIsPolicy<RecursiveValueByKey<TPolicyset, TKey, typeof POLICY_KEY_SEPARATOR>>;

/**
 * Typesafe function to extract a policy from a policyset by key.
 */
export function getPolicyByKey<
  const TPolicyset extends Policyset<any>,
  TKey extends PolicysetKeys<TPolicyset>,
>(policyset: TPolicyset, key: TKey): GetPolicyByKey<TPolicyset, TKey> {
  // Access policy by key
  const keys = key.split(POLICY_KEY_SEPARATOR);
  const policy = keys.reduce<any>((index, k) => index[k], policyset);

  // Ensure policy found
  if (typeof policy !== "function") {
    throw new KilpiError.Internal(`Policy not found: "${key}"`);
  }

  // Typecast as this can not be done type-safely without
  return policy as GetPolicyByKey<TPolicyset, TKey>;
}
