/**
 * Permission granted with refined subject included.
 */
export type PermissionGrant<TSubject> = { granted: true; subject: TSubject };

/**
 * Permission denied, no refined subject required.
 */
export type PermissionDeny = { granted: false; message?: string };

/**
 * Permission is either granted (with refined subject) or denied based on the discriminated
 * union by the `granted: boolean` key.
 */
export type Permission<TSubject> = PermissionGrant<TSubject> | PermissionDeny;

/**
 * Grant permission, while passing through the subject
 */
function Grant<TSubject>(subject: TSubject): PermissionGrant<TSubject> {
  return {
    granted: true,
    subject,
  };
}

/**
 * Deny permission, optionally with a message
 */
function Deny(message?: string): PermissionDeny {
  return {
    granted: false,
    message,
  };
}

/**
 * Access permission functions via namespace.
 */
export const Permission = { Grant, Deny };
