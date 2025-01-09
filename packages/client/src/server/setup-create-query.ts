import { KilpiPlugin } from "../lib/create-plugin";

export function setupCreateQuery(options: { plugins?: KilpiPlugin[] } = {}) {
  return function createQuery<TQuery extends (...args: any[]) => any>(
    originalQuery: TQuery,
    protector?: (result: Awaited<ReturnType<TQuery>>, ...args: Parameters<TQuery>) => any
  ) {
    // Apply each `wrapProtectedQuery` from plugins to receive base query
    const query = (options.plugins ?? []).reduce(
      (q, plugin) => (plugin.wrapProtectedQuery ? plugin.wrapProtectedQuery(q) : q),
      originalQuery
    );

    return Object.assign(query, {
      /**
       * Return null if the authorization check fails
       */
      async safe(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>> | null> {
        const result = await query(...args);
        try {
          await protector?.(result, ...args);
          return result;
        } catch {
          return null;
        }
      },

      /**
       * Fail if authorization check fails
       */
      async protect(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> {
        const result = await query(...args);
        await protector?.(result, ...args);
        return result;
      },
    });
  };
}
