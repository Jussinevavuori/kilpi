import { createCallStackSizeProtector } from "./callStackSizeProtector";
import { KilpiError } from "./error";
import { InferRuleResource, InferRuleSubjectNarrowed, Rule } from "./rule";
import {
  getRuleByKey,
  GetRuleByKey,
  Ruleset,
  RulesetKeys,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "./ruleset";

/**
 * Call stack size protector to provide helpful error messages to user if they accidentally call
 * protect() (or a protected query) within a protect() call, which causes an infinite loop. This
 * may happen e.g. due to calling protect() or a protected query within the `getSubject` function
 * or a rule evaulator function.
 */
const callStackSizeProtector = createCallStackSizeProtector({
  maxStackSize: 50,
  errorMessage: `
		Kilpi.protect() called too many times recursively -- potential infinite loop
		detected. This is usually caused by calling protect() or a protected query
		with query.protect() or query.safe() in getSubject() or a rule. These cause
		an infinite loop. Ensure all rules and the getSubject function do not call
		protect() or protected queries with .protect() or .safe().
	`.replace(/\s+/g, " "), // Normalize whitespace
});

/**
 * Handler when `protect()` denies access. Either a sync or async function that runs a side effect
 * on denial (e.g. a log) or throws an error or other throwable, e.g. a redirect.
 */
export type OnDenyHandler = (options: {
  message?: string;
  rule: Rule<any, any, any>;
  subject: unknown;
}) => void | never | Promise<void> | Promise<never>;

/**
 * Protect options. Resource is optionally added if the rule requires it in the overloads.
 */
export type ProtectOptions<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey
> = {
  subject: TSubject | (() => Promise<TSubject>);
  ruleset: TRuleset;
  key: TRulekey;
  onDeny?: OnDenyHandler | (() => OnDenyHandler);
};

/**
 * Return type of protection (when succesful).
 */
export type ProtectReturn<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeys<TRuleset>
> = Promise<InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TRulekey>>>;

/**
 * Protect function. Given a ruleset, subject, key, and optionally a resource, checks if the subject
 * passess the specified rule and is granted permission. If not, throws a PermissionDenied error
 * (or other throwable via `onDeny` function).
 *
 * Has overloads for rules with and without resources.
 */
export async function protect<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithResource<TRuleset>
>(
  options: ProtectOptions<TSubject, TRuleset, TRulekey> & {
    resource: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): ProtectReturn<TSubject, TRuleset, TRulekey>;
export async function protect<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeysWithoutResource<TRuleset>
>(
  options: ProtectOptions<TSubject, TRuleset, TRulekey>
): ProtectReturn<TSubject, TRuleset, TRulekey>;
export async function protect<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TRulekey extends RulesetKeys<TRuleset>
>(
  options: ProtectOptions<TSubject, TRuleset, TRulekey> & {
    resource?: InferRuleResource<GetRuleByKey<TRuleset, TRulekey>>;
  }
): ProtectReturn<TSubject, TRuleset, TRulekey> {
  callStackSizeProtector.push();

  // Get subject
  const subject = typeof options.subject === "function" ? await options.subject() : options.subject;

  // Get rule by key form ruleset
  const rule = getRuleByKey(options.ruleset, options.key);

  // Evalulate rule to get permission with provided resource
  const permission = await rule.getPermission(
    subject,
    "resource" in options ? options.resource : void 0
  );

  callStackSizeProtector.pop();

  // Handle denials -- use provided `onDeny()` function if provided. Defaults to throwing an error
  // unless `onDeny` throws an error (or other throwable, e.g. a redirect).
  if (!permission.granted) {
    if (options.onDeny) {
      await options.onDeny?.({
        message: permission.message,
        rule,
        subject,
      });
    }

    throw new KilpiError.PermissionDenied(permission.message ?? "Unauthorized");
  }

  // Permission granted, return narrowed subject
  return permission.subject;
}
