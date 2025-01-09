/**
 * Kilpi internal error.
 */
class KilpiInternalError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "KilpiInternalError";
  }
}

/**
 * Permission denied error.
 */
class KilpiPermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KilpiPermissionDeniedError";
  }
}

/**
 * Setup error
 */
class KilpiInvalidSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KilpiInvalidSetupError";
  }
}

/**
 * Client fetch permission failed error
 */
class KilpiFetchPermissionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KilpiFetchPermissionFailedError";
  }
}

/**
 * Client fetch subject failed error
 */
class KilpiFetchSubjectFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KilpiFetchSubjectFailedError";
  }
}

/**
 * All Kilpi errors.
 */
export const KilpiError = {
  Internal: KilpiInternalError,
  InvalidSetup: KilpiInvalidSetupError,
  PermissionDenied: KilpiPermissionDeniedError,
  FetchSubjectFailed: KilpiFetchSubjectFailedError,
  FetchPermissionFailed: KilpiFetchPermissionFailedError,
};
