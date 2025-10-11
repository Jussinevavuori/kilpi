import type { AnyKilpiCore } from "./KilpiCore";
import type { Decision, DeniedDecision, PolicysetActions } from "./types";
import type { MaybePromise } from "./utils/types";

// =================================================================================================
// EVENT TYPES
// =================================================================================================

/**
 * OnAfterAuthorization event
 */
export type KilpiOnAfterAuthorizationEvent<T extends AnyKilpiCore> = {
  /**
   * Action
   */
  action: PolicysetActions<T["$$infer"]["policies"]>;

  /**
   * Current subject
   */
  subject: T["$$infer"]["subject"];

  /**
   * The resulting decision object
   */
  decision: Decision<T["$$infer"]["subject"]>;

  /**
   * The object being authorized
   */
  object?: unknown;

  /**
   * The context used to resolve the subject (if provided)
   */
  context?: T["$$infer"]["context"];
};

/**
 * On subject resolved event
 */
export type KilpiOnSubjectResolvedEvent<T extends AnyKilpiCore> = {
  /**
   * The resolved subject
   */
  subject: T["$$infer"]["subject"];

  /**
   * Was the subject fetched from the cache
   */
  fromCache: boolean;

  /**
   * The context used to resolve the subject (if provided)
   */
  context?: T["$$infer"]["context"];
};

/**
 * On subject request from cache event
 */
export type KilpiOnSubjectRequestFromCacheEvent<T extends AnyKilpiCore> = {
  /**
   * The context used to resolve the subject (if provided)
   */
  context?: T["$$infer"]["context"];
};

/**
 * OnUnauthorizedAssert event
 */
export type KilpiOnUnauthorizedAssertEvent<T extends AnyKilpiCore> = {
  /**
   * The resulting decision object
   */
  decision: DeniedDecision;

  /**
   * Action (if provided)
   */
  action?: PolicysetActions<T["$$infer"]["policies"]>;

  /**
   * Current subject (if provided)
   */
  subject: T["$$infer"]["subject"] | null;

  /**
   * The context used to resolve the subject (if provided)
   */
  context?: T["$$infer"]["context"];

  /**
   * The object being authorized
   */
  object?: unknown;
};

// =================================================================================================
// HOOK TYPES fn: (Event => Return Type)
// =================================================================================================

/**
 * Type of hook which is called after authorization has been performed.
 */
export type KilpiOnAfterAuthorizationHook<T extends AnyKilpiCore> = (
  event: KilpiOnAfterAuthorizationEvent<T>,
) => void;

/**
 * Type of hook which is called after the subject has been resolved.
 */
export type KilpiOnSubjectResolvedHook<T extends AnyKilpiCore> = (
  event: KilpiOnSubjectResolvedEvent<T>,
) => void;

/**
 * Type of hook which is called when the subject is requested from cache.
 */
export type KilpiOnSubjectRequestFromCacheHook<T extends AnyKilpiCore> = (
  event: KilpiOnSubjectRequestFromCacheEvent<T>,
) => MaybePromise<
  | null // Cache miss
  | undefined // Cache miss
  | { subject: T["$$infer"]["subject"] } // Cached hit
>;

/**
 * Type of hook which is called when an unauthorized assertion is made.
 */
export type KilpiOnUnauthorizedAssertHook<T extends AnyKilpiCore> = (
  event: KilpiOnUnauthorizedAssertEvent<T>,
) => MaybePromise<
  | void // Do nothing (or side effects)
  | never // Throw to interrupt the flow
>;

// =================================================================================================
// KILPI HOOKS CLASS
// =================================================================================================

/**
 * KilpiHooks class manages all registered hooks inside the KilpiCore instance.
 */
export class KilpiHooks<T extends AnyKilpiCore> {
  /**
   * All registered hooks.
   */
  public registeredHooks: {
    onAfterAuthorization: Set<KilpiOnAfterAuthorizationHook<T>>;
    onSubjectResolved: Set<KilpiOnSubjectResolvedHook<T>>;
    onSubjectRequestFromCache: Set<KilpiOnSubjectRequestFromCacheHook<T>>;
    onUnauthorizedAssert: Set<KilpiOnUnauthorizedAssertHook<T>>;
  };

  // Initialize with empty hooks.
  constructor() {
    this.registeredHooks = {
      onAfterAuthorization: new Set(),
      onSubjectResolved: new Set(),
      onSubjectRequestFromCache: new Set(),
      onUnauthorizedAssert: new Set(),
    };
  }

  /**
   * Register a new `onAfterAuthorization` hook. Returns an unsubscribe function.
   */
  public onAfterAuthorization(hook: KilpiOnAfterAuthorizationHook<T>) {
    this.registeredHooks.onAfterAuthorization.add(hook);
    return () => this.registeredHooks.onAfterAuthorization.delete(hook);
  }

  /**
   * Register a new `onSubjectResolved` hook. Returns an unsubscribe function.
   */
  public onSubjectResolved(hook: KilpiOnSubjectResolvedHook<T>) {
    this.registeredHooks.onSubjectResolved.add(hook);
    return () => this.registeredHooks.onSubjectResolved.delete(hook);
  }

  /**
   * Register a new `onSubjectRequestFromCache` hook. Returns an unsubscribe function.
   */
  public onSubjectRequestFromCache(hook: KilpiOnSubjectRequestFromCacheHook<T>) {
    this.registeredHooks.onSubjectRequestFromCache.add(hook);
    return () => this.registeredHooks.onSubjectRequestFromCache.delete(hook);
  }

  /**
   * Register a new `onUnauthorizedAssert` hook. Returns an unsubscribe function.
   */
  public onUnauthorizedAssert(hook: KilpiOnUnauthorizedAssertHook<T>) {
    this.registeredHooks.onUnauthorizedAssert.add(hook);
    return () => this.registeredHooks.onUnauthorizedAssert.delete(hook);
  }

  /**
   * Unregister all hooks. Optionally provide a type of hook to unregister only that type.
   */
  public unregisterAll(ofType?: keyof KilpiHooks<T>["registeredHooks"]) {
    // Get all hook types to unregister
    type HookType = keyof KilpiHooks<T>["registeredHooks"];
    const hookTypes = Object.keys(this.registeredHooks) as HookType[];

    // Unregister each (unless only one specified)
    for (const hookType of hookTypes) {
      if (ofType === undefined || ofType === hookType) {
        this.registeredHooks[hookType].clear();
      }
    }
  }
}
