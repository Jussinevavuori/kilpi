import { SubjectGuard } from "./guard";
import { Permission } from "./permission";
import { createRule, Rule } from "./rule";
import { MaybePromise } from "./utils/types";

export type KilpiConstructor<TSubject extends object | null | undefined> = {
  /**
   * Create subject guard
   */
  guard: <TGuardedSubject extends object | null | undefined>(
    guard: SubjectGuard<TSubject, TGuardedSubject>
  ) => SubjectGuard<TSubject, TGuardedSubject> & {
    /**
     * Create rule wth guard
     */
    create: <TResource>(
      check: (
        subject: TGuardedSubject,
        resource: TResource
      ) => MaybePromise<boolean | Permission<TGuardedSubject>>
    ) => Rule<TResource | TResource[], TSubject, TGuardedSubject>;
  };

  /**
   * Create Rule without guard (equal to creating with trivial guard)
   */
  create: <TResource>(
    check: (subject: TSubject, resource: TResource) => MaybePromise<boolean | Permission<TSubject>>
  ) => Rule<TResource | TResource[], TSubject, TSubject>;
};

/**
 * Create Kilpi constructor utility for KilpiCore
 */
export function createKilpiConstructor<
  TSubject extends object | null | undefined
>(): KilpiConstructor<TSubject> {
  return {
    create<TResource>(
      check: (
        subject: TSubject,
        resource: TResource
      ) => MaybePromise<boolean | Permission<TSubject>>
    ): Rule<TResource | TResource[], TSubject, TSubject> {
      return createRule((subject) => ({ subject }), check);
    },
    guard<TGuardedSubject extends object | null | undefined>(
      guardFn: SubjectGuard<TSubject, TGuardedSubject>
    ) {
      return Object.assign(guardFn, {
        create<TResource>(
          check: (
            subject: TGuardedSubject,
            resource: TResource
          ) => MaybePromise<boolean | Permission<TGuardedSubject>>
        ): Rule<TResource | TResource[], TSubject, TGuardedSubject> {
          return createRule(guardFn, check);
        },
      });
    },
  };
}
