import {
  GetRuleByKey,
  InferRuleResource,
  protect,
  ProtectReturn,
  Ruleset,
  RulesetKeys,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "@kilpi/core";
import { CreateKilpiServerClientOptions } from "./createServerClient";

/**
 * Wrap protect with an improved API to be called via the client.
 */
export function wrapProtect<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>({
  getSubject,
  ruleset,
  onDeny,
}: CreateKilpiServerClientOptions<TSubject, TRuleset> & {
  ruleset: TRuleset;
}) {
  async function wrappedProtect<TRulekey extends RulesetKeysWithResource<TRuleset>>(
    key: TRulekey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): ProtectReturn<TSubject, TRuleset, TRulekey>;
  async function wrappedProtect<TRulekey extends RulesetKeysWithoutResource<TRuleset>>(
    key: TRulekey
  ): ProtectReturn<TSubject, TRuleset, TRulekey>;
  async function wrappedProtect<TRulekey extends RulesetKeys<TRuleset>>(
    key: TRulekey,
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>
  ): ProtectReturn<TSubject, TRuleset, TRulekey> {
    return await protect<TSubject, TRuleset, TRulekey>({
      subject: getSubject,
      ruleset,
      key,
      resource,

      // Support getting the `onDeny` function from a get-set storage
      onDeny: typeof onDeny === "object" ? onDeny.get() : onDeny,
    });
  }

  return wrappedProtect;
}
