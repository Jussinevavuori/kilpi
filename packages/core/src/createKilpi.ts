import { KilpiCore, type KilpiConstructorArgs } from "./KilpiCore";
import type { KilpiPlugin } from "./KilpiPlugin";
import type { Policyset } from "./policy";
import type { AnyLengthHead } from "./utils/types";

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 */
export function createKilpi<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
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
  ...kilpiCoreOptions
}: KilpiConstructorArgs<TSubject, TPolicyset> & {
  // Support up to 9 strongly typed plugins
  plugins?: AnyLengthHead<
    [
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P1>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P2>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P3>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P4>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P5>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P6>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P7>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P8>,
      KilpiPlugin<KilpiCore<TSubject, TPolicyset>, P9>,
    ]
  >;
}) {
  // Construct base KilpiCore class
  const Kilpi = new KilpiCore(kilpiCoreOptions);

  // Apply each plugin and get the plugin interfaces
  const interfaces = plugins.map((applyPlugin) => applyPlugin(Kilpi));

  // Merge all plugin interfaces (This has to be manually typed with `as` for it to work)
  const mergedInterface = interfaces.reduce((merged, pluginInterface) => {
    return Object.assign(merged, pluginInterface);
  }, {}) as P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9;

  // Return Kilpi with merged interface
  return Object.assign(Kilpi, mergedInterface);
}
