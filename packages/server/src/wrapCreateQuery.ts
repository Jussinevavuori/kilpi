import { createQuery, CreateQueryOptions, Ruleset } from "@kilpi/core";
import { CreateKilpiServerClientOptions } from "./createServerClient";

/**
 * Wrap the createPostEndpoint with an improved API to be called via the client.
 */
export function wrapCreateQuery<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>({
  getSubject,
  ruleset,
}: CreateKilpiServerClientOptions<TSubject, TRuleset> & {
  ruleset: TRuleset;
}) {
  return function wrappedCreateQuery<TQuery extends (...args: any[]) => any>(
    query: CreateQueryOptions<TSubject, TRuleset, TQuery>["query"],
    protector?: CreateQueryOptions<TSubject, TRuleset, TQuery>["protector"]
  ) {
    return createQuery({
      subject: getSubject,
      ruleset,
      query,
      protector,
    });
  };
}
