/**
 * Fine internal error.
 */
class FineInternalError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "FineInternalError";
  }
}

/**
 * Permission denied error.
 */
class FinePermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinePermissionDeniedError";
  }
}

/**
 * Setup error
 */
class FineInvalidSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FineInvalidSetupError";
  }
}

/**
 * Client fetch permission failed error
 */
class FineFetchPermissionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FineFetchPermissionFailedError";
  }
}

/**
 * Client fetch subject failed error
 */
class FineFetchSubjectFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FineFetchSubjectFailedError";
  }
}

/**
 * All fine-errors.
 */
export const FineError = {
  Internal: FineInternalError,
  InvalidSetup: FineInvalidSetupError,
  PermissionDenied: FinePermissionDeniedError,
  FineFetchSubjectFailed: FineFetchSubjectFailedError,
  FineFetchPermissionFailed: FineFetchPermissionFailedError,
};
