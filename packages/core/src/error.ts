/**
 * Error thrown when the Kilpi library encounters an internal error.
 */
class KilpiInternalError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "Kilpi_InternalError";
  }
}

/**
 * Error thrown when an authorization check fails.
 */
class KilpiAuthorizationDeniedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "Kilpi_AuthorizationDeniedError";
  }
}

/**
 * Export all Kilpi error classes under the KilpiError namespace.
 */
export const KilpiError = {
  Internal: KilpiInternalError,
  AuthorizationDenied: KilpiAuthorizationDeniedError,
};
