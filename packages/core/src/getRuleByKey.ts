import { KilpiError } from "./error";
import { EnsureTypeIsRule, RULE_KEY_SEPARATOR, Ruleset, RulesetKeys } from "./ruleset";
import { RecursiveValueByKey } from "./types";

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
  if (typeof rule !== "function") {
    throw new KilpiError.Internal(`Rule not found: "${key}"`);
  }

  // Typecast as this can not be done type-safely without
  return rule as GetRuleByKey<TRuleset, TKey>;
}
