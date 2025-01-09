import { Permission } from "./permission";
import { Rule } from "./rule";
import { MaybePromise } from "./types";

/**
 * Initialize rule constructors for a certain subject type. This provides the `.create()`
 * and  `.subject(...).create()` utility methods for constructing rules.
 *
 * ```
 * const Rule = initializeRules<MySubject>();
 *
 * const AuthedRule = Rule.subject((subject) => subject.authed ? subject : false);
 *
 * const ruleset = {
 *   document: {
 *     count: Rule.create(() => true), // Public
 *     read: AuthedRule.createOn<Document>((subject, resource) => subject.id === resource.authorId), // Authed
 *     create: AuthedRule.create(() => true), // Authed
 *   }
 * }
 * ```
 */
export function getRuleConstructors<
  TSubject extends object | null | undefined,
  TNarrowedSubject extends object | null | undefined = TSubject
>() {
  /**
   * Create basic rule on a resource. Return boolean for whether permission is granted or not based
   * on the subject and resource. Always returns an async rule function.
   */
  function create<TResource>(
    check: (subject: TSubject, resource: TResource) => MaybePromise<boolean | Permission<TSubject>>
  ): Rule<TResource | TResource[], TSubject> {
    return {
      /**
       * Get permission function - automatically allows passing arrays of resources (requires
       * all to pass or empty array to pass).
       */
      async getPermission(subject: TSubject, resource: TResource | TResource[]) {
        // Handle arrays (every item in array must pass -- empty array passes by default) with narrowed subjects
        if (Array.isArray(resource)) {
          // Run all grants in parallel
          const grants = await Promise.all(resource.map((r) => check(subject, r)));
          const allGranted = grants.every((g) => (typeof g === "boolean" ? g : g.granted));
          if (allGranted) return Permission.Grant(subject);

          // Attempt to find a message
          const message = grants.reduce<string | undefined>(
            (msg, g) => (msg || typeof g === "boolean" || g.granted ? msg : g.message),
            undefined
          );

          // Deny with message if fonud
          return Permission.Deny(message);
        }

        // Handle singular resources
        const granted = await check(subject, resource);
        return granted ? Permission.Grant(subject) : Permission.Deny();
      },

      /**
       * Trivial subject-narrower
       */
      getNarrowedSubject(subject: TSubject) {
        return subject;
      },
    };
  }

  /**
   * Create rule with a subject-narrower function.
   */
  function subject<TSubjectNarrowed>(
    getNarrowedSubject: (subject: TSubject) => TSubjectNarrowed | false
  ) {
    return {
      /**
       * Create a rule after subject narrowing for a specific resource.
       */
      create<TResource>(
        check: (
          subject: TSubjectNarrowed,
          resource: TResource
        ) => MaybePromise<boolean | Permission<TSubjectNarrowed>>
      ): Rule<TResource | TResource[], TSubject, TSubjectNarrowed> {
        return {
          async getPermission(subject: TSubject, resource: TResource | TResource[]) {
            // Narrow subject and respect narrowing failure (false).
            const narrowedSubject = getNarrowedSubject(subject);
            if (narrowedSubject === false) return Permission.Deny();

            // Handle arrays (every item in array must pass -- empty array passes by default) with narrowed subjects
            if (Array.isArray(resource)) {
              // Run all grants in parallel
              const grants = await Promise.all(resource.map((r) => check(narrowedSubject, r)));
              const allGranted = grants.every((g) => (typeof g === "boolean" ? g : g.granted));
              if (allGranted) return Permission.Grant(narrowedSubject);

              // Attempt to find a message
              const message = grants.reduce<string | undefined>(
                (msg, g) => (msg || typeof g === "boolean" || g.granted ? msg : g.message),
                undefined
              );

              // Deny with message if fonud
              return Permission.Deny(message);
            }

            // Handle singular resources with narrowed subject
            const granted = await check(narrowedSubject, resource);
            if (typeof granted === "boolean") {
              return granted ? Permission.Grant(narrowedSubject) : Permission.Deny();
            }
            return granted;
          },

          /**
           * Provided subject-narrower
           */
          getNarrowedSubject,
        };
      },
    };
  }

  /**
   * Return all constructors
   */
  return {
    create,
    subject,
  };
}

export type RuleConstructors<TSubject extends object | null | undefined> = ReturnType<
  typeof getRuleConstructors<TSubject>
>;
