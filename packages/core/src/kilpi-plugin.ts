import type { KilpiCore } from "./kilpi-core";
import type { KilpiScope } from "./kilpi-scope";
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
  TInterface extends object = EmptyInterface,
> = Pick<
  KilpiPlugin<TSubject, TPolicyset, TInterface>,
  "name" | "interface" | "getScope"
>;

/**
 * Kilpi plugin base class to be extended
 */
export class KilpiPlugin<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TInterface extends object = EmptyInterface,
> {
  /**
   * Plugin name
   */
  name: string;

  /**
   * A plugin may automatically attempt to provide a scope for Kilpi.
   */
  getScope?: () => KilpiScope<TSubject, TPolicyset> | undefined;

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
  interface: TInterface;

  constructor(args: KilpiPluginArgs<TSubject, TPolicyset, TInterface>) {
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
  TInterface extends object = Record<never, never>,
> = (
  Kilpi: KilpiCore<TSubject, TPolicyset>,
) => KilpiPlugin<TSubject, TPolicyset, TInterface>;
