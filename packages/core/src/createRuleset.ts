import { getRuleConstructors, RuleConstructors } from "./getRuleConstructors";
import { Ruleset } from "./ruleset";

/**
 * Create ruleset separately. Requires calling with subject first before creating rules due to
 * TypeScript limitations.
 *
 * `createRuleset<MySubject>()(Rule => {
 *   return {
 *     ...
 *   }
 * })`
 */
export function createRuleset<TSubject extends object | null | undefined>() {
  return function craeteRulesetImpl<const TRuleset extends Ruleset<TSubject>>(
    rules: (Rule: RuleConstructors<TSubject>) => TRuleset
  ) {
    return rules(getRuleConstructors<TSubject>());
  };
}
