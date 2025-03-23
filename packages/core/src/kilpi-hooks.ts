import type { Authorization } from "./authorization";
import type { AnyKilpiCore } from "./kilpi-core";
import type { KilpiScope } from "./kilpi-scope";
import type { InferPolicySubject } from "./policy";

/**
 * When no explicit context is available, Kilpi requests a scope to be provided. Any
 * `onRequestScope` hooks will be called when this happens and the first one to return a scope
 * will be used as the scope.
 */
export type KilpiOnRequestScopeHook<T extends AnyKilpiCore> = () => KilpiScope<T> | undefined;

/**
 * Type of hook which is called before authorization is performed.
 */
export type KilpiOnBeforeAuthorizationHook<T extends AnyKilpiCore> = (event: {
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
}) => void;

/**
 * Type of hook which is called after authorization has been performed.
 */
export type KilpiOnAfterAuthorizationHook<T extends AnyKilpiCore> = (event: {
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
  authorization: Authorization<InferPolicySubject<T["$$infer"]["policies"]>>;
}) => void;

export class KilpiHooks<T extends AnyKilpiCore> {
  /**
   * All registered hooks.
   */
  public registeredHooks: {
    onRequestScope: Set<KilpiOnRequestScopeHook<T>>;
    onBeforeAuthorization: Set<KilpiOnBeforeAuthorizationHook<T>>;
    onAfterAuthorization: Set<KilpiOnAfterAuthorizationHook<T>>;
  };

  // Initialize with empty hooks.
  constructor() {
    this.registeredHooks = {
      onRequestScope: new Set(),
      onBeforeAuthorization: new Set(),
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
   * Register a new `onBeforeAuthorization` hook. Returns an unsubscribe function.
   */
  public onBeforeAuthorization(hook: KilpiOnBeforeAuthorizationHook<T>) {
    this.registeredHooks.onBeforeAuthorization.add(hook);
    return () => this.registeredHooks.onBeforeAuthorization.delete(hook);
  }

  /**
   * Register a new `onAfterAuthorization` hook. Returns an unsubscribe function.
   */
  public onAfterAuthorization(hook: KilpiOnAfterAuthorizationHook<T>) {
    this.registeredHooks.onAfterAuthorization.add(hook);
    return () => this.registeredHooks.onAfterAuthorization.delete(hook);
  }
}
