/**
 * AuthorizationGranted represents a passed authorization check. It includes the narrowed down
 * version of the subject that was passed in.
 */
export type AuthorizationGranted<TSubject> = {
  granted: true;
  subject: TSubject;
};

/**
 * AuthorizationDenied represents a failed authorization check. It includes an optional message
 * to provide context for the denial and an optional reason for the denial.
 */
export type AuthorizationDenied = {
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
 * An authorization object represents the result of an authorization check. It can either be granted
 * or denied. Each case includes more details about the result of the authorization check.
 */
export type Authorization<TSubject> = AuthorizationGranted<TSubject> | AuthorizationDenied;

/**
 * Utility to create an AuthorizationGranted object with a subject.
 */
export function grant<TSubject>(subject: TSubject): AuthorizationGranted<TSubject> {
  return { granted: true, subject };
}

/**
 * Utility to create an AuthorizationDenied object with a message.
 */
export function deny(
  input: string | Pick<AuthorizationDenied, "message" | "type" | "metadata"> = "Unauthorized",
): AuthorizationDenied {
  const message = typeof input === "string" ? input : input.message;
  const type = typeof input === "string" ? undefined : input.type;
  const metadata = typeof input === "string" ? undefined : input.metadata;

  return { granted: false, message, type, metadata };
}
