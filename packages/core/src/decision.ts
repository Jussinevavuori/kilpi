/**
 * GrantedDecision represents a passed authorization check. It includes the narrowed down
 * version of the subject that was passed in.
 */
export type GrantedDecision<TSubject> = {
  granted: true;
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
   * Type of denial to be used by the system to handle e.g. unauthenticated and not subscribed
   * errors differently.
   */
  type?: string;

  /**
   * Metadata that can optionally be added to the denial.
   */
  metadata?: unknown;
};

/**
 * A decision object represents the result of an authorization check. It can either be granted
 * or denied. Each case includes more details about the result of the authorization check.
 */
export type Decision<TSubject> = GrantedDecision<TSubject> | DeniedDecision;

/**
 * Utility to create an GrantedDecision object with a subject.
 */
export function grant<TSubject>(subject: TSubject): GrantedDecision<TSubject> {
  return { granted: true, subject };
}

/**
 * Utility to create an DeniedDecision object with a message.
 */
export function deny(
  input: Omit<DeniedDecision, "granted"> = { message: "Unauthorized" },
): DeniedDecision {
  return { granted: false, ...input };
}
