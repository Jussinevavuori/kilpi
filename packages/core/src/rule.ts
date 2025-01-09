import { Permission } from "./permission";

/**
 * A rule consists of the `getPermission` evaluator function, which when given the subject and
 * resource returns the permission to that resource. Additionally, it consists of the
 * `getNarrowedSubject` function which narrows the subject to a more specific type before
 * evaluation.
 */
export type Rule<TResource, TSubject, TSubjectNarrowed = TSubject> = {
  /**
   * Based on subject and resource, return a permission. Runs subject narrowing within.
   */
  getPermission: (subject: TSubject, resource: TResource) => Promise<Permission<TSubjectNarrowed>>;

  /**
   * Returning false signals a denied permission. Subject-narrowing does not depend on the resource.
   */
  getNarrowedSubject: (subject: TSubject) => TSubjectNarrowed | false;
};

/**
 * Rule inferral utilities
 */
export type InferRule<T> = T extends Rule<infer TResource, infer TSubject, infer TSubjectNarrowed>
  ? { resource: TResource; subject: TSubject; subjectNarrowed: TSubjectNarrowed }
  : never;
export type InferRuleResource<T> = InferRule<T>["resource"];
export type InferRuleSubject<T> = InferRule<T>["subject"];
export type InferRuleSubjectNarrowed<T> = InferRule<T>["subjectNarrowed"];
