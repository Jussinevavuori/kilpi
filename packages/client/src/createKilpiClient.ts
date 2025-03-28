import type { AnyKilpiCore } from "@kilpi/core";
import { KilpiClient, type KilpiClientOptions } from "./KilpiClient";
import type { KilpiClientPlugin } from "./KilpiClientPlugin";
import type { AnyLengthHead } from "./utils/types";

/**
 * Create Kilpi for the client.
 */
export function createKilpiClient<
  T extends AnyKilpiCore,
  P1 extends object,
  P2 extends object,
  P3 extends object,
  P4 extends object,
  P5 extends object,
  P6 extends object,
  P7 extends object,
  P8 extends object,
  P9 extends object,
>({
  plugins = [],
  ...options
}: KilpiClientOptions & {
  infer?: T;
  // Support up to 9 strongly typed plugins
  plugins?: AnyLengthHead<
    [
      KilpiClientPlugin<NoInfer<T>, P1>,
      KilpiClientPlugin<NoInfer<T>, P2>,
      KilpiClientPlugin<NoInfer<T>, P3>,
      KilpiClientPlugin<NoInfer<T>, P4>,
      KilpiClientPlugin<NoInfer<T>, P5>,
      KilpiClientPlugin<NoInfer<T>, P6>,
      KilpiClientPlugin<NoInfer<T>, P7>,
      KilpiClientPlugin<NoInfer<T>, P8>,
      KilpiClientPlugin<NoInfer<T>, P9>,
    ]
  >;
}) {
  // Construct base KilpiCore class
  const Client = new KilpiClient<T>(options);

  // Apply each plugin and get the plugin interfaces
  const interfaces = plugins.map((applyPlugin) => applyPlugin(Client));

  // Merge all plugin interfaces (This has to be manually typed with `as` for it to work)
  const mergedInterface = interfaces.reduce((merged, pluginInterface) => {
    return Object.assign(merged, pluginInterface);
  }, {}) as P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9;

  // Return Kilpi with merged interface
  return Object.assign(Client, mergedInterface);
}
