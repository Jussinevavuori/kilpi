import type { DeniedDecision } from "./types";

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
  decision: DeniedDecision;
  constructor(decision: DeniedDecision) {
    super(decision.message);
    this.name = "KilpiUnauthorizedError";
    this.decision = decision;
  }
}

/**
 * Export all Kilpi error classes under the KilpiError namespace.
 */
export const KilpiError = {
  Internal: KilpiInternalError,
  Unauthorized: KilpiUnauthorizedError,
};
