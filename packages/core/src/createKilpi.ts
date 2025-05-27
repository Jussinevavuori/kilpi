import { KilpiCore, type AnyGetSubject, type KilpiConstructorArgs } from "./KilpiCore";
import type { KilpiPlugin } from "./KilpiPlugin";
import type { Policyset } from "./policy";
import type { AnyLengthHead } from "./utils/types";

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 */
export function createKilpi<
  TGetSubject extends AnyGetSubject,
  TPolicyset extends Policyset<Awaited<ReturnType<TGetSubject>>>,
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
}: KilpiConstructorArgs<TGetSubject, TPolicyset> & {
  // Support up to 9 strongly typed plugins
  plugins?: AnyLengthHead<
    [
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P1>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P2>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P3>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P4>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P5>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P6>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P7>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P8>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P9>,
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
