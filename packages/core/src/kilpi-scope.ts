import type { AnyKilpiCore } from "./kilpi-core";

/**
 * Type of handler which is called when `KilpiCore.authorize()` denies access. This handler is
 * primarily responsible for customizing which value is thrown when access is denied (e.g.
 * to redirect to a login page, or to return a 403 status code).
 */
export type KilpiOnUnauthorizedHandler = () => void | never;

/**
 * Kilpi should be scoped to a single request. A KilpiScope object holds scoped values for
 * the current scope.
 *
 * Scopes can be automatically provided by plugins, or manually controlled with `Kilpi.runInScope()`
 */
export type KilpiScope<T extends AnyKilpiCore> = {
  /**
   * Store current handler for handling authorization failures.
   */
  onUnauthorized?: KilpiOnUnauthorizedHandler;

  /**
   * Cache current subject.
   */
  subjectCache?: { subjectPromise: Promise<T["$$infer"]["subject"]> };
};

// Utility type
export type AnyKilpiScope = KilpiScope<AnyKilpiCore>;

/**
 * Utility for logging a warning when no scope is available.
 */
export function warnOnScopeUnavailable(message: string) {
  console.warn(
    [
      message,
      "No scope available.",
      "\n",
      `(Attempting to access current Kilpi scope, but no scope is available.`,
      `Provide a Kilpi scope either with a plugin or manually via Kilpi.runInScope().`,
      `Read mode: https://kilpi.vercel.app/concepts/scope)`,
    ].join(" "),
  );
}
