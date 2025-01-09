import {
  GetRuleByKey,
  hasPermission,
  InferRuleResource,
  Ruleset,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "@kilpi/core";
import { CreateKilpiServerClientOptions } from "./createServerClient";

/**
 * Wrap protect with an improved API to be called via the client.
 */
export function wrapHasPermission<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>({
  getSubject,
  ruleset,
  onDeny,
}: CreateKilpiServerClientOptions<TSubject, TRuleset> & {
  ruleset: TRuleset;
}) {
  async function wrappedHasPermission<TRulekey extends RulesetKeysWithResource<TRuleset>>(
    key: TRulekey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): Promise<boolean>;
  async function wrappedHasPermission<TRulekey extends RulesetKeysWithoutResource<TRuleset>>(
    key: TRulekey
  ): Promise<boolean>;
  async function wrappedHasPermission<TRulekey extends RulesetKeysWithResource<TRuleset>>(
    key: TRulekey,
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): Promise<boolean> {
    return await hasPermission<TSubject, TRuleset, TRulekey>({
      subject: getSubject,
      ruleset,
      key,
      resource,
    });
  }

  return wrappedHasPermission;
}
