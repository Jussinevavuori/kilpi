/**
 * Type of generic subject guard
 */
export type SubjectGuard<
  TSubject extends object | null | undefined,
  TSubjectGuarded extends object | null | undefined
> = (subject: TSubject) => { subject: TSubjectGuarded } | null | undefined;
