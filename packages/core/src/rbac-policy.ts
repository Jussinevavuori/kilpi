import { authorization } from "./authorization";
import type { Policy } from "./policy";

export function createRbacPolicy<TSubjectInput, TSubjectOutput, TRole extends string = string>(
  getGuardedSubject: (
    subject: TSubjectInput,
  ) => { subject: TSubjectOutput; roles: TRole[] } | null | undefined,
) {
  return function createPolicy(...roles: TRole[]): Policy<[], TSubjectInput, TSubjectOutput> {
    return async (subject) => {
      // Narrow down the subject and extract roles. If the narrowing fails, deny the authorization.
      const guarded = getGuardedSubject(subject);
      if (!guarded) return;

      // Ensure has at the least one role
      const hasAnyRole = roles.some((role) => guarded.roles.includes(role));
      if (!hasAnyRole) return;

      // Authorize subject
      return authorization(guarded.subject);
    };
  };
}
