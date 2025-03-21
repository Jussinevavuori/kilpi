import type { KilpiCore } from "./kilpi-core";
import type { ExtendedKilpiScope, KilpiScope } from "./kilpi-scope";
import type { Policyset } from "./policy";

/**
 * Utility type for empty interface default value
 */
export type EmptyInterface = Record<never, never>;

/**
 * Arguments for the KilpiPlugin constructor
 */
export type KilpiPluginArgs<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TPluginInterface extends object = EmptyInterface,
  TScopeExtension extends object = EmptyInterface,
> = Pick<
  KilpiPlugin<TSubject, TPolicyset, TPluginInterface, TScopeExtension>,
  "name" | "interface" | "getScope"
>;

/**
 * Kilpi plugin base class to be extended
 */
export class KilpiPlugin<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TPluginInterface extends object = EmptyInterface,
  TScopeExtension extends object = EmptyInterface,
> {
  /**
   * Plugin name
   */
  name: string;

  /**
   * A plugin may automatically attempt to provide a scopen for Kilpi.
   */
  getScope?: () => (KilpiScope<TSubject, TPolicyset> & Partial<TScopeExtension>) | undefined;

  /**
   * A plugin may define a public interface. For example, a reset plugin may define an interface
   * with an `reset.resetAll` method which may be called as follows.
   *
   * ```ts
   * Kilpi.reset.resetAll();
   * ```
   *
   * Namespacing all interface methods under the plugin name is recommended to avoid conflicts.
   * (Not `Kilpi.resetAll()`, instead `Kilpi.reset.resetAll()` if the plugin is named `reset`.)
   */
  interface: TPluginInterface;

  constructor(args: KilpiPluginArgs<TSubject, TPolicyset, TPluginInterface, TScopeExtension>) {
    this.name = args.name;
    this.interface = args.interface;
    this.getScope = args.getScope;
  }
}

/**
 * Kilpi plugin factory function
 */
export type KilpiPluginFactory<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TPluginInterface extends object = EmptyInterface,
  TScopeExtension extends object = EmptyInterface,
> = (
  Kilpi: KilpiCore<TSubject, TPolicyset>,
  scope: () => ExtendedKilpiScope<TSubject, TPolicyset, TScopeExtension>,
) => KilpiPlugin<TSubject, TPolicyset, TPluginInterface, TScopeExtension>;
