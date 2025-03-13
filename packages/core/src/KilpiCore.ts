import { AsyncLocalStorage } from "async_hooks";
import { KilpiError } from "./error";
import type { KilpiAdapter, KilpiAdapterInitializer } from "./KilpiAdapter";
import { type KilpiContext } from "./KilpiContext";
import type { KilpiQueryProtector } from "./KilpiQuery";
import { KilpiQuery } from "./KilpiQuery";
import type { Permission } from "./permission";
import type { InferRuleInputs, InferRuleSubject, Rule } from "./rule";
import type { GetRuleByKey, RulesetKeys } from "./ruleset";
import { getRuleByKey } from "./ruleset";
import { createCallStackSizeProtector } from "./utils/callStackSizeProtector";
import type { DeepObject } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Arguments passed to the Kilpi constructor.
 */
export type KilpiConstructorArgs<
  TSubject extends object | null | undefined,
  TRules extends DeepObject<Rule<any, TSubject, any>>,
> = {
  adapter?: KilpiAdapterInitializer;
  defaults?: KilpiContext;
  getSubject: () => TSubject | Promise<TSubject>;
  rules: TRules;
};

/**
 * Kilpi core class to encapsulate ruleset, subjects and more.
 */
export class KilpiCore<
  TSubject extends object | null | undefined,
  TRules extends DeepObject<Rule<any, TSubject, any>>,
> {
  /**
   * Subject fetcher
   */
  getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Provided adapter
   */
  adapter?: KilpiAdapter;

  /**
   * Defaults for context
   */
  defaults?: KilpiContext;

  /**
   * Rules from construction.
   */
  rules: TRules;

  /**
   * Async local storage for optional manual context control
   */
  private contextAsyncLocalStorage: AsyncLocalStorage<KilpiContext>;

  /**
   * Inferring utilities. Do not use at runtime.
   */
  public $$infer = null as unknown as { subject: TSubject; ruleset: TRules };

  /**
   * New instance
   */
  constructor(args: KilpiConstructorArgs<TSubject, TRules>) {
    // Run construct function with constructor
    // Assign properties to instance
    this.getSubject = args.getSubject;
    this.rules = args.rules;
    this.defaults = args.defaults;

    // Initialize adapter
    this.adapter = args.adapter?.({
      defaults: args.defaults,
    });

    // Setup async local storage
    this.contextAsyncLocalStorage = new AsyncLocalStorage();
  }

  /**
   * Utility to current context values. Context is resolved as follows:
   * 1. Context from async local storage if available (mutable)
   * 2. Context from adapter if available (mutable)
   * 3. Defaults (immutable)
   */
  private getContext() {
    const contextFromAsyncLocalStorage =
      this.contextAsyncLocalStorage.getStore();
    if (contextFromAsyncLocalStorage) return contextFromAsyncLocalStorage;

    const contextFromAdapter = this.adapter?.getContext();
    if (contextFromAdapter) return contextFromAdapter;

    return this.defaults ?? {};
  }

  /**
   * Utility to access mutable context (does not access default variables)
   */
  private getMutableContext() {
    const contextFromAsyncLocalStorage =
      this.contextAsyncLocalStorage.getStore();
    if (contextFromAsyncLocalStorage) return contextFromAsyncLocalStorage;

    const contextFromAdapter = this.adapter?.getContext();
    if (contextFromAdapter) return contextFromAdapter;

    // No context found: we cannot mutate defaults
    return null;
  }

  /**
   * Utility to run in context (uses AsyncLocalStorage.run). Defaults new context to
   * provided this.defaults values.
   */
  public async runWithContext<T>(fn: () => Promise<T>): Promise<T> {
    return await this.contextAsyncLocalStorage.run({ ...this.defaults }, fn);
  }

  /**
   * Utility to set the new on unauthorized handler for the context
   */
  public onUnauthorized(handler: KilpiContext["onUnauthorized"]) {
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
   * Get permission to a rule inside the ruleset
   */
  async getPermission<TKey extends RulesetKeys<TRules>>(
    key: TKey,
    ...inputs: InferRuleInputs<GetRuleByKey<TRules, TKey>>
  ): Promise<Permission<InferRuleSubject<GetRuleByKey<TRules, TKey>>>> {
    const subject = await this.getSubject();
    const rule = getRuleByKey(this.rules, key);
    const permission = await rule(subject, ...[...inputs]);
    return permission;
  }

  // /**
  //  * Get permission to a rule inside the ruleset (only return boolean)
  //  */
  async hasPermission<TKey extends RulesetKeys<TRules>>(
    key: TKey,
    ...inputs: InferRuleInputs<GetRuleByKey<TRules, TKey>>
  ): Promise<boolean> {
    const subject = await this.getSubject();
    const rule = getRuleByKey(this.rules, key);
    const permission = await rule(subject, ...[...inputs]);
    return permission.granted;
  }

  /**
   * Throw if no permission, else return guarded subject.
   */
  async protect<TKey extends RulesetKeys<TRules>>(
    key: TKey,
    ...inputs: InferRuleInputs<GetRuleByKey<TRules, TKey>>
  ): Promise<InferRuleSubject<GetRuleByKey<TRules, TKey>>> {
    // Evaluate rule within infinite loop protection
    const { subject, rule, permission } =
      await KilpiCore.CallStackSizeProtector.run(async () => {
        const subject = await this.getSubject();
        const rule = getRuleByKey(this.rules, key);
        const permission = await rule(subject, ...[...inputs]);
        return { subject, rule, permission };
      });

    // Granted
    if (permission.granted) return permission.subject;

    // Log denied rule for easier debugging
    console.warn(
      `🚫 Rule denied: ${key} (${permission.message || "Unauthorized"})`,
    );

    // Handle denials -- use provided function if provided. Defaults to throwing a
    // PermissionDenied error unless `onUnauthorized` throws an error (or other throwable, e.g. a redirect).
    await this.getContext().onUnauthorized?.({
      message: permission.message,
      rule,
      subject,
    });
    throw new KilpiError.PermissionDenied(permission.message ?? "Unauthorized");
  }

  /**
   * Filters resources to those that the user has permission to access. The resource is considered
   * the first input to the rule, and any additional inputs are passed as is.
   *
   * Important note if a rule takes in...
   * - 0 inputs    -> Not callable.
   * - 1 input     -> Filters the resources as you would expect
   * - >= 2 inputs -> Filters the first input as you would expect, the rest are passed as is.
   *
   * @example
   * ```ts
   *
   * // Basic usage (rule with 1 input)
   * const accessibleDocuments = await Kilpi.filter("docs:read", allDocuments);
   *
   * // Rule with 2 inputs ("public" passed with each document separately)
   * const accessibleDocuments = await Kilpi.filter("docs:read", allDocuments, "public");
   * ```
   */
  async filter<
    TKey extends RulesetKeys<TRules>,
    TResource extends ArrayHead<InferRuleInputs<GetRuleByKey<TRules, TKey>>>,
    TInputs extends InferRuleInputs<GetRuleByKey<TRules, TKey>>,
  >(key: TKey, resources: TResource[], ...restInputs: ArrayTail<TInputs>) {
    // Access rule and subject
    const subject = await this.getSubject();
    const rule = getRuleByKey(this.rules, key);

    // Collect all passed resources here. Evaluate rules in parallel inside infinite loop detection.
    const accessibleResources: TResource[] = [];
    await KilpiCore.CallStackSizeProtector.run(async () =>
      Promise.all(
        resources.map(async (resource) => {
          const permission = await rule(subject, resource, ...[...restInputs]);
          if (permission.granted) accessibleResources.push(resource);
        }),
      ),
    );

    return accessibleResources;
  }

  /**
   * Utility to throw a KilpiError.PermissionDenied error
   */
  public throwPermissionDenied(message: string) {
    throw new KilpiError.PermissionDenied(message);
  }

  /**
   * Create protected queries.
   */
  public query<TInput extends any[], TRawOutput, TRedactedOutput = TRawOutput>(
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
   * or a rule evaulator function.
   */
  private static CallStackSizeProtector = createCallStackSizeProtector({
    maxStackSize: 50,
    errorMessage: `
			Kilpi.protect() called too many times recursively -- potential infinite loop
			detected. This is usually caused by calling protect() or a protected query
			with query.protect() or query.safe() in getSubject() or a rule. These cause
			an infinite loop. Ensure all rules and the getSubject function do not call
			protect() or protected queries with .protect() or .safe().
		`.replace(/\s+/g, " "), // Normalize whitespace
  });
}

/**
 * Get head of array
 */

export type ArrayHead<T extends any[]> = T extends [infer H, ...any[]]
  ? H
  : never;

/**
 * Get tail of array
 */

export type ArrayTail<T extends any[]> = T extends [any, ...infer R]
  ? R
  : never;
