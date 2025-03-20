import { AsyncLocalStorage } from "async_hooks";
import { KilpiError } from "./error";
import type { KilpiConstructorArgs } from "./kilpi-constructor-args";
import type { KilpiPlugin } from "./kilpi-plugin";
import type { KilpiQueryProtector } from "./kilpi-query";
import { KilpiQuery } from "./kilpi-query";
import {
  type KilpiOnUnauthorizedHandler,
  type KilpiScope,
} from "./kilpi-scope";
import type {
  GetPolicyByKey,
  InferPolicyInputs,
  InferPolicySubject,
  Policyset,
  PolicysetKeys,
} from "./policy";
import { getPolicyByKey } from "./policy";
import { createCallStackSizeProtector } from "./utils/call-stack-size-protector";
import type { ArrayHead } from "./utils/types";

// Utility for logging a warning when no scope is available.
const noScopeWarning = (msg: string) =>
  console.warn(
    [
      msg,
      "No scope available.",
      "\n",
      `(Attempting to access current Kilpi scope, but no scope is available.`,
      `Provide a Kilpi scope either with a plugin or manually via Kilpi.runInScope().`,
      `Read mode: https://kilpi.vercel.app/concepts/scope)`,
    ].join(" "),
  );

/**
 * The KilpiCore class is the primary interface for interacting with the Kilpi library.
 */
export class KilpiCore<TSubject, TPolicyset extends Policyset<TSubject>> {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * This will be automatically cached within each scope unless `advanced.disableSubjectCaching`.
   */
  uncached_getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Default behaviour when no value is available from a scope.
   */
  defaults?: KilpiScope<TSubject, TPolicyset>;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * All plugins
   */
  plugins: KilpiPlugin<TSubject, TPolicyset, Record<never, never>>[];

  /**
   * AsyncLocalStorage for running values in an explicit scope.
   *
   * Applied via `KilpiCore.runInScope()`.
   */
  private scopeStorage: AsyncLocalStorage<KilpiScope<TSubject, TPolicyset>>;

  /**
   * Advanced settings
   */
  advanced: KilpiConstructorArgs<TSubject, TPolicyset>["advanced"];

  /**
   * Inferring utilities. Do not use at runtime.
   */
  public $$infer = null as unknown as {
    subject: TSubject;
    policies: TPolicyset;
  };

  /**
   * New instance
   */
  constructor(args: KilpiConstructorArgs<TSubject, TPolicyset>) {
    this.uncached_getSubject = args.getSubject;
    this.policies = args.policies;
    this.defaults = args.defaults;
    this.scopeStorage = new AsyncLocalStorage();
    this.advanced = args.advanced;

    // Instantiate all plugins
    this.plugins = args.plugins?.map((instantiate) => instantiate(this)) ?? [];
  }

  /**
   * Utility to get the subject, with a cache in the current scope.
   */
  public async getSubject(): Promise<TSubject> {
    // Respect advanced.disableSubjectCaching
    if (this.advanced?.disableSubjectCaching) {
      return await this.uncached_getSubject();
    }

    // Cache hit in current scope
    const subjectCache = this.resolveScope()?.subjectCache;
    if (subjectCache) return subjectCache.subject;

    // Cache miss, fetch the subject
    const subject = await this.uncached_getSubject();

    // Cache to current scope or warn
    const scope = this.resolveScope();
    if (scope) {
      scope.subjectCache = { subject };
    } else {
      noScopeWarning("Kilpi: getSubject() could not be cached.");
    }

    // Return the subject
    return subject;
  }

  /**
   * Internal utility to resolve the current scope. Prioritizes the current explicit scope from
   * `scopeStorage` if available, then the plugin scopes.
   */
  private resolveScope(): KilpiScope<TSubject, TPolicyset> | null {
    const explicitScope = this.scopeStorage.getStore();
    if (explicitScope) return explicitScope;

    // Fallback to any plugin scope if available
    for (const plugin of this.plugins) {
      const pluginScope = plugin.getScope?.();
      if (pluginScope) return pluginScope;
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
    if (scope) {
      scope.onUnauthorized = handler;
    } else {
      noScopeWarning(`Kilpi: onUnauthorized handler not set.`);
    }
  }

  /**
   * Internal utility called by all authorization functions. Gets the subject, resolves
   * the policy by key and evaluates the policy. Returns all authorization information.
   */
  async evaluateAuthorization<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ) {
    // Evaluate policy within infinite loop protection
    return await KilpiCore.CallStackSizeProtector.run(async () => {
      // Get the current subject (cached)
      const subject = await this.getSubject();

      // Resolve the policy function by key
      const policy = getPolicyByKey(this.policies, key);

      // Evaluate the policy
      const authorization = await policy(subject, ...[...inputs]);

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
    const { authorization } = await this.evaluateAuthorization(key, ...inputs);
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
    const { authorization } = await this.evaluateAuthorization(key, ...inputs);
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
    const authorization = await this.getAuthorization(key, ...inputs);

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
    TResource extends ArrayHead<
      InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
    >,
  >(key: TKey, resources: TResource[]) {
    const subject = await this.getSubject();
    const policy = getPolicyByKey(this.policies, key);

    // Collect all resources which passed authorization here.
    const authorizedResources: TResource[] = [];

    // Evaluate policies in parallel inside infinite loop detection.
    await KilpiCore.CallStackSizeProtector.run(async () =>
      Promise.all(
        resources.map(async (resource) => {
          const authorization = await policy(subject, resource);
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
      protector?: KilpiQueryProtector<
        TInput,
        TRawOutput,
        TRedactedOutput,
        TSubject
      >;
    } = {},
  ) {
    // Implemented in a KilpiQuery class.
    return new KilpiQuery<this, TInput, TRawOutput, TRedactedOutput>(
      this,
      query,
      options,
    );
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
