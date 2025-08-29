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
class KilpiUnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "KilpiUnauthorizedError";
  }
}

/**
 * Export all Kilpi error classes under the KilpiError namespace.
 */
export const KilpiError = {
  Internal: KilpiInternalError,
  Unauthorized: KilpiUnauthorizedError,
};
