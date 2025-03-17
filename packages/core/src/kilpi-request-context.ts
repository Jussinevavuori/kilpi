import type { Policy } from "./policy";

/**
 * Type of handler which is called when `KilpiCore.authorize()` denies access. This handler is
 * primarily responsible for customizing which value is thrown when access is denied (e.g.
 * to redirect to a login page, or to return a 403 status code).
 */
export type KilpiOnUnauthorizedHandler = (options: {
  /**
   * Message (if provided) for details on why access was denied.
   */
  message?: string;

  /**
   * Policy (if provided) which denied access.
   */
  policy?: Policy<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Subject (if provided) which was denied access.
   */
  subject?: unknown;
}) => void | never | Promise<void> | Promise<never>;

/**
 * Kilpi context object is designed to hold the "global request state", e.g. all values which
 * should be considered global to the current request.
 *
 * A Kilpi context can be explicitly controlled with `KilpiCore.runWithContext()`, or implicitly
 * with an adapter. If no explicit context or adapter context is provided, the default values
 * passed to KilpiCore will be used.
 */
export type KilpiRequestContext = {
  onUnauthorized?: KilpiOnUnauthorizedHandler;
};
