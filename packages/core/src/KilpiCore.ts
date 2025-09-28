import { KilpiError } from "./error";
import { KilpiHooks } from "./KilpiHooks";
import type { KilpiQueryAuthorizeFn } from "./KilpiQuery";
import { KilpiQuery } from "./KilpiQuery";
import type {
  AnyGetSubject,
  DeniedDecision,
  InferContext,
  KilpiConstructorArgs,
  KilpiOnUnauthorizedHandler,
  Policyset,
  PolicysetActions,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Symbols used to hide properties not meant for the public API.
 */
const KilpiCoreSymbol_Policies = Symbol("KilpiCore.policies");
const KilpiCoreSymbol_GetSubject = Symbol("KilpiCore.getSubject");
const KilpiCoreSymbol_OnUnauthorized = Symbol("KilpiCore.onUnauthorized");
const KilpiCoreSymbol_HandleUnauthorizedAssert = Symbol("KilpiCore.handleUnauthorizedAssert");

/**
 * The KilpiCore class is the primary interface for interacting with the Kilpi library.
 *
 * The fluent policy proxy API and plugins are attached to this class in the `createKilpi` method.
 * This class holds the core configuration, including the `getSubject` function, policy set, and
 * global `onUnauthorized` handler.
 */
export class KilpiCore<
  TGetSubject extends AnyGetSubject,
  TPolicyset extends Policyset<Awaited<ReturnType<TGetSubject>>>,
> {
  /**
   * Get subject function to access authenticated subject.
   *
   * Not exposed to consumer in public API. Use via `KilpiCore.expose(instance).getSubject` instead.
   */
  [KilpiCoreSymbol_GetSubject]: TGetSubject;

  /**
   * Policy set.
   *
   * Not exposed to consumer in public API. Use via `KilpiCore.expose(instance).policies` instead.
   */
  [KilpiCoreSymbol_Policies]: TPolicyset;

  /**
   * Global handler for when unauthorized (and .require() is used).
   *
   * Not exposed to consumer in public API. Use via `KilpiCore.expose(instance).onUnauthorized` instead.
   */
  [KilpiCoreSymbol_OnUnauthorized]: KilpiOnUnauthorizedHandler | undefined;

  /**
   * Hooks API. Used to register and unregister Kilpi hooks.
   *
   * ```ts
   * // Register the hook
   * const unregister = Kilpi.$hooks.onAfterAuthorization((event) => { ... });
   *
   * // Unregister the hook
   * unregister();
   * ```
   */
  public $hooks: KilpiHooks<typeof this>;

  /**
   * Type inferring utilities. Do not use at runtime.
   *
   * ## Example usage
   * ```ts
   * type Policyset = (typeof Kilpi)["$$infer"]["policies"];
   * ```
   */
  public $$infer = null as unknown as {
    getSubject: TGetSubject;
    subject: Awaited<ReturnType<TGetSubject>>;
    policies: TPolicyset;
    context: InferContext<TGetSubject>;
  };

  /**
   * Create new instance.
   */
  constructor(args: KilpiConstructorArgs<TGetSubject, TPolicyset>) {
    // Initialize hooks
    this.$hooks = new KilpiHooks();

    // Assign private properties
    this[KilpiCoreSymbol_Policies] = args.policies;
    this[KilpiCoreSymbol_OnUnauthorized] = args.onUnauthorized;

    // Wrap getSubject with caching hooks
    this[KilpiCoreSymbol_GetSubject] = (async (context?: InferContext<TGetSubject>) => {
      // Attempt to retrieve from cache first
      for (const hook of this.$hooks.registeredHooks.onSubjectRequestFromCache) {
        const cacheHit = await hook({ context });
        if (!cacheHit) continue;

        // Cache hit: Announce and return
        this.$hooks.registeredHooks.onSubjectResolved.forEach((hook) => {
          hook({ subject: cacheHit.subject, context, fromCache: true });
        });
        return cacheHit.subject;
      }

      // Cache miss, retrieve manually
      const subject = await args.getSubject(context);

      // Announce and return
      this.$hooks.registeredHooks.onSubjectResolved.forEach((hook) => {
        hook({ subject, context, fromCache: false });
      });
      return subject;
    }) as TGetSubject;
  }

  /**
   * Create a protected query using the `$query` method.
   *
   * ## Simple example usage
   *
   * ```ts
   * const getUserData = Kilpi.$query(
   *   async (input: { userId: string }) => {
   *     return await db.user.findUnique({ where: { id: input.userId } });
   *   },
   *   {
   *     authorize: ({ input: [userId], output: userData, subject }) => {
   *       if (subject.id !== userData?.id) return null;
   *       return output;
   *     },
   *   }
   * );
   */
  public $query<TInput extends any[], TRawOutput, TRedactedOutput = TRawOutput>(
    // Copy all required parameters from KilpiQuery constructor except the first one
    query: (...args: TInput) => TRawOutput,
    options: {
      authorize?: KilpiQueryAuthorizeFn<TInput, TRawOutput, TRedactedOutput, TGetSubject>;
    } = {},
  ) {
    // Return a new KilpiQuery instance which implements the authorization logic.
    return new KilpiQuery<this, TInput, TRawOutput, TRedactedOutput>(this, query, options);
  }

  /**
   * Private function for shared onUnauthorizedAssert handling.
   */
  async [KilpiCoreSymbol_HandleUnauthorizedAssert](options: {
    // Decision which was denied.
    decision: DeniedDecision;

    // Additional custom handler to call first.
    onUnauthorized?: KilpiOnUnauthorizedHandler;

    // Optionally also include subject in the event.
    subject?: Awaited<ReturnType<TGetSubject>>;

    // Optionally also provide the current action
    action?: PolicysetActions<TPolicyset>;

    // Optionally also provide the current object
    object?: unknown;

    // Optionally also provide the current context
    context?: InferContext<TGetSubject>;
  }): Promise<never> {
    // Collect a list of thrown errors from all handlers.
    const thrownErrors: unknown[] = [];

    // Run the custom provided handler first (if any).
    // Collect thrown errors for later throwing, but run all other handlers first as well.
    try {
      await options.onUnauthorized?.(options.decision);
    } catch (err) {
      thrownErrors.push(err);
    }

    // Then run all handlers registered via the onUnauthorizedAssert hook.
    // Collect thrown errors for later throwing, but run all other handlers first as well.
    for (const onUnauthorizedHook of this.$hooks.registeredHooks.onUnauthorizedAssert) {
      try {
        await onUnauthorizedHook({
          decision: options.decision,
          action: options.action,
          subject: options.subject ?? null,
          context: options.context,
          object: options.object,
        });
      } catch (err) {
        thrownErrors.push(err);
      }
    }

    // If any hook threw, throw the first thrown error.
    if (thrownErrors.length > 0) throw thrownErrors[0];

    // Finally if no other handler threw an error, throw default KilpiError.Unauthorized
    throw new KilpiError.Unauthorized(options.decision.message);
  }

  /**
   * Utility to expose internal properties for plugins.
   *
   * ## Example usage
   *
   * ```ts
   * const policies = KilpiCore.expose(instance).policies;
   * ```
   */
  static expose<T extends AnyKilpiCore>(core: T) {
    return {
      getSubject: core[KilpiCoreSymbol_GetSubject],
      policies: core[KilpiCoreSymbol_Policies],
      onUnauthorized: core[KilpiCoreSymbol_OnUnauthorized],

      // When accessing methods, ensure `this` is bound correctly
      handleUnauthorizedAssert: core[KilpiCoreSymbol_HandleUnauthorizedAssert].bind(core),
    } as const;
  }
}

// Utility type
export type AnyKilpiCore = KilpiCore<any, any>;
