import { z } from "zod";
import { createBatcher } from "../lib/create-batcher";
import { createClientSideCache } from "../lib/create-client-side-cache";
import { createClientSideValueCache } from "../lib/create-client-side-value-cache";
import { KilpiPlugin } from "../lib/create-plugin";
import { createSubscribable } from "../lib/create-subscribable";
import { KilpiError } from "../lib/error";
import type { Permission } from "../lib/permission";
import type { InferRuleResource, InferRuleSubjectNarrowed } from "../lib/rule";
import type { GetRuleByKey, Ruleset, RulesetKeys } from "../lib/ruleset";
import type { createClient as createServerClient } from "../server/server.index";

export function createClient<
  TKilpi extends Pick<ReturnType<typeof createServerClient<any, any, any>>, "$$types">
>(options: { secret: string; endpoint: string }) {
  // Ensure secret and endpoint provided
  if (!options.secret) throw new KilpiError.InvalidSetup(`No secret provided to Kilpi client.`);
  if (!options.endpoint) throw new KilpiError.InvalidSetup(`No endpoint provided to Kilpi client.`);

  // Extract types
  type Subject = TKilpi["$$types"]["subject"];
  type Ruleset = TKilpi["$$types"]["ruleset"];

  // Invalidation pubsub channel
  const invalidationSubscribable = createSubscribable<void>();

  // Listen to invalidations
  function onInvalidate(callback: () => void) {
    return invalidationSubscribable.subscribe(callback);
  }

  // Caches
  const subjectCache = createClientSideValueCache<Promise<Subject>>();
  const permissionCache = createClientSideCache<any>();

  // Invalidate caches and publish event
  function invalidate() {
    subjectCache.invalidate();
    permissionCache.invalidateAll();
    invalidationSubscribable.publish();
  }

  /**
   * Get the subject. Calls are deduped and cached.
   */
  async function getSubject() {
    try {
      async function fetchSubject() {
        // POST query to endpoint with authorization
        const response = await fetch(options.endpoint, {
          method: "POST",
          body: JSON.stringify({ action: "fetchSubject" }),
          headers: { Authorization: `Bearer ${options.secret}` },
        });

        // Error
        if (response.status !== 200) {
          throw new KilpiError.FetchSubjectFailed(
            `Failed to get subject (${response.status} ${
              response.statusText
            }): ${await response.text()}`
          );
        }

        // Return data, assume it is correct and typecast
        return (await response.json()) as Subject;
      }

      // Check cache
      const cached = subjectCache.get();

      // Cache hit
      if (cached) return cached;

      // Cache miss, fetch and cache (cache promise to dedupe calls)
      const result = fetchSubject();
      subjectCache.set(result);
      return result;
    } catch (error) {
      throw new KilpiError.Internal(`Failed to fetch permission`, { cause: error });
    }
  }

  /**
   * Enable batched permission fetching
   */
  const fetchPermissionBatcher = createBatcher(
    async (rules: Array<{ key: string; resource: any }>) => {
      // POST query to endpoint with authorization
      const response = await fetch(options.endpoint, {
        method: "POST",
        body: JSON.stringify({ action: "fetchPermission", rules }),
        headers: { Authorization: `Bearer ${options.secret}` },
      });

      // Throw non-200 statuses as errors
      if (response.status !== 200) {
        throw new KilpiError.FetchPermissionFailed(
          `Failed to fetch permissions (${response.status} ${
            response.statusText
          }): ${await response.text()}`
        );
      }

      // Setup schema for parsing data
      const jsonSchema = z
        .discriminatedUnion("granted", [
          z.object({ granted: z.literal(false), message: z.string().optional() }),
          z.object({ granted: z.literal(true), subject: z.any() }),
        ])
        .array()
        .min(1);

      // Return result if data was succesfully parsed
      const result = jsonSchema.safeParse(await response.json());
      if (!result.success) {
        throw new KilpiError.FetchPermissionFailed(`Invalid response from Kilpi endpoint.`);
      }
      return result.data;
    }
  );

  /**
   * Gets a single permission. All calls are deduped, cached and batched.
   */
  async function getPermission<TKey extends RulesetKeys<Ruleset>>(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<Ruleset, TKey>>
  ) {
    type PermissionResult = Permission<InferRuleSubjectNarrowed<GetRuleByKey<Ruleset, TKey>>>;
    try {
      // Check cache
      const cached = permissionCache.get([key, resource]);

      // Cache hit
      if (cached) return cached as PermissionResult;

      // Cache miss, fetch and cache
      const result = (await fetchPermissionBatcher.enqueueJob({
        key,
        resource,
      })) as PermissionResult;
      permissionCache.set([key, resource], result);
      return result;
    } catch (error) {
      throw new KilpiError.Internal(`Failed to fetch permission`, { cause: error });
    }
  }

  return {
    // Data fetching utilities
    getPermission,
    getSubject,

    // Invalidation utilities
    invalidate,
    onInvalidate,

    // Pass types through
    $$types: {} as TKilpi["$$types"],
  };
}

export type KilpiClientInstance<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TPlugin extends KilpiPlugin
> = ReturnType<
  typeof createClient<{
    $$types: {
      subject: TSubject;
      ruleset: TRuleset;
      plugins: TPlugin;
    };
  }>
>;

export const KilpiClient = {
  createClient,
};
