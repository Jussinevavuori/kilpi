import { KilpiError } from "../lib/error";
import { InferRuleResource, InferRuleSubjectNarrowed } from "../lib/rule";
import {
  getRuleByKey,
  GetRuleByKey,
  Ruleset,
  RulesetKeys,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "../lib/ruleset";

/**
 * Create a protector function for a given ruleset and subject.
 */
export function setupProtectors<TSubject, const TRuleset extends Ruleset<TSubject>>(
  getSubject: () => Promise<TSubject>,
  ruleset: TRuleset,

  options: {
    // Access current onProtect behaviour if available
    getOnProtect?: () => undefined | (() => never);
  }
) {
  // Keep track of recursive protect calls. If this number exceeds the protect call stack size
  // threshold, we assume the user is stuck in a recursive loop and throw an error. This is usually
  // caused by a rule fetching a resource using a protected query.
  const protectCallStackSizeThreshold = 50;
  let protectCallStackSize = 0;

  /**
   * Protector function. If there is no specified resource, it is not required to be passed.
   */
  async function protect<TKey extends RulesetKeysWithResource<TRuleset>>(
    ruleKey: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ): Promise<InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TKey>>>;
  async function protect<TKey extends RulesetKeysWithoutResource<TRuleset>>(
    ruleKey: TKey
  ): Promise<InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TKey>>>;
  async function protect<TKey extends RulesetKeys<TRuleset>>(
    ruleKey: TKey,
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ): Promise<InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TKey>>> {
    // Check for recursive protect calls
    protectCallStackSize++;
    if (protectCallStackSize > protectCallStackSizeThreshold) {
      throw new Error(
        "🚨 Kilpi.protect() called too many times recursively. This is" +
          "usually caused by a rule fetching a resource using a protected " +
          "query, causing a recursive loop. Ensure no rule uses protected " +
          "queries or otherwise calls protect()."
      );
    }

    // Subject
    const subject = await getSubject();

    // Run rule
    const rule = getRuleByKey(ruleset, ruleKey);
    const permission = await rule.getPermission(subject, resource);

    // Decrease call stack size
    protectCallStackSize--;
    if (protectCallStackSize < 0) {
      protectCallStackSize = 0;
      console.warn(`protectCallStackSize is negative, resetting to 0`);
    }

    // Denied -- run stored onProtect function or throw error
    if (!permission.granted) {
      if (options.getOnProtect) {
        const onProtect = options.getOnProtect();
        if (onProtect) onProtect();
      }

      throw new KilpiError.PermissionDenied("Permission denied");
    }

    // Granted, return subject
    return permission.subject;
  }

  /**
   * Raw get permission function
   */
  async function getPermission<TKey extends RulesetKeys<TRuleset>>(
    ruleKey: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ) {
    // Subject
    const subject = await getSubject();

    // Run rule
    const rule = getRuleByKey(ruleset, ruleKey);
    const permission = await rule.getPermission(subject, resource);

    // Return permission as is
    return permission;
  }

  /**
   * Has permission as simplified version of getPermission with boolean result only
   */
  async function hasPermission<TKey extends RulesetKeys<TRuleset>>(
    ruleKey: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ) {
    // Subject
    const subject = await getSubject();

    // Run rule
    const rule = getRuleByKey(ruleset, ruleKey);
    const permission = await rule.getPermission(subject, resource);

    // Return permission granted
    return permission.granted;
  }

  return {
    protect,
    getPermission,
    hasPermission,
  };
}
