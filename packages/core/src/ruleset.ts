import { KilpiError } from "./error";
import type { InferRuleInputs, Rule } from "./rule";
import type { DeepObject, RecursiveKeysTo, RecursiveValueByKey } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Separator for rule keys.
 */
export const RULE_KEY_SEPARATOR = ":" as const;

/**
 * Rule-set is a deep-object of rules which all share a common base subject type.
 */
export type Ruleset<TSubject extends object | null | undefined> = DeepObject<
  Rule<any, TSubject, any>
>;

/**
 * List of all keys in ruleset.
 */
export type RulesetKeys<TRuleset extends Ruleset<any>> = RecursiveKeysTo<
  TRuleset,
  TRuleset extends Ruleset<infer TSubject> ? Rule<any, TSubject, any> : never,
  typeof RULE_KEY_SEPARATOR
>;

/**
 * Get list of keys that correspond to 0 inputs
 */
export type RulesetKeysWithoutResource<TRuleset extends Ruleset<any>> = {
  [K in RulesetKeys<TRuleset>]: InferRuleInputs<GetRuleByKey<TRuleset, K>> extends [] ? K : never;
}[RulesetKeys<TRuleset>];

/**
 * Get list of keys that correspond to 1 input
 */
export type RulesetKeysWithResource<TRuleset extends Ruleset<any>> = {
  [K in RulesetKeys<TRuleset>]: InferRuleInputs<GetRuleByKey<TRuleset, K>> extends [any]
    ? K
    : never;
}[RulesetKeys<TRuleset>];

/**
 * Ensure a value is a rule
 */
export type EnsureTypeIsRule<T> = T extends Rule<any, any, any> ? T : never;

/**
 * Type of a rule from a ruleset given a key.
 */
export type GetRuleByKey<
  TRuleset extends Ruleset<any>,
  TKey extends RulesetKeys<TRuleset>,
> = EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey, typeof RULE_KEY_SEPARATOR>>;

/**
 * Get a rule from a ruleset given a key.
 */
export function getRuleByKey<
  const TRuleset extends Ruleset<any>,
  TKey extends RulesetKeys<TRuleset>,
>(ruleset: TRuleset, key: TKey): GetRuleByKey<TRuleset, TKey> {
  // Get permission by key
  const keys = key.split(RULE_KEY_SEPARATOR);
  const rule = keys.reduce<any>((index, k) => index[k], ruleset);

  // Ensure rule found and has required properties -- this check is enough for us
  // to be sure that the rule is a valid rule.
  if (typeof rule !== "function") {
    throw new KilpiError.Internal(`Rule not found: "${key}"`);
  }

  // Typecast as this can not be done type-safely without
  return rule as GetRuleByKey<TRuleset, TKey>;
}
