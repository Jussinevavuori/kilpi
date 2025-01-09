import { Permission } from "./permission";
import { InferRuleResource, InferRuleSubjectNarrowed } from "./rule";
import {
  getRuleByKey,
  GetRuleByKey,
  Ruleset,
  RulesetKeys,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "./ruleset";

/**
 * Get permission options. Resource is optionally added if the rule requires it in the overloads.
 */
export type GetPermissionOptions<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithResource<TRuleset>
> = {
  subject: TSubject | (() => Promise<TSubject>);
  ruleset: TRuleset;
  key: TRulekey;
};

/**
 * Return type of get permission.
 */
export type GetPermissionReturn<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeys<TRuleset>
> = Promise<Permission<InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TRulekey>>>>;

/**
 * Get permission given a ruleset, subject, key, and optionally a resource based on the rule.
 * Returns a permission object with a `granted` proeprty and a narrowed subject if granted, else
 * a message.
 *
 * Has overloads for rules with and without resources.
 */
export async function getPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithResource<TRuleset>
>(
  options: GetPermissionOptions<TSubject, TRuleset, TRulekey> & {
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): GetPermissionReturn<TSubject, TRuleset, TRulekey>;
export async function getPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithoutResource<TRuleset>
>(
  options: GetPermissionOptions<TSubject, TRuleset, TRulekey>
): GetPermissionReturn<TSubject, TRuleset, TRulekey>;
export async function getPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeys<TRuleset>
>(
  options: GetPermissionOptions<TSubject, TRuleset, TRulekey> & {
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): GetPermissionReturn<TSubject, TRuleset, TRulekey> {
  // Get subject
  const subject = typeof options.subject === "function" ? await options.subject() : options.subject;

  // Get rule by key form ruleset
  const rule = getRuleByKey(options.ruleset, options.key);

  // Evalulate rule to get permission with provided resource
  const permission = await rule.getPermission(
    subject,
    "resource" in options ? options.resource : void 0
  );

  // Return permission
  return permission;
}
