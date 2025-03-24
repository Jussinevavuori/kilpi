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
 * to provide context for the denial.
 */
export type AuthorizationDenied = { granted: false; message?: string };

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
export function deny(message: string = "Unauthorized"): AuthorizationDenied {
  return { granted: false, message };
}
