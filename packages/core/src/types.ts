import type { DeepObject, RecursiveValueByKey } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GrantedDecision represents a passed authorization check. It includes the narrowed down
 * version of the subject that was passed in.
 */
export type GrantedDecision<TSubject> = {
  granted: true;

  /**
   * Subject who was granted access.
   */
  subject: TSubject;
};

/**
 * DeniedDecision represents a failed authorization check. It includes an optional message
 * to provide context for the denial and an optional reason for the denial.
 */
export type DeniedDecision = {
  granted: false;

  /**
   * Message to be displayed to the user.
   */
  message?: string;

  /**
   * Reason of denial for distinguishing between different types of denials (e.g. UNAUTHENTICATED
   * vs. NOT_SUBSCRIBED vs NOT_ENOUGH_CREDITS).
   */
  reason?: string;

  /**
   * Metadata that can optionally be added to the denial.
   */
  metadata?: unknown;
};

/**
 * A decision object represents the result of an authorization check. It can either be granted
 * or denied. Each case includes more details about the result of the authorization check.
 */
export type Decision<TSubjectOutput> = GrantedDecision<TSubjectOutput> | DeniedDecision;

/**
 * Handler called when authorization fails and `.require()` is used.
 */
export type KilpiOnUnauthorizedAssertHandler = (denial: DeniedDecision) => unknown;

/**
 * Utility type for whch all getSubject functions extend.
 */
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
  TPolicyset extends Policyset<Awaited<ReturnType<NoInfer<TGetSubject>>>>,
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
   * When `.require()` is called on a denied decision, this handler is invoked if provided.
   * This handler should typically throw a custom error (redirection, 403, ...) when the
   * used framework / custom error handler supports throwing errors to signal unauthorized
   * access.
   */
  onUnauthorizedAssert?: KilpiOnUnauthorizedAssertHandler;
};

/**
 * Policy inputs either take in exactly 0 or 1 objects.
 */
type AnyPolicyInput = [] | [any];

/**
 * A policy is a function that takes in a subject and optionally an object and returns an
 * authorization representing whether the subject is allowed to perform the specified action
 * (on the specified object).
 *
 * A passed authorization check can also return a narrowed down version of the subject.
 */
export type Policy<
  TInputs extends AnyPolicyInput,
  TSubjectInput,
  TSubjectOutput = TSubjectInput,
> = (
  subject: TSubjectInput,
  ...inputs: TInputs
) => Decision<TSubjectOutput> | Promise<Decision<TSubjectOutput>>;

/**
 * Policyset is a deep-object of policies which all share a common base subject type.
 */
export type Policyset<TSubject> = DeepObject<Policy<any, TSubject, any>>;

/**
 * Utility type for inferring the inputs of a policy.
 */
export type InferPolicyInputs<T> = T extends Policy<infer TInputs, any, any> ? TInputs : [];

/**
 * Utility type for inferring the narrowed down subject of a policy.
 */
export type InferPolicySubject<T> =
  T extends Policy<any, any, infer TSubjectOutput> ? TSubjectOutput : never;

/**
 * Separator for action keys (e.g. "blog:edit").
 */
export const SEPARATOR = "." as const;

/**
 * Specialized version of RecursiveKeysTo that matches by function parameter type instead of
 * exact type.
 */
export type RecursiveKeysToFnByParams<
  Object,
  TargetParams,
  Separator extends string = ".",
> = Object extends object
  ? {
      [Key in keyof Object]: Key extends string | number
        ? Object[Key] extends (...args: infer FnParams) => any
          ? FnParams extends TargetParams
            ? Key
            : never
          : `${Key}${Separator}${RecursiveKeysToFnByParams<Object[Key], TargetParams, Separator>}`
        : never;
    }[keyof Object]
  : never;

/**
 * Get list of actions that do not take in an object.
 */
export type PolicysetActionsWithoutObject<TPolicyset extends Policyset<any>> =
  RecursiveKeysToFnByParams<TPolicyset, [] | [any], typeof SEPARATOR>;

/**
 * Get list of actions that do take in an object.
 */
export type PolicysetActionsWithObject<TPolicyset extends Policyset<any>> =
  RecursiveKeysToFnByParams<TPolicyset, [any, any], typeof SEPARATOR>;

/**
 * List of all actions in a Policyset.
 */
export type PolicysetActions<TPolicyset extends Policyset<any>> =
  | PolicysetActionsWithObject<TPolicyset>
  | PolicysetActionsWithoutObject<TPolicyset>;

/**
 * Ensure a value is a policy.
 */
type EnsureTypeIsPolicy<T> = T extends Policy<any, any, any> ? T : never;

/**
 * Type of a policy from a policyset given an action.
 */
export type GetPolicyByAction<
  TPolicyset extends Policyset<any>,
  TAction extends PolicysetActions<TPolicyset>,
> = EnsureTypeIsPolicy<RecursiveValueByKey<TPolicyset, TAction, typeof SEPARATOR>>;
