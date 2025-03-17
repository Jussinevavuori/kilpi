import { Authorization } from "./authorization";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Policy inputs either take in exactly 0 or 1 resources.
 */
export type AnyPolicyInput = [] | [any];

/**
 * A policy is a function that takes in a subject and optionally a resource and returns an
 * authorization representing whether the subject is allowed to perform the specified action
 * (on the specified resource).
 *
 * A passed authorization check can also return a narrowed down version of the subject.
 */
export type Policy<
  TInputs extends AnyPolicyInput,
  TSubjectInput extends object | null | undefined,
  TSubjectOutput extends object | null | undefined = TSubjectInput,
> = (
  subject: TSubjectInput,
  ...inputs: TInputs
) => Promise<Authorization<TSubjectOutput>>;

/**
 * Utility type for inferring the inputs of a policy.
 */
export type InferPolicyInputs<T> =
  T extends Policy<infer TInputs, any, any> ? TInputs : [];

/**
 * Utility type for inferring the narrowed down subject of a policy.
 */
export type InferPolicySubject<T> =
  T extends Policy<any, any, infer TSubject> ? TSubject : never;

/**
 * Policy construction utilities. Use either as:
 *
 * @example
 * ```ts
 *
 * // Without `as`
 *
 * Policy.new((subject: Subject | null, id: string, count: number) => {
 *   if (!subject) return false;
 *   return subject.id === id && count > 0;
 * });
 *
 *
 * // With `as` wrapper to narrow down subject
 *
 * const AuthedPolicy = Policy.as((subject: Subject | null) => (subject ? { subject } : null))
 * AuthedPolicy.new((subject, id: string, count: number) => {
 *   return subject.id === id && count > 0;
 * });
 * ```
 */
export const Policy = {
  /**
   * Create a new policy using a boolean-style constructor (true = granted, false = denied).
   */
  new<
    TSubjectInput extends object | null | undefined,
    TInputs extends AnyPolicyInput,
  >(
    evaluate: (
      subject: TSubjectInput,
      ...inputs: TInputs
    ) => boolean | Promise<boolean>,
  ): Policy<TInputs, TSubjectInput> {
    return async (subject, ...inputs) => {
      // Evaluate the policy function and return the authorization result.
      return (await evaluate(subject, ...inputs))
        ? Authorization.Grant(subject)
        : Authorization.Deny();
    };
  },

  /**
   * Create a new policy constructor by first passing a subject narrowing function.
   */
  as<
    TSubjectInput extends object | null | undefined,
    TSubjectOutput extends object | null | undefined,
  >(
    getNarrowedSubject: (
      subject: TSubjectInput,
    ) => { subject: TSubjectOutput } | null | undefined,
  ) {
    return {
      /**
       * Create a new policy using a boolean-style constructor (true = granted, false = denied),
       * after narrowing down the subject.
       */
      new<TInputs extends AnyPolicyInput>(
        evaluate: (
          subject: TSubjectOutput,
          ...inputs: TInputs
        ) => boolean | Promise<boolean>,
      ): Policy<TInputs, TSubjectInput, TSubjectOutput> {
        return async (subject, ...inputs) => {
          // Narrow down the subject. If the narrowing fails, deny the authorization.
          const narrowed = getNarrowedSubject(subject);
          if (!narrowed) return Authorization.Deny();

          // Evaluate the policy function and return the authorization result.
          return (await evaluate(narrowed.subject, ...inputs))
            ? Authorization.Grant(narrowed.subject)
            : Authorization.Deny();
        };
      },
    };
  },
};
