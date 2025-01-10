import { KilpiError } from "./error";
import { SubjectGuard } from "./guard";
import { Permission } from "./permission";
import { DeepObject, MaybePromise, RecursiveKeysTo, RecursiveValueByKey } from "./utils/types";

/**
 * A rule is a function that receives a subject and a resource and returns a permission with a
 * potentially narrowed subject.
 *
 * Additionally, the subject guard function is attached.
 */
export type Rule<
  TResource,
  TSubject extends object | null | undefined,
  TGuardedSubject extends object | null | undefined = TSubject
> = ((subject: TSubject, resource: TResource) => Promise<Permission<TGuardedSubject>>) & {
  /**
   * Subject guard
   */
  guard: SubjectGuard<TSubject, TGuardedSubject>;
};

/**
 * Rule inferral utilities
 */
export type InferRule<T> = T extends Rule<infer TResource, infer TSubject, infer TGuardedSubject>
  ? { resource: TResource; subject: TSubject; guardedSubject: TGuardedSubject }
  : never;
export type InferRuleResource<T> = InferRule<T>["resource"];
export type InferRuleSubject<T> = InferRule<T>["subject"];
export type InferRuleGuardedSubject<T> = InferRule<T>["guardedSubject"];

/**
 * Create a rule with a nicer interface by providing the guard function and the check function
 * ran after the guard.
 */
export function createRule<
  TResource,
  TSubject extends object | null | undefined,
  TGuardedSubject extends object | null | undefined
>(
  guard: SubjectGuard<TSubject, TGuardedSubject>,
  check: (
    subject: TGuardedSubject,
    resource: TResource
  ) => MaybePromise<boolean | Permission<TGuardedSubject>>
): Rule<TResource | TResource[], TSubject, TGuardedSubject> {
  // Rule evaluator function with automatic support for arrays
  async function evaluateRule(
    unguardedSubject: TSubject,
    resource: TResource | TResource[]
  ): Promise<Permission<TGuardedSubject>> {
    // Run subject guard
    const guardResult = guard(unguardedSubject);
    if (!guardResult) return Permission.Deny();
    const subject = guardResult.subject;

    // Handle arrays (every item in array must pass -- empty array passes by default) with narrowed subjects
    if (Array.isArray(resource)) {
      // Run all grants in parallel
      const grants = await Promise.all(resource.map((r) => check(subject, r)));
      const allGranted = grants.every((g) => (typeof g === "boolean" ? g : g.granted));

      // All were granted
      if (allGranted) {
        return Permission.Grant(subject);
      }

      // Attempt to find a message
      const message = grants.reduce<string | undefined>(
        (msg, g) => (msg || typeof g === "boolean" || g.granted ? msg : g.message),
        undefined
      );

      // Deny with message if fonud
      return Permission.Deny(message);
    }

    // Handle singular resources with narrowed subject
    const granted = await check(subject, resource);
    if (typeof granted === "boolean") {
      return granted ? Permission.Grant(subject) : Permission.Deny();
    }

    return granted;
  }

  // Return rule with associated properties
  return Object.assign(evaluateRule, { guard });
}

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
 * Key => Resource of a rule map
 */
export type RulesetResourceMap<TRuleset extends Ruleset<any>> = {
  [Key in RulesetKeys<TRuleset>]: InferRuleResource<GetRuleByKey<TRuleset, Key>>;
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

  // Ensure rule found and has required properties -- this check is enough for us
  // to be sure that the rule is a valid rule.
  if (
    !("getPermission" in rule) ||
    !("getNarrowedSubject" in rule) ||
    typeof rule.getPermission !== "function" ||
    typeof rule.getNarrowedSubject !== "function"
  ) {
    throw new KilpiError.Internal(`Rule not found: "${key}"`);
  }

  // Typecast as this can not be done type-safely without
  return rule as GetRuleByKey<TRuleset, TKey>;
}
