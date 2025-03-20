import type { Policyset } from "./policy";

/**
 * Type of handler which is called when `KilpiCore.authorize()` denies access. This handler is
 * primarily responsible for customizing which value is thrown when access is denied (e.g.
 * to redirect to a login page, or to return a 403 status code).
 */
export type KilpiOnUnauthorizedHandler = (options: {
  message: string;
}) => void | never;

/**
 * Kilpi should be scoped to a single request. A KilpiScope object holds scoped values for
 * the current scope.
 *
 * Scopes can be automatically provided by plugins, or manually controlled with `Kilpi.runInScope()`
 */
export type KilpiScope<
  TSubject,
  // eslint-disable-next-line
  _TPolicyset extends Policyset<TSubject>,
> = {
  /**
   * Store current handler for handling authorization failures.
   */
  onUnauthorized?: KilpiOnUnauthorizedHandler;

  /**
   * Cache current subject.
   */
  subjectCache?: { subject: TSubject };
};
