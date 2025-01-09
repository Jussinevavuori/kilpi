import { Ruleset } from "./ruleset";

export type CreateQueryOptions<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TQuery extends (...args: any[]) => any
> = {
  subject: TSubject | (() => Promise<TSubject>);
  ruleset: TRuleset;
  query: TQuery;
  protector?: (result: Awaited<ReturnType<TQuery>>, ...args: Parameters<TQuery>) => any;
};

/**
 * Create a query by providing a `protector` function which is used to protect the query when it
 * is called with the now attached `.safe` and `.protect` methods.
 */
export function createQuery<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TQuery extends (...args: any[]) => any
>(options: CreateQueryOptions<TSubject, TRuleset, TQuery>) {
  return Object.assign(options.query, {
    /**
     * Return null if the authorization check fails
     *
     * TODO: Automatic filtering of arrays?
     */
    async safe(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>> | null> {
      const result = await options.query(...args);

      // Protection
      try {
        await options.protector?.(result, ...args);

        // Passed, can return result
        return result;
      } catch {
        // Failed, return null
        return null;
      }
    },

    /**
     * Fail if authorization check fails
     */
    async protect(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> {
      const result = await options.query(...args);
      await options.protector?.(result, ...args);
      return result;
    },
  });
}
