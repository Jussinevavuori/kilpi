// =================================================================================================
// EVENT TYPES
// =================================================================================================

import type { AnyKilpiClient } from "./KilpiClient";
import type { MaybePromise } from "./types";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * On before send request event
 */
export type KilpiOnBeforeSendRequestEvent<T extends AnyKilpiClient> = {};

/**
 * On cache invalidate event
 */
export type KilpiOnCacheInvalidateEvent<T extends AnyKilpiClient> = {
  path: unknown[];

  /**
   * Utility function to check if a given key matches the invalidated path
   */
  matches(key: string | unknown[] | { $cacheKey: string | unknown[] }): boolean;
};

// =================================================================================================
// HOOK TYPES fn: (Event => Return Type)
// =================================================================================================

/**
 * Type of hook which is called before a request is sent to the Kilpi endpoint. Allows for injecting
 * e.g. headers.
 */
export type KilpiOnBeforeSendRequestHook<T extends AnyKilpiClient> = (
  event: KilpiOnBeforeSendRequestEvent<T>,
) => MaybePromise<void | undefined | Partial<{ headers: Record<string, string> }>>;

/**
 * Type of hook which is called when the cache is invalidated.
 */
export type KilpiOnCacheInvalidateHook<T extends AnyKilpiClient> = (
  event: KilpiOnCacheInvalidateEvent<T>,
) => MaybePromise<void | undefined>;

// =================================================================================================
// KILPI HOOKS CLASS
// =================================================================================================

/**
 * KilpiHooks class manages all registered hooks inside the KilpiCore instance.
 */
export class KilpiClientHooks<T extends AnyKilpiClient> {
  /**
   * All registered hooks.
   */
  public registeredHooks: {
    onBeforeSendRequest: Set<KilpiOnBeforeSendRequestHook<T>>;
    onCacheInvalidate: Set<KilpiOnCacheInvalidateHook<T>>;
  };

  // Initialize with empty hooks.
  constructor() {
    this.registeredHooks = {
      onBeforeSendRequest: new Set<KilpiOnBeforeSendRequestHook<T>>(),
      onCacheInvalidate: new Set<KilpiOnCacheInvalidateHook<T>>(),
    };
  }

  /**
   * Register a new `onBeforeSendRequest` hook. Returns an unsubscribe function.
   */
  public onBeforeSendRequest(hook: KilpiOnBeforeSendRequestHook<T>) {
    this.registeredHooks.onBeforeSendRequest.add(hook);
    return () => void this.registeredHooks.onBeforeSendRequest.delete(hook);
  }

  /**
   * Register a new `onCacheInvalidate` hook. Returns an unsubscribe function.
   */
  public onCacheInvalidate(hook: KilpiOnCacheInvalidateHook<T>) {
    this.registeredHooks.onCacheInvalidate.add(hook);
    return () => void this.registeredHooks.onCacheInvalidate.delete(hook);
  }

  /**
   * Unregister all hooks. Optionally provide a type of hook to unregister only that type.
   */
  public unregisterAll(ofType?: keyof KilpiClientHooks<T>["registeredHooks"]) {
    // Get all hook types to unregister
    type HookType = keyof KilpiClientHooks<T>["registeredHooks"];
    const hookTypes = Object.keys(this.registeredHooks) as HookType[];

    // Unregister each (unless only one specified)
    for (const hookType of hookTypes) {
      if (ofType === undefined || ofType === hookType) {
        this.registeredHooks[hookType].clear();
      }
    }
  }
}
