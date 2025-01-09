import { getPermission, GetPermissionOptions } from "./getPermission";
import { InferRuleResource } from "./rule";
import {
  GetRuleByKey,
  Ruleset,
  RulesetKeys,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "./ruleset";

/**
 * Check if the given subject (over the given rule and on the given resource) has access. Only
 * returns a boolean. To receive the entire permission, use `getPermission` instead.
 */
export async function hasPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithResource<TRuleset>
>(
  options: GetPermissionOptions<TSubject, TRuleset, TRulekey> & {
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): Promise<boolean>;
export async function hasPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithoutResource<TRuleset>
>(options: GetPermissionOptions<TSubject, TRuleset, TRulekey>): Promise<boolean>;
export async function hasPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeys<TRuleset>
>(
  options: GetPermissionOptions<TSubject, TRuleset, TRulekey> & {
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): Promise<boolean> {
  // Use getPermission under the hood
  const permission = await getPermission(options);
  return permission.granted;
}
