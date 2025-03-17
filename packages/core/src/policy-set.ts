import { KilpiError } from "./error";
import type { InferPolicyInputs, Policy } from "./policy";
import type {
  DeepObject,
  RecursiveKeysTo,
  RecursiveValueByKey,
} from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Separator for policy keys.
 */
export const POLICY_KEY_SEPARATOR = ":" as const;

/**
 * Policyset is a deep-object of policies which all share a common base subject type.
 */
export type Policyset<TSubject extends object | null | undefined> = DeepObject<
  Policy<any, TSubject, any>
>;

/**
 * List of all keys in policyset.
 */
export type PolicysetKeys<TPolicyset extends Policyset<any>> = RecursiveKeysTo<
  TPolicyset,
  TPolicyset extends Policyset<infer TSubject>
    ? Policy<any, TSubject, any>
    : never,
  typeof POLICY_KEY_SEPARATOR
>;

/**
 * Get list of policy keys that do not take in a resource.
 */
export type PolicySetKeysWithoutResource<TPolicyset extends Policyset<any>> = {
  [K in PolicysetKeys<TPolicyset>]: InferPolicyInputs<
    GetPolicyByKey<TPolicyset, K>
  > extends []
    ? K
    : never;
}[PolicysetKeys<TPolicyset>];

/**
 * Get list of policy keys that do take in a resource.
 */
export type PolicysetKeysWithResource<TPolicyset extends Policyset<any>> = {
  [K in PolicysetKeys<TPolicyset>]: InferPolicyInputs<
    GetPolicyByKey<TPolicyset, K>
  > extends [any]
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
> = EnsureTypeIsPolicy<
  RecursiveValueByKey<TPolicyset, TKey, typeof POLICY_KEY_SEPARATOR>
>;

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
