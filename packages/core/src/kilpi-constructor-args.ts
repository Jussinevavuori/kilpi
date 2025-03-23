import type { KilpiCore } from "./kilpi-core";
import type { KilpiScope } from "./kilpi-scope";
import type { Policyset } from "./policy";

/**
 * Arguments passed to construct a KilpiCore instance.
 */
export type KilpiConstructorArgs<TSubject, TPolicyset extends Policyset<TSubject>> = {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: () => Promise<TSubject>;

  /**
   * Default values when no value is available from a scope.
   */
  defaults?: Pick<KilpiScope<KilpiCore<TSubject, TPolicyset>>, "onUnauthorized">;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * Custom settings
   */
  settings?: {
    disableSubjectCaching?: boolean;
  };
};
