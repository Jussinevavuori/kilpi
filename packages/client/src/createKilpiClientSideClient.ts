import {
  GetRuleByKey,
  InferRuleGuardedSubject,
  InferRuleResource,
  KilpiCore,
  KilpiError,
  Permission,
  RulesetKeys,
} from "@kilpi/core";
import type { KilpiServerClient } from "@kilpi/server";
import { z } from "zod";
import { createBatcher } from "./createBatcher";
import { createCache } from "./createCache";
import { sendEndpointRequest } from "./sendEndpointRequest";

/**
 * Client-side client construction options
 */
export type CreateKilpiClientSideClientOptions = {
  secret: string;
  endpoint: string;
};

/**
 * Type of client-side client
 */
export type KilpiClientSideClient<
  TKilpiServerClient extends KilpiServerClient<KilpiCore<any, any, any>>
> = ReturnType<typeof createKilpiClientSideClient<TKilpiServerClient>>;

export type AnyKilpiClientSideClient = KilpiClientSideClient<
  KilpiServerClient<KilpiCore<any, any, any>>
>;

/**
 * Create a server client.
 */
export function createKilpiClientSideClient<
  TKilpiServerClient extends KilpiServerClient<KilpiCore<any, any, any>>
>(options: CreateKilpiClientSideClientOptions) {
  // Ensure secret and endpoint provided
  if (!options.secret) throw new KilpiError.InvalidSetup(`No secret provided to Kilpi client.`);
  if (!options.endpoint) throw new KilpiError.InvalidSetup(`No endpoint provided to Kilpi client.`);

  // Extract types
  type TSubject = Awaited<ReturnType<TKilpiServerClient["core"]["getSubject"]>>;
  type TRuleset = TKilpiServerClient["core"]["ruleset"];

  // Data cache
  const cache = createCache<any>();

  /**
   * Get the subject. Calls are deduped and cached.
   */
  async function getSubject(): Promise<TSubject> {
    const cacheKey = ["subject"];
    try {
      // Cache hit
      const cached = cache.get(["subject"]);
      if (cached) return cached;

      // Cache miss, fetch and cache (cache promise to dedupe calls)
      const result = await sendEndpointRequest<TSubject>({ action: "fetchSubject" }, options);
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new KilpiError.Internal(`Failed to get subject`, { cause: error });
    }
  }

  /**
   * Enable batched permission fetching
   */
  const fetchPermissionBatcher = createBatcher(
    async (rules: Array<{ key: string; resource: any }>) => {
      // Get response
      const response = await sendEndpointRequest(
        { action: "fetchPermissions", rules },
        { secret: options.secret, endpoint: options.endpoint }
      );

      // Setup schema for parsing data
      const jsonSchema = z
        .discriminatedUnion("granted", [
          z.object({ granted: z.literal(false), message: z.string().optional() }),
          z.object({ granted: z.literal(true), subject: z.any() }),
        ])
        .array()
        .min(1);

      // Return result if data was succesfully parsed
      const result = jsonSchema.safeParse(response);
      if (!result.success) {
        throw new KilpiError.FetchPermissionFailed(`Invalid response from Kilpi endpoint.`);
      }
      return result.data;
    }
  );

  /**
   * Gets a single permission. All calls are deduped, cached and batched.
   */
  async function getPermission<TKey extends RulesetKeys<TRuleset>>(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ) {
    type PermissionResult = Permission<InferRuleGuardedSubject<GetRuleByKey<TRuleset, TKey>>>;
    try {
      // Attempt cache hit
      const cacheKey = ["permission", key, resource];
      const cached = cache.get(cacheKey);
      if (cached) return cached as PermissionResult;

      // Cache miss, fetch and cache
      const result = await fetchPermissionBatcher.enqueueJob({ key, resource });
      cache.set(cacheKey, result);
      return result as PermissionResult;
    } catch (error) {
      throw new KilpiError.Internal(`Failed to fetch permission`, { cause: error });
    }
  }

  return {
    // API
    getSubject,
    getPermission,

    // Cache invalidation utilities
    invalidate: cache.invalidateAll(),
    onInvalidate: (callback: () => void) => {
      cache.onEvent((event) => {
        if (event.type === "invalidateAll") {
          callback();
        }
      });
    },

    // Expose type utilities
    $$infer: null as unknown as TKilpiServerClient["core"]["$$infer"],
  };
}
