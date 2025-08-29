import type { Decision } from "./decision";
import type { AnyKilpiCore } from "./KilpiCore";
import type { KilpiScope } from "./KilpiScope";
import type { InferPolicySubject } from "./policy";

/**
 * When no explicit context is available, Kilpi requests a scope to be provided. Any
 * `onRequestScope` hooks will be called when this happens and the first one to return a scope
 * will be used as the scope.
 */
export type KilpiOnRequestScopeHook<T extends AnyKilpiCore> = () => KilpiScope<T> | undefined;

/**
 * OnAfterAuthorization event
 */
export type KilpiOnAfterAuthorizationEvent<T extends AnyKilpiCore> = {
  /**
   * Source (Where was the authorization triggered from)
   */
  source: string;

  /**
   * Policy key to authorize
   */
  policy: string;

  /**
   * Current subject
   */
  subject: T["$$infer"]["subject"];

  /**
   * The resulting authorization object
   */
  authorization: Decision<InferPolicySubject<T["$$infer"]["policies"]>>;

  /**
   * The resource being authorized
   */
  resource?: unknown;
};

/**
 * Type of hook which is called after authorization has been performed.
 */
export type KilpiOnAfterAuthorizationHook<T extends AnyKilpiCore> = (
  event: KilpiOnAfterAuthorizationEvent<T>,
) => void;

export class KilpiHooks<T extends AnyKilpiCore> {
  /**
   * All registered hooks.
   */
  public registeredHooks: {
    onRequestScope: Set<KilpiOnRequestScopeHook<T>>;
    onAfterAuthorization: Set<KilpiOnAfterAuthorizationHook<T>>;
  };

  // Initialize with empty hooks.
  constructor() {
    this.registeredHooks = {
      onRequestScope: new Set(),
      onAfterAuthorization: new Set(),
    };
  }

  /**
   * Register a new `onRequestScope` hook. Returns an unsubscribe function.
   */
  public onRequestScope(hook: KilpiOnRequestScopeHook<T>) {
    this.registeredHooks.onRequestScope.add(hook);
    return () => this.registeredHooks.onRequestScope.delete(hook);
  }

  /**
   * Register a new `onAfterAuthorization` hook. Returns an unsubscribe function.
   */
  public onAfterAuthorization(hook: KilpiOnAfterAuthorizationHook<T>) {
    this.registeredHooks.onAfterAuthorization.add(hook);
    return () => this.registeredHooks.onAfterAuthorization.delete(hook);
  }
}
