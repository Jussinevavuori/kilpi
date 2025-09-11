import { AsyncLocalStorage } from "async_hooks";
import type { DeniedDecision } from "./decision";
import { KilpiError } from "./error";
import { KilpiHooks } from "./KilpiHooks";
import type { KilpiQueryProtector } from "./KilpiQuery";
import { KilpiQuery } from "./KilpiQuery";
import {
  KILPI_SCOPE_CONTEXT_KEY,
  warnOnScopeUnavailable,
  type KilpiOnUnauthorizedHandler,
  type KilpiScope,
} from "./KilpiScope";
import type {
  GetPolicyByAction,
  InferPolicyInputs,
  InferPolicySubject,
  Policyset,
  PolicysetActions,
} from "./policy";
import { getPolicyByAction } from "./policy";
import { createCallStackSizeProtector } from "./utils/callStackSizeProtector";
import type { ArrayHead } from "./utils/types";

export type KilpiCoreSettings = {
  /**
   * Disable subject caching.
   */
  disableSubjectCaching?: boolean;

  /**
   * Default onUnauthorized handler.
   */
  defaultOnUnauthorized?: KilpiOnUnauthorizedHandler;
};

/**
 * Subject function gets an optional context and returns the subject data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGetSubject = (ctx?: any) => any;

/**
 * Utility to infer the context from a getSubject function.
 */
export type InferContext<TGetSubject extends AnyGetSubject> = Parameters<TGetSubject>[0];

/**
 * Arguments passed to construct a KilpiCore instance.
 */
export type KilpiConstructorArgs<
  TGetSubject extends AnyGetSubject,
  TPolicyset extends Policyset<Awaited<ReturnType<TGetSubject>>>,
> = {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: TGetSubject;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * Custom settings
   */
  settings?: KilpiCoreSettings;
};

/**
 * The KilpiCore class is the primary interface for interacting with the Kilpi library.
 */
export class KilpiCore<
  TGetSubject extends AnyGetSubject,
  TPolicyset extends Policyset<Awaited<ReturnType<TGetSubject>>>,
> {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * This will be automatically cached within each scope unless `settings.disableSubjectCaching`.
   */
  private uncached_getSubject: TGetSubject;

  /**
   * Settings for the Kilpi instance.
   */
  public settings?: KilpiCoreSettings;

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
   * Inferring utilities. Do not use at runtime.
   */
  public $$infer = null as unknown as {
    getSubject: TGetSubject;
    subject: Awaited<ReturnType<TGetSubject>>;
    policies: TPolicyset;
    context: InferContext<TGetSubject>;
  };

  /**
   * Current hooks
   */
  public hooks: KilpiHooks<typeof this>;

  /**
   * New instance
   */
  constructor(args: KilpiConstructorArgs<TGetSubject, TPolicyset>) {
    this.uncached_getSubject = args.getSubject;
    this.policies = args.policies;
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
  public async getSubject(): Promise<ReturnType<TGetSubject>> {
    // Get the current context and scope
    const context = this.getContext();
    const scope = this.resolveScope();

    // Cache disabled
    if (this.settings?.disableSubjectCaching) {
      return await this.uncached_getSubject(context);
    }

    // Cache hit
    if (scope?.subjectCache) {
      return await scope.subjectCache.subjectPromise;
    }

    // Cache miss: Populate cache (requires cache to work, warn otherwise)
    const subjectPromise = this.uncached_getSubject(context);
    if (!scope) warnOnScopeUnavailable("Kilpi: getSubject() could not be cached.");
    else {
      scope.subjectCache = { subjectPromise };
    }

    // Return the subject promise
    return await subjectPromise;
  }

  /**
   * Utility to resolve the current scope. Prioritizes the current explicit scope from
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
   * Utility to resolve the current context from the current scope.
   */
  public getContext(): InferContext<TGetSubject> {
    return this.resolveScope()?.[KILPI_SCOPE_CONTEXT_KEY];
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
  public async runInScope<T>(
    fn: () => Promise<T>,
    context?: InferContext<TGetSubject>,
  ): Promise<T> {
    return await this.scopeStorage.run({ [KILPI_SCOPE_CONTEXT_KEY]: context }, fn);
  }

  /**
   * Utility to wrap a function with `Kilpi.runInScope()`.
   *
   * ## Example
   *
   * @example
   * ```ts
   * export const POST = Kilpi.scoped(async (request) => {
   *   // ...
   *   await Kilpi.authorize("object:update", object);
   *   return new Response(...);
   * })
   * ```
   */
  public scoped<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: any[]) => Promise<any>,
  >(
    fn: T,
    context?: InferContext<TGetSubject>,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    // Return function wrapped with runInScope and context
    return (...args: Parameters<T>) => {
      return this.runInScope(() => fn(...args), context);
    };
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
   * the policy by the action and evaluates the policy. Returns all authorization information.
   */
  private async evaluate<TAction extends PolicysetActions<TPolicyset>>(
    options: { source: string },
    action: TAction,
    ...inputs: InferPolicyInputs<GetPolicyByAction<TPolicyset, TAction>>
  ) {
    // Evaluate policy within infinite loop protection
    return await KilpiCore.CallStackSizeProtector.run(async () => {
      // Get the current subject (cached)
      const subject = await this.getSubject();

      // Resolve the policy function by the action
      const policy = getPolicyByAction(this.policies, action);

      // Evaluate the policy
      const decision = await policy(subject, ...[...inputs]);

      // Run `onAfterAuthorization` hooks
      this.hooks.registeredHooks.onAfterAuthorization.forEach((hook) => {
        hook({
          source: options.source,
          action: action,
          subject,
          decision,
          object: inputs[0],
        });
      });

      // Return all relevant data
      return { decision, policy, subject };
    });
  }

  /**
   * Evaluate a policy and return the full authorization object.
   *
   * @param action The action to evaluate
   * @param inputs The object (if any) to provide to the policy.
   * @returns The full decision object as a promise.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const decision = await Kilpi.getAuthorizationDecision("object:read", object);
   * if (decision.granted) {
   *   console.log(`User ${decision.subject.id} can read object ${object.id}`);
   * } else {
   *   console.log(`Can not read object: ${decision.message}`);
   * }
   * ```
   */
  async getAuthorizationDecision<TAction extends PolicysetActions<TPolicyset>>(
    action: TAction,
    ...inputs: InferPolicyInputs<GetPolicyByAction<TPolicyset, TAction>>
  ) {
    // Evaluate policy and return the decision object
    const { decision } = await this.evaluate(
      { source: "getAuthorizationDecision" },
      action,
      ...inputs,
    );
    return decision;
  }

  /**
   * Check if a user passes a policy.
   *
   * @param action The action to evaluate
   * @param inputs The object (if any) to provide to the policy.
   * @returns A boolean indicating whether the user passes the policy.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const isAuthorized = await Kilpi.isAuthorized("object:update", object);
   * if (isAuthorized) {
   *   await updateObject();
   * }
   * ```
   */
  async isAuthorized<TAction extends PolicysetActions<TPolicyset>>(
    action: TAction,
    ...inputs: InferPolicyInputs<GetPolicyByAction<TPolicyset, TAction>>
  ): Promise<boolean> {
    // Evaluate policy and return the granted boolean
    const { decision } = await this.evaluate({ source: "isAuthorized" }, action, ...inputs);
    return decision.granted;
  }

  /**
   * Check if a user passes a policy. If yes, returns the narrowed down subject. Else,
   * throws.
   *
   * @param action The action to evaluate
   * @param inputs The object (if any) to provide to the policy.
   * @returns The narrowed down subject if the user passes the policy.
   * @throws KilpiError.Unauthorized if the user does not pass the policy, or other
   * value defined in `.onUnauthorized(...)`.
   *
   * ## Example
   *
   * @example
   * ```ts
   * const user = await Kilpi.authorize("object:update", object);
   *
   * // User is authorized to update the object. If not, `Kilpi.authorize` will have thrown
   * // or the custom `.onUnauthorized(...)` handler will have been called.
   * await updateObject(object, user);
   * ```
   */
  async authorize<TAction extends PolicysetActions<TPolicyset>>(
    action: TAction,
    ...inputs: InferPolicyInputs<GetPolicyByAction<TPolicyset, TAction>>
  ): Promise<InferPolicySubject<GetPolicyByAction<TPolicyset, TAction>>> {
    // Evaluate policy and get the decision
    const { decision } = await this.evaluate({ source: "authorize" }, action, ...inputs);

    // Granted, return the narrowed down subject and escape early
    if (decision.granted) {
      return decision.subject;
    }

    // Unauthorized
    this.unauthorized(decision);
  }

  /**
   * When a manually defined authorization check fails, trigger the `onUnauthorized` procedure
   * similarly as with `.authorize()` with this function.
   *
   * @param message The optional message to pass to the onUnauthorized handler.
   * @throws KilpiError.Unauthorized if the user does not pass the policy, or other
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
   * await updateObject(object, user);
   * ```
   */
  public unauthorized(denial: DeniedDecision): never {
    // Run onUnauthorized handler in current scope if available
    this.resolveScope()?.onUnauthorized?.(denial);

    // Run default onUnauthorized handler if available
    this.settings?.defaultOnUnauthorized?.(denial);

    // Throw by default
    throw new KilpiError.Unauthorized(denial.message);
  }

  /**
   * Utility to filter objects to only those objects that pass the policy. Requires a rule
   * that takes in an object.
   *
   * ## Example
   *
   * @example
   * ```ts
   * // Policy must take in an object
   * const Kilpi = createKilpi({
   *   ...,
   *   policies: {
   *     objects: {
   *       read: SomePolicy((user, object) => ...),
   *     }
   *   }
   * })
   *
   * // Return only objects which the user is authorized to read
   * const unauthorizedObjects = await listObjects();
   * const authorizedObjects = await Kilpi.filter("object:read", unauthorizedObjects);
   *
   * // Or apply already in protected query and call vai `.protect()`
   * const listObjects = Kilpi.query(
   *   async () => await db.listObjects(),
   *   {
   *     async protector({ output: objects }) {
   *       return await Kilpi.filter("object:read", objects);
   *     }
   *   }
   * )
   * const authorizedObjects = listObjects.protect();
   * ```
   */
  async filter<
    TAction extends PolicysetActions<TPolicyset>,
    TObject extends ArrayHead<InferPolicyInputs<GetPolicyByAction<TPolicyset, TAction>>>,
  >(action: TAction, objects: TObject[]) {
    // Get the current subject (cached)
    const subject = await this.getSubject();

    // Resolve the policy function by action
    const policy = getPolicyByAction(this.policies, action);

    // Collect all objects which passed authorization here.
    const authorizedObjects: TObject[] = [];

    // Evaluate policies in parallel inside infinite loop detection.
    await KilpiCore.CallStackSizeProtector.run(async () =>
      Promise.all(
        objects.map(async (object) => {
          const decision = await policy(subject, object);

          // Run `onAfterAuthorization` hooks
          this.hooks.registeredHooks.onAfterAuthorization.forEach((hook) => {
            hook({ source: "filter", action: action, subject, decision });
          });

          if (decision.granted) {
            authorizedObjects.push(object);
          }
        }),
      ),
    );

    // Return all authorized objects.
    return authorizedObjects;
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
      protector?: KilpiQueryProtector<TInput, TRawOutput, TRedactedOutput, TGetSubject>;
    } = {},
  ) {
    // Implemented in a KilpiQuery class.
    return new KilpiQuery<this, TInput, TRawOutput, TRedactedOutput>(this, query, options);
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
