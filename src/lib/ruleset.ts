import { FineError } from "./error";
import { InferRuleResource, Rule } from "./rule";
import { DeepObject, Equals, RecursiveKeysTo, RecursiveValueByKey } from "./types";

/**
 * Separator for rule keys.
 */
export const RULE_KEY_SEPARATOR = ":" as const;

/**
 * Rule-set is a deep-object of rules which all share a common base subject type.
 */
export type Ruleset<TSubject> = DeepObject<Rule<any, TSubject, any>>;

/**
 * List of all keys in ruleset.
 */
export type RulesetKeys<TRuleset extends Ruleset<any>> = RecursiveKeysTo<
  TRuleset,
  TRuleset extends Ruleset<infer TSubject> ? Rule<any, TSubject> : never,
  typeof RULE_KEY_SEPARATOR
>;

/**
 * List of all keys in ruleset that require a resource.
 */
export type RulesetKeysWithResource<TRuleset extends Ruleset<any>> = keyof {
  [Key in RulesetKeys<TRuleset>]: Equals<
    InferRuleResource<GetRuleByKey<TRuleset, Key>>,
    any
  > extends true
    ? never
    : true;
};

/**
 * List of all keys in ruleset that do not require a resource.
 */
export type RulesetKeysWithoutResource<TRuleset extends Ruleset<any>> = keyof {
  [Key in RulesetKeys<TRuleset>]: Equals<
    InferRuleResource<GetRuleByKey<TRuleset, Key>>,
    any
  > extends true
    ? true
    : never;
};

/**
 * Ensure a value is a rule
 */
export type EnsureTypeIsRule<T> = T extends Rule<any, any, any> ? T : never;

/**
 * Type of a rule from a ruleset given a key.
 */
export type GetRuleByKey<
  TRuleset extends Ruleset<any>,
  TKey extends RulesetKeys<TRuleset>
> = EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey, typeof RULE_KEY_SEPARATOR>>;

/**
 * Get a rule from a ruleset given a key.
 */
export function getRuleByKey<
  const TRuleset extends Ruleset<any>,
  TKey extends RulesetKeys<TRuleset>
>(ruleset: TRuleset, key: TKey): GetRuleByKey<TRuleset, TKey> {
  // Get permission by key
  const keys = key.split(RULE_KEY_SEPARATOR);
  const rule = keys.reduce<any>((index, k) => index[k], ruleset);

  // Ensure permission is found and is a valid permission
  if (typeof rule !== "function") throw new FineError.Internal(`Rule not found (${key})`);

  // Typecast as this can not be done type-safely without
  return rule as GetRuleByKey<TRuleset, TKey>;
}
