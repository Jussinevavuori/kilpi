import { initializeRules } from "../lib/rule";
import { Ruleset } from "../lib/ruleset";

/**
 * Create ruleset separately. Requires calling as follows due to TypeScript limitations.
 *
 * `createRuleset<MySubject>()(Rule => {
 *   return {
 *     ...
 *   }
 * })`
 */
export function createRuleset<TSubject>() {
  return function craeteRulesetImpl<const TRuleset extends Ruleset<TSubject>>(
    rules: (Rule: ReturnType<typeof initializeRules<TSubject>>) => TRuleset
  ) {
    return rules(initializeRules<TSubject>());
  };
}
