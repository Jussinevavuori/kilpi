import { KilpiCore, type KilpiConstructorArgs } from "./KilpiCore";
import type { KilpiPlugin } from "./KilpiPlugin";
import type { Policyset } from "./policy";
import type { UnionToIntersection } from "./utils/types";

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 */
export function createKilpi<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
  TInterface extends object,
>({
  plugins = [],
  ...kilpiCoreOptions
}: KilpiConstructorArgs<TSubject, TPolicyset> & {
  plugins?: KilpiPlugin<KilpiCore<NoInfer<TSubject>, NoInfer<TPolicyset>>, TInterface>[];
}) {
  // Construct base KilpiCore class
  const Kilpi = new KilpiCore(kilpiCoreOptions);

  // Apply each plugin and get the plugin interfaces
  const interfaces = plugins.map((applyPlugin) => applyPlugin(Kilpi));

  // Merge all plugin interfaces (This has to be manually typed with `as` for it to work)
  const mergedInterface = interfaces.reduce((merged, pluginInterface) => {
    return Object.assign(merged, pluginInterface);
  }, {}) as UnionToIntersection<TInterface>;

  // Return Kilpi with merged interface
  return Object.assign(Kilpi, mergedInterface);
}
