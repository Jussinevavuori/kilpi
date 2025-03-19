import type { KilpiPluginFactory } from "./kilpi-plugin";
import type { KilpiScope } from "./kilpi-scope";
import type { Policyset } from "./policy";

/**
 * Arguments passed to construct a KilpiCore instance.
 */
export type KilpiConstructorArgs<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
> = {
  /**
   * Connect your own authentication provider (and other subject data / metadata) via a
   * custom `getSubject` function.
   *
   * Tip: Should be cached with e.g. `React.cache()` or similar API as it will be called
   * during each authorization check.
   */
  getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Default values when no value is available from a scope.
   */
  defaults?: Pick<KilpiScope<TSubject, TPolicyset>, "onUnauthorized">;

  /**
   * The policies which define the authorization logic of the application.
   */
  policies: TPolicyset;

  /**
   * List of plugins
   */
  plugins?: KilpiPluginFactory<
    NoInfer<TSubject>,
    NoInfer<TPolicyset>,
    Record<never, never>
  >[];

  /**
   * Custom advanced behaviour
   */
  advanced?: {
    disableSubjectCaching?: boolean;
  };
};
