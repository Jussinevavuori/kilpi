import { getPolicyByAction } from "./getPolicyByAction";
import { KilpiCore } from "./KilpiCore";
import type {
  Decision,
  GetPolicyByAction,
  InferPolicyInputs,
  InferPolicySubject,
  KilpiOnUnauthorizedAssertHandler,
  PolicysetActions,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * When accessing a policy via the fluent proxy API, this class is instantiated.
 */
export class KilpiPolicy<
  TCore extends KilpiCore<any, any>,
  TAction extends PolicysetActions<TCore["$$infer"]["policies"]>,
> {
  // Private internals
  #core: TCore;
  #inputs: InferPolicyInputs<GetPolicyByAction<TCore["$$infer"]["policies"], TAction>>;

  // Utility to access the first object input (if any)
  get #object() {
    return this.#inputs?.[0];
  }

  // Public internals
  $action: TAction;

  // Constructor
  constructor(options: {
    core: TCore;
    action: TAction;
    inputs: InferPolicyInputs<GetPolicyByAction<TCore["$$infer"]["policies"], TAction>>;
  }) {
    this.$action = options.action;
    this.#core = options.core;
    this.#inputs = options.inputs || []; // Ensure iterable
  }

  /**
   * Internally evaluates the policy when invoked.
   */
  private async evaluate(
    options: Partial<{
      // Optional context to pass to getSubject
      ctx: TCore["$$infer"]["context"];
      // Optionally override entire subject
      subject: TCore["$$infer"]["subject"];
    }> = {},
  ): Promise<{
    decision: Decision<
      InferPolicySubject<GetPolicyByAction<TCore["$$infer"]["policies"], TAction>>
    >;
    subject: TCore["$$infer"]["subject"];
    context?: TCore["$$infer"]["context"];
  }> {
    // Get subject (or use override).
    const subject = options.subject
      ? options.subject
      : await KilpiCore.expose(this.#core).getSubject(options.ctx);

    // Resolve the policy function by the action.
    const policy = getPolicyByAction(KilpiCore.expose(this.#core).policies, this.$action);

    // Run the policy function.
    const decision = await policy(subject, ...this.#inputs);

    // Run `onAfterAuthorization` hooks (do not await)
    this.#core.$hooks.registeredHooks.onAfterAuthorization.forEach((hook) => {
      hook({ action: this.$action, subject, decision, object: this.#object, context: options.ctx });
    });

    // Return all relevant data on evaluation
    return { decision, subject, context: options.ctx };
  }

  /**
   * Public API for evaluating the policy and returning the decision.
   *
   * Additionally supports the `.assert()` method for throwing on denied access.
   *
   * @example
   * ```ts
   * // Access the authorization decision
   * const { granted } = await Kilpi.posts.edit(post).authorize({ ctx });
   *
   * // Assert the authorization passes -- always returns granted decision (or throws)
   * const { subject } = await Kilpi.posts.create().authorize().assert();
   * ```
   */
  public authorize(
    options: Partial<{
      // Optional context to pass to getSubject
      ctx?: TCore["$$infer"]["context"];
      // Optionally override entire subject
      subject?: TCore["$$infer"]["subject"];
    }> = {},
  ) {
    const promise = this.evaluate(options);

    /**
     * Assertion function. Throws if not authorized.
     *
     * @param onUnauthorizedAssert Optional extra handler for this specific authorization.
     * @returns Granted decision if authorized.
     */
    const assert = async (onUnauthorizedAssert?: KilpiOnUnauthorizedAssertHandler) => {
      const { decision, subject, context } = await promise;

      // Not granted: Throw using the core's handler.
      if (!decision.granted) {
        return await KilpiCore.expose(this.#core).handleUnauthorizedAssert({
          decision,
          subject,
          context,
          action: this.$action,
          object: this.#object,
          onUnauthorizedAssert,
        });
      }

      // Return granted decisions as is
      return decision;
    };

    // Return the promise with the assert method attached, only return the decision
    return Object.assign(
      promise.then((_) => _.decision),
      { assert },
    );
  }
}

export type AnyKilpiPolicy = KilpiPolicy<any, any>;
