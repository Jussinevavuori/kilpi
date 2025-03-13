import type { Rule } from "./rule";

/**
 * Handler when `protect()` denies access. Either a sync or async function that runs a side effect
 * on denial (e.g. a log) or throws an error or other throwable, e.g. a redirect.
 */
export type KilpiOnUnauthorizedHandler = (options: {
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule?: Rule<any, any, any>;
  subject?: unknown;
}) => void | never | Promise<void> | Promise<never>;

/**
 * KilpiContext provides values for the current Kilpi execution context, e.g.
 * the current on deny handler.
 */

export type KilpiContext = {
  onUnauthorized?: KilpiOnUnauthorizedHandler;
};
