import type { AnyKilpiCore } from "@kilpi/core";
import { KilpiClient, type KilpiClientOptions } from "./KilpiClient";
import type { KilpiClientPlugin } from "./KilpiClientPlugin";
import type { UnionToIntersection } from "./utils/types";

/**
 * Create Kilpi for the client.
 */
export function createKilpiClient<T extends AnyKilpiCore, TInterface extends object>({
  plugins = [],
  ...options
}: KilpiClientOptions & {
  infer?: T;
  plugins?: KilpiClientPlugin<T, TInterface>[];
}) {
  // Construct base KilpiCore class
  const Client = new KilpiClient(options);

  // Apply each plugin and get the plugin interfaces
  const interfaces = plugins.map((applyPlugin) => applyPlugin(Client));

  // Merge all plugin interfaces (This has to be manually typed with `as` for it to work)
  const mergedInterface = interfaces.reduce((merged, pluginInterface) => {
    return Object.assign(merged, pluginInterface);
  }, {}) as UnionToIntersection<TInterface>;

  // Return Kilpi with merged interface
  return Object.assign(Client, mergedInterface);
}
