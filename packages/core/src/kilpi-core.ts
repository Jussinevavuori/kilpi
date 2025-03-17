import { AsyncLocalStorage } from "async_hooks";
import type { Authorization } from "./authorization";
import { KilpiError } from "./error";
import type { KilpiAdapter, KilpiAdapterInitializer } from "./kilpi-adapter";
import type { KilpiQueryProtector } from "./kilpi-query";
import { KilpiQuery } from "./kilpi-query";
import { type KilpiRequestContext } from "./kilpi-request-context";
import type { InferPolicyInputs, InferPolicySubject } from "./policy";
import type { GetPolicyByKey, Policyset, PolicysetKeys } from "./policy-set";
import { getPolicyByKey } from "./policy-set";
import { createCallStackSizeProtector } from "./utils/call-stack-size-protector";
import type { ArrayHead } from "./utils/types";

/**
 * Arguments passed to construct a KilpiCore instance.
 */
export type KilpiConstructorArgs<
  TSubject extends object | null | undefined,
  TPolicyset extends Policyset<TSubject>,
> = {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Connect your framework of choice with an adapter. Primarily responsible for automatically
   * prodiving a request context.
   */
  adapter?: KilpiAdapterInitializer;

  /**
   * Default behaviour when no context is provided (either explicitly or via adapter).
   */
  defaults?: KilpiRequestContext;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;
};

/**
 * The KilpiCore class is the primary interface for interacting with the Kilpi library.
 */
export class KilpiCore<
  TSubject extends object | null | undefined,
  TPolicyset extends Policyset<TSubject>,
> {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Connect your framework of choice with an adapter. Primarily responsible for automatically
   * prodiving a request context.
   */
  adapter?: KilpiAdapter;

  /**
   * Default behaviour when no context is provided (either explicitly or via adapter).
   */
  defaults?: KilpiRequestContext;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * AsyncLocalStorage for running values with an explicit context. Used via
   * `KilpiCore.runWithContext()` which is used to wrap a function with a mutable context.
   */
  private contextAsyncLocalStorage: AsyncLocalStorage<KilpiRequestContext>;

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
    // Run construct function with constructor
    // Assign properties to instance
    this.getSubject = args.getSubject;
    this.policies = args.policies;
    this.defaults = args.defaults;

    // Initialize adapter
    this.adapter = args.adapter?.({
      defaults: args.defaults,
    });

    // Setup async local storage
    this.contextAsyncLocalStorage = new AsyncLocalStorage();
  }

  /**
   * Internal utility function to access a property from the context. This function attempts to
   * resolve the property as follows:
   *
   * 1. Get property from explicit context (via AsyncLocalStorage) if possible. Else...
   * 2. Get property from adapter context if possible. Else...
   * 3. Get property from defaults if possible. Else...
   * 4. Return undefined.
   */
  private getPropertyFromContext<TProperty extends keyof KilpiRequestContext>(
    property: TProperty,
  ): KilpiRequestContext[TProperty] {
    // Attempt to resolve value from explicit async local storage context
    const valueFromExplicitCtx =
      this.contextAsyncLocalStorage.getStore()?.[property];
    if (valueFromExplicitCtx) return valueFromExplicitCtx;

    // Attempt to resolve value from adapter context
    const valueFromAdapterCtx = this.adapter?.getContext()?.[property];
    if (valueFromAdapterCtx) return valueFromAdapterCtx;

    // Finally, resolve value from defaults
    return this.defaults?.[property];
  }

  /**
   * Utility to access the current context for mutation purposes. Returns the explicit context
   * via async local storage if available, else the adapter context if available. If neither,
   * returns null as the default values for the context are immutable.
   */
  private getMutableContext() {
    // Resolve to explicit async local storage context if available
    const asyncLocalStorageContext = this.contextAsyncLocalStorage.getStore();
    if (asyncLocalStorageContext) return asyncLocalStorageContext;

    // Resolve to adapter context if available
    const adapterContext = this.adapter?.getContext();
    if (adapterContext) return adapterContext;

    // No context found: we cannot mutate defaults
    return null;
  }

  /**
   * Run a function with an explicit mutable context. Use in e.g. server middlewares.
   *
   * @example
   * ```ts
   * const middleware = async (ctx) => {
   *   const response = Kilpi.runWithContext(async () => {
   *     // Value is saved in the explicit context
   *     Kilpi.onUnauthorized(() => throw new HttpUnauthorizedError());
   *     return await next();
   *   })
   * }
   * ```
   *
   * Uses AsyncLocalStorage.run to run a function with an explicit context.
   */
  public async runWithContext<T>(fn: () => Promise<T>): Promise<T> {
    return await this.contextAsyncLocalStorage.run({ ...this.defaults }, fn);
  }

  /**
   * Utility to set the new on unauthorized handler for the context
   */
  public onUnauthorized(handler: KilpiRequestContext["onUnauthorized"]) {
    const mutableContext = this.getMutableContext();

    /**
     * Mutable context was not available. Attempting mutation will have no effect.
     */
    if (!mutableContext) {
      console.warn(
        [
          "Attempting to set onUnauthorized handler without a mutable context.",
          "This will have no effect and the default handler will be used instead.",
          "Ensure that you are either:",
          "(a) using Kilpi.runWithContext to provide a mutable context, or",
          "(b) running in an environment automatically supported by your adapter if you have provided one.",
        ].join(" "),
      );
      return;
    }

    mutableContext.onUnauthorized = handler;
  }

  /**
   * Evaluate a policy and return the full authorization object.
   *
   * @param key The key of the policy to evaluate
   * @param inputs The resource (if any) to provide to the policy.
   * @returns The full authorization object as a promise.
   */
  async getAuthorization<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ): Promise<
    Authorization<InferPolicySubject<GetPolicyByKey<TPolicyset, TKey>>>
  > {
    // Evaluate policy within infinite loop protection
    const { authorization } = await KilpiCore.CallStackSizeProtector.run(
      async () => {
        const subject = await this.getSubject();
        const policy = getPolicyByKey(this.policies, key);
        const authorization = await policy(subject, ...[...inputs]);
        return { authorization };
      },
    );

    // Return the authorization object
    return authorization;
  }

  /**
   * Check if a user passes a policy.
   *
   * @param key The key of the policy to evaluate
   * @param inputs The resource (if any) to provide to the policy.
   * @returns A boolean indicating whether the user passes the policy.
   */
  async isAuthorized<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ): Promise<boolean> {
    // Evaluate policy within infinite loop protection
    const { authorization } = await KilpiCore.CallStackSizeProtector.run(
      async () => {
        const subject = await this.getSubject();
        const policy = getPolicyByKey(this.policies, key);
        const authorization = await policy(subject, ...[...inputs]);
        return { authorization };
      },
    );

    // Return the granted status
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
   */
  async authorize<TKey extends PolicysetKeys<TPolicyset>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<TPolicyset, TKey>>
  ): Promise<InferPolicySubject<GetPolicyByKey<TPolicyset, TKey>>> {
    // Evaluate policy within infinite loop protection
    const { subject, policy, authorization } =
      await KilpiCore.CallStackSizeProtector.run(async () => {
        const subject = await this.getSubject();
        const policy = getPolicyByKey(this.policies, key);
        const authorization = await policy(subject, ...[...inputs]);
        return { subject, policy, authorization };
      });

    // Granted, return the narrowed down subject
    if (authorization.granted) return authorization.subject;

    // Denied: run onUnauthorized handler if provided to throw custom error (e.g. redirection,
    // HTTP error).
    const handleUnauthorized = this.getPropertyFromContext("onUnauthorized");
    await handleUnauthorized?.({
      message: authorization.message,
      policy,
      subject,
    });

    // Denied: Default behaviour is to throw a KilpiError.AuthorizationDenied when no other
    // handler is provided (in defaults, in explicit context, in adapter).
    throw new KilpiError.AuthorizationDenied(
      authorization.message ?? "Unauthorized",
    );
  }

  /**
   * Utility to filter resources to only those resources that pass the policy.
   *
   * @usage
   * ```ts
   * // Return only resources which the user is authorized to read
   * const unauthorizedResources = await listResources();
   * return await Kilpi.filter("resource:read", unauthorizedResources);
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
