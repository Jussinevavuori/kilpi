import { Permission } from "./permission";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Rule input can be a single resource or no resource.
 */
export type AnyRuleInput = [] | [any];

/**
 * A rule is simply a function that takes in a subject and any number of inputs (representing
 * a resource) and returns a permission with a narrowed down subject.
 */
export type Rule<
  TInputs extends AnyRuleInput,
  TSubjectInput extends object | null | undefined,
  TSubjectOutput extends object | null | undefined = TSubjectInput,
> = (subject: TSubjectInput, ...inputs: TInputs) => Promise<Permission<TSubjectOutput>>;

/**
 * Utility for inferring a rule's inputs type.
 */
export type InferRuleInputs<T> = T extends Rule<infer TInputs, any, any> ? TInputs : [];

/**
 * Utility for inferring a rule's narrowed down subject type.
 */
export type InferRuleSubject<T> = T extends Rule<any, any, infer TSubject> ? TSubject : never;

/**
 * Rule construction utilities. Use either as:
 *
 * @example
 * ```ts
 *
 * // Without `as`
 *
 * const myRule = Rules.new((subject: Subject | null, id: string, count: number) => {
 *   if (!subject) return false;
 *   return subject.id === id && count > 0;
 * });
 *
 *
 * // With `as`
 *
 * const AuthedRules = Rules.as((subject: Subject | null) => (subject ? { subject } : null))
 *
 * const myAuthedRule = AuthedRules.new((subject, id: string, count: number) => {
 *   return subject.id === id && count > 0;
 * });
 * ```
 */
export const Rules = {
  /**
   * Create a new rule using a boolean-style constructor (true = granted, false = denied).
   */
  new<TSubjectInput extends object | null | undefined, TInputs extends AnyRuleInput>(
    evaluate: (subject: TSubjectInput, ...inputs: TInputs) => boolean | Promise<boolean>,
  ): Rule<TInputs, TSubjectInput> {
    return async (subject, ...inputs) => {
      return (await evaluate(subject, ...inputs)) ? Permission.Grant(subject) : Permission.Deny();
    };
  },

  /**
   * Create a new rule constructor by first passing a subject narrowing function.
   */
  as<
    TSubjectInput extends object | null | undefined,
    TSubjectOutput extends object | null | undefined,
  >(
    getNarrowedSubject: (subject: TSubjectInput) => { subject: TSubjectOutput } | null | undefined,
  ) {
    return {
      /**
       * Create a new rule using a boolean-style constructor (true = granted, false = denied)
       * after narrowing down the subject.
       */
      new<TInputs extends AnyRuleInput>(
        evaluate: (subject: TSubjectOutput, ...inputs: TInputs) => boolean | Promise<boolean>,
      ): Rule<TInputs, TSubjectInput, TSubjectOutput> {
        return async (subject, ...inputs) => {
          const narrowed = getNarrowedSubject(subject);
          if (!narrowed) return Permission.Deny();

          return (await evaluate(narrowed.subject, ...inputs))
            ? Permission.Grant(narrowed.subject)
            : Permission.Deny();
        };
      },
    };
  },
};
