import type { DeniedDecision, GrantedDecision } from "./types";

/**
 * Utility to create an GrantedDecision object with a subject.
 */
export function Grant<TSubject>(subject: TSubject): GrantedDecision<TSubject> {
  return { granted: true, subject };
}

/**
 * Utility to create an DeniedDecision object with a message.
 *
 * Omits the subject, as it can be automatically injected by Kilpi during runtime and needs
 * no typing.
 */
export function Deny(
  input: Omit<DeniedDecision, "granted"> = { message: "Unauthorized" },
): DeniedDecision {
  return { granted: false, ...input };
}
