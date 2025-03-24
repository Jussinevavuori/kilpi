import { AsyncLocalStorage } from "async_hooks";
import { KilpiError } from "./error";
import { KilpiHooks } from "./KilpiHooks";
import type { KilpiQueryProtector } from "./KilpiQuery";
import { KilpiQuery } from "./KilpiQuery";
import {
  warnOnScopeUnavailable,
  type KilpiOnUnauthorizedHandler,
  type KilpiScope,
} from "./KilpiScope";
import type {
  GetPolicyByKey,
  InferPolicyInputs,
  InferPolicySubject,
  Policyset,
  PolicysetKeys,
} from "./policy";
import { getPolicyByKey } from "./policy";
import { createCallStackSizeProtector } from "./utils/callStackSizeProtector";
import type { ArrayHead } from "./utils/types";

/**
 * Arguments passed to construct a KilpiCore instance.
 */
export type KilpiConstructorArgs<TSubject, TPolicyset extends Policyset<TSubject>> = {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: () => Promise<TSubject>;

  /**
   * Default values when no value is available from a scope.
   */
  defaults?: Pick<KilpiScope<KilpiCore<TSubject, TPolicyset>>, "onUnauthorized">;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * Custom settings
   */
  settings?: {
    disableSubjectCaching?: boolean;
  };
};

/**
 * The KilpiCore class is the primary interface for interacting with the Kilpi library.
 */
export class KilpiCore<TSubject, TPolicyset extends Policyset<TSubject>> {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * This will be automatically cached within each scope unless `settings.disableSubjectCaching`.
   */
  private uncached_getSubject: () => Promise<TSubject>;

  /**
   * Default behaviour when no value is available from a scope.
   */
  public defaults?: KilpiConstructorArgs<TSubject, TPolicyset>["defaults"];

  /**
   * The policies which define the authorization logic of the application.
   */
  public policies: TPolicyset;

  /**
   * AsyncLocalStorage for running values in an explicit scope.
   *
   * Applied via `KilpiCore.runInScope()`.
   */
  private scopeStorage: AsyncLocalStorage<KilpiScope<typeof this>>;

  /**
   * settings
   */
  public settings: KilpiConstructorArgs<TSubject, TPolicyset>["settings"];

  /**
   * Inferring utilities. Do not use at runtime.
   */
  public $$infer = null as unknown as { subject: TSubject; policies: TPolicyset };

  /**
   * Current hooks
   */
  public hooks: KilpiHooks<typeof this>;

  /**
   * New instance
   */
  constructor(args: KilpiConstructorArgs<TSubject, TPolicyset>) {
    this.uncached_getSubject = args.getSubject;
    this.policies = args.policies;
    this.defaults = args.defaults;
    this.scopeStorage = new AsyncLocalStorage();
    this.settings = args.settings;
    this.hooks = new KilpiHooks();
  }

  /**
   * Utility to get the subject.
   *
   * Caches the subject in the current scope (if available) unless `settings.disableSubjectCaching`
   * is set to true.
   */
  public async getSubject(): Promise<TSubject> {
    // Respect settings.disableSubjectCaching
    if (this.settings?.disableSubjectCaching) {
      return await this.uncached_getSubject();
    }

    const scope = this.resolveScope();

    // Cache hit
    if (scope?.subjectCache) {
      return scope.subjectCache.subjectPromise;
    }

    // Cache miss: Populate cache
    const subjectPromise = this.uncached_getSubject();
    if (!scope) warnOnScopeUnavailable("Kilpi: getSubject() could not be cached.");
    else {
      scope.subjectCache = { subjectPromise };
    }

    return await subjectPromise;
  }

  /**
   * Internal utility to resolve the current scope. Prioritizes the current explicit scope from
   * `scopeStorage` if available. If not available, falls back to using scopes provided by e.g.
   * plugins via the `onRequestScope` hook.
   */
  public resolveScope(): KilpiScope<typeof this> | null {
    const explicitScope = this.scopeStorage.getStore();
    if (explicitScope) return explicitScope;

    // Fallback to onRequestScope hook
    for (const hook of this.hooks.registeredHooks.onRequestScope) {
      const scope = hook();
      if (scope) return scope;
    }

    // No scope available
    return null;
  }

  /**
   * Run a function with an explicit scope. Use in e.g. server middlewares to scope Kilpi
   * to a single request.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const middleware = async (ctx, next) => {
   *   const response = Kilpi.runInScope(async () => {
   *     // This value is saved to the current scope
   *     Kilpi.onUnauthorized(() => { throw new HttpUnauthorizedError(); });
   *     return await next();
   *   })
   * }
   * ```
   */
  public async runInScope<T>(fn: () => Promise<T>): Promise<T> {
    return await this.scopeStorage.run({}, fn);
  }

  /**
   * Utility to set the new on unauthorized handler in the current scope
   *
   * ## Example
   *
   * @example
   * ```ts
   * Kilpi.runInScope(() => {
   *   Kilpi.onUnauthorized(() => redirect("/"));
   *   Kilpi.authorize(...); // Redirects to "/" on failure
   * })
   * ```
   */
  public onUnauthorized(handler: KilpiOnUnauthorizedHandler) {
    const scope = this.resolveScope();

    if (!scope) {
      warnOnScopeUnavailable(`Kilpi: onUnauthorized handler not set.`);
      return;
    }

    scope.onUnauthorized = handler;
  }

  /**
   * Internal utility called by all authorization functions. Gets the subject, resolves
   * the policy by key and evaluates the policy. Returns all authorization information.
   */
  async evaluateAuthorization<TKey extends PolicysetKeys<TPolicyset>>(
    options: { source: string },
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ) {
    // Evaluate policy within infinite loop protection
    return await KilpiCore.CallStackSizeProtector.run(async () => {
      // Get the current subject (cached)
      const subject = await this.getSubject();

      // Resolve the policy function by key
      const policy = getPolicyByKey(this.policies, key);

      // Run `onBeforeAuthorization` hooks
      this.hooks.registeredHooks.onBeforeAuthorization.forEach((hook) => {
        hook({ source: options.source, policy: key, subject });
      });

      // Evaluate the policy
      const authorization = await policy(subject, ...[...inputs]);

      // Run `onAfterAuthorization` hooks
      this.hooks.registeredHooks.onAfterAuthorization.forEach((hook) => {
        hook({ source: options.source, policy: key, subject, authorization });
      });

      // Return all relevant data
      return { authorization, policy, subject };
    });
  }

  /**
   * Evaluate a policy and return the full authorization object.
   *
   * @param key The key of the policy to evaluate
   * @param inputs The resource (if any) to provide to the policy.
   * @returns The full authorization object as a promise.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const authorization = await Kilpi.getAuthorization("resource:read", resource);
   * if (authorization.granted) {
   *   console.log(`User ${authorization.subject.id} can read resource ${resource.id}`);
   * } else {
   *   console.log(`Can not read resource: ${authorization.message}`);
   * }
   * ```
   */
  async getAuthorization<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ) {
    // Evaluate policy and return the authorization object
    const { authorization } = await this.evaluateAuthorization(
      { source: "getAuthorization" },
      key,
      ...inputs,
    );
    return authorization;
  }

  /**
   * Check if a user passes a policy.
   *
   * @param key The key of the policy to evaluate
   * @param inputs The resource (if any) to provide to the policy.
   * @returns A boolean indicating whether the user passes the policy.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const isAuthorized = await Kilpi.isAuthorized("resource:update", resource);
   * if (isAuthorized) {
   *   await updateResource();
   * }
   * ```
   */
  async isAuthorized<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ): Promise<boolean> {
    // Evaluate policy and return the granted boolean
    const { authorization } = await this.evaluateAuthorization(
      { source: "isAuthorized" },
      key,
      ...inputs,
    );
    return authorization.granted;
  }

  /**
   * Check if a user passes a policy. If yes, returns the narrowed down subject. Else,
   * throws.
   *
   * @param key The key of the policy to evaluate
   * @param inputs The resource (if any) to provide to the policy.
   * @returns The narrowed down subject if the user passes the policy.
   * @throws KilpiError.AuthorizationDenied if the user does not pass the policy, or other
   * value defined in `.onUnauthorized(...)`.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const user = await Kilpi.authorize("resource:update", resource);
   *
   * // User is authorized to update the resource. If not, `Kilpi.authorize` will have thrown
   * // or the custom `.onUnauthorized(...)` handler will have been called.
   * await updateResource(resource, user);
   * ```
   */
  async authorize<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ): Promise<InferPolicySubject<GetPolicyByKey<TPolicyset, TKey>>> {
    // Evaluate policy and get the authorization object
    const { authorization } = await this.evaluateAuthorization(
      { source: "authorize" },
      key,
      ...inputs,
    );

    // Granted, return the narrowed down subject and escape early
    if (authorization.granted) {
      return authorization.subject;
    }

    // Unauthorized
    this.unauthorized(authorization.message ?? "Unauthorized");
  }

  /**
   * When a manually defined authorization check fails, trigger the `onUnauthorized` procedure
   * similarly as with `.authorize()` with this function.
   *
   * @param message The optional message to pass to the onUnauthorized handler.
   * @throws KilpiError.AuthorizationDenied if the user does not pass the policy, or other
   * value defined in `.onUnauthorized(...)`.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const user = await Kilpi.getSubject();
   * if (!user) await Kilpi.unauthorized();
   *
   * // User is authed.
   * await updateResource(resource, user);
   * ```
   */
  unauthorized(message = "Unauthorized"): never {
    // Run onUnauthorized handler in current scope if available
    this.resolveScope()?.onUnauthorized?.({ message });

    // Run default onUnauthorized handler if available
    this.defaults?.onUnauthorized?.({ message });

    // Throw by default
    throw new KilpiError.AuthorizationDenied(message);
  }

  /**
   * Utility to filter resources to only those resources that pass the policy. Requires a rule
   * that takes in a resource.
   *
   * ## Example
   *
   * @example
   * ```ts
   * // Policy must take in a resource
   * const Kilpi = createKilpi({
   *   ...,
   *   policies: {
   *     resources: {
   *       read: SomePolicy((user, resource) => ...),
   *     }
   *   }
   * })
   *
   * // Return only resources which the user is authorized to read
   * const unauthorizedResources = await listResources();
   * const authorizedResources = await Kilpi.filter("resource:read", unauthorizedResources);
   *
   * // Or apply already in protected query and call vai `.protect()`
   * const listResources = Kilpi.query(
   *   async () => await db.listResources(),
   *   {
   *     async protector({ output: resources }) {
   *       return await Kilpi.filter("resource:read", resources);
   *     }
   *   }
   * )
   * const authorizedResources = listResources.protect();
   * ```
   */
  async filter<
    TKey extends PolicysetKeys<TPolicyset>,
    TResource extends ArrayHead<InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>>,
  >(key: TKey, resources: TResource[]) {
    // Get the current subject (cached)
    const subject = await this.getSubject();

    // Resolve the policy function by key
    const policy = getPolicyByKey(this.policies, key);

    // Collect all resources which passed authorization here.
    const authorizedResources: TResource[] = [];

    // Evaluate policies in parallel inside infinite loop detection.
    await KilpiCore.CallStackSizeProtector.run(async () =>
      Promise.all(
        resources.map(async (resource) => {
          // Run `onBeforeAuthorization` hooks
          this.hooks.registeredHooks.onBeforeAuthorization.forEach((hook) => {
            hook({ source: "filter", policy: key, subject });
          });

          const authorization = await policy(subject, resource);

          // Run `onAfterAuthorization` hooks
          this.hooks.registeredHooks.onAfterAuthorization.forEach((hook) => {
            hook({ source: "filter", policy: key, subject, authorization });
          });

          if (authorization.granted) {
            authorizedResources.push(resource);
          }
        }),
      ),
    );

    // Return all authorized resources.
    return authorizedResources;
  }

  /**
   * Create a protected query. Provide a query function [1] as the first argument and optionally
   * provide a protector function as the second argument. The protector funciton can protect in
   * two ways:
   *
   * 1. Throw on unauthorized, e.g. via `Kilpi.authorize(...)`.
   * 2. Return redacted / filtered data.
   *
   * The query can then be accessed by `MyQuery.protect(...)`, which first runs the raw query,
   * after which the protector function is run or via `MyQuery.unsafe(...)` which runs the raw
   * query without any protection.
   */
  public query<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInput extends any[],
    TRawOutput,
    TRedactedOutput = TRawOutput,
  >(
    query: (...args: TInput) => TRawOutput,
    options: {
      protector?: KilpiQueryProtector<TInput, TRawOutput, TRedactedOutput, TSubject>;
    } = {},
  ) {
    // Implemented in a KilpiQuery class.
    return new KilpiQuery<this, TInput, TRawOutput, TRedactedOutput>(this, query, options);
  }

  /**
   * Utility for extending the current instance (uses `Object.assign(this, ...)` under the hood.)
   */
  public extend<T extends object>(extension: T) {
    return Object.assign(this, extension);
  }

  /**
   * Call stack size protector to provide helpful error messages to user if they accidentally call
   * protect() (or a protected query) within a protect() call, which causes an infinite loop. This
   * may happen e.g. due to calling protect() or a protected query within the `getSubject` function
   * or a policy evaulator function.
   */
  private static CallStackSizeProtector = createCallStackSizeProtector({
    maxStackSize: 50,
    errorMessage: `
			Kilpi.protect() called too many times recursively -- potential infinite loop
			detected. This is usually caused by calling protect() or a protected query
			with query.protect() or query.safe() in getSubject() or a poliy. These cause
			an infinite loop. Ensure all policies and the getSubject function do not call
			protect() or protected queries with .protect() or .safe().
		`.replace(/\s+/g, " "), // Normalize whitespace
  });
}

// Utility type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyKilpiCore = KilpiCore<any, any>;
