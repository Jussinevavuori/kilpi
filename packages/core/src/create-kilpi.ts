import type { KilpiConstructorArgs } from "./kilpi-constructor-args";
import { KilpiCore } from "./kilpi-core";
import type { KilpiPluginFactory } from "./kilpi-plugin";
import type { Policyset } from "./policy";

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 */
export function createKilpi<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TPluginInterface extends object,
>(
  // Require strongly typed plugins factories with defined interfaces
  args: Omit<KilpiConstructorArgs<TSubject, TPolicyset>, "plugins"> & {
    plugins?: KilpiPluginFactory<TSubject, TPolicyset, TPluginInterface>[];
  },
) {
  // Construct base KilpiCore class
  let kilpiInstance = new KilpiCore(args);

  // Attach interfaces to kilpiInstance
  for (const plugin of kilpiInstance.plugins) {
    kilpiInstance = Object.assign(kilpiInstance, plugin.interface);
  }

  // Return with interfaces properly typed
  return kilpiInstance as KilpiCore<TSubject, TPolicyset> & TPluginInterface;
}
