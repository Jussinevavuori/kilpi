import {
  getPermission,
  GetPermissionReturn,
  GetRuleByKey,
  InferRuleResource,
  Ruleset,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "@kilpi/core";
import { CreateKilpiServerClientOptions } from "./createServerClient";

/**
 * Wrap protect with an improved API to be called via the client.
 */
export function wrapGetPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>({
  getSubject,
  ruleset,
}: CreateKilpiServerClientOptions<TSubject, TRuleset> & {
  ruleset: TRuleset;
}) {
  async function wrappedGetPermission<TRulekey extends RulesetKeysWithResource<TRuleset>>(
    key: TRulekey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): GetPermissionReturn<TSubject, TRuleset, TRulekey>;
  async function wrappedGetPermission<TRulekey extends RulesetKeysWithoutResource<TRuleset>>(
    key: TRulekey
  ): GetPermissionReturn<TSubject, TRuleset, TRulekey>;
  async function wrappedGetPermission<TRulekey extends RulesetKeysWithResource<TRuleset>>(
    key: TRulekey,
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): GetPermissionReturn<TSubject, TRuleset, TRulekey> {
    return await getPermission<TSubject, TRuleset, TRulekey>({
      subject: getSubject,
      ruleset,
      key,
      resource,
    });
  }

  return wrappedGetPermission;
}
