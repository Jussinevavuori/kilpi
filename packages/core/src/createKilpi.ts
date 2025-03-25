import { KilpiCore, type KilpiConstructorArgs } from "./KilpiCore";
import type { KilpiPlugin } from "./KilpiPlugin";
import type { Policyset } from "./policy";

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 *
 * Overloaded to support up to 10 plugins. Support for more plugins can be added by extending
 * the overload signatures.
 */
export function createKilpi<S, P extends Policyset<S>>(
  args: KilpiConstructorArgs<S, P> & {
    plugins?: [];
  },
): KilpiCore<S, P>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1];
  },
): KilpiCore<S, P> & ReturnType<P1>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2];
  },
): KilpiCore<S, P> & ReturnType<P1> & ReturnType<P2>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3];
  },
): KilpiCore<S, P> & ReturnType<P1> & ReturnType<P2> & ReturnType<P3>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4];
  },
): KilpiCore<S, P> & ReturnType<P1> & ReturnType<P2> & ReturnType<P3> & ReturnType<P4>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4, P5];
  },
): KilpiCore<S, P> &
  ReturnType<P1> &
  ReturnType<P2> &
  ReturnType<P3> &
  ReturnType<P4> &
  ReturnType<P5>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P6 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4, P5, P6];
  },
): KilpiCore<S, P> &
  ReturnType<P1> &
  ReturnType<P2> &
  ReturnType<P3> &
  ReturnType<P4> &
  ReturnType<P5> &
  ReturnType<P6>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P6 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P7 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4, P5, P6, P7];
  },
): KilpiCore<S, P> &
  ReturnType<P1> &
  ReturnType<P2> &
  ReturnType<P3> &
  ReturnType<P4> &
  ReturnType<P5> &
  ReturnType<P6> &
  ReturnType<P7>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P6 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P7 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P8 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4, P5, P6, P7, P8];
  },
): KilpiCore<S, P> &
  ReturnType<P1> &
  ReturnType<P2> &
  ReturnType<P3> &
  ReturnType<P4> &
  ReturnType<P5> &
  ReturnType<P6> &
  ReturnType<P7> &
  ReturnType<P8>;

export function createKilpi<
  S,
  P extends Policyset<S>,
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P6 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P7 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P8 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P9 extends KilpiPlugin<KilpiCore<S, P>, object>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [P1, P2, P3, P4, P5, P6, P7, P8, P9];
  },
): KilpiCore<S, P> &
  ReturnType<P1> &
  ReturnType<P2> &
  ReturnType<P3> &
  ReturnType<P4> &
  ReturnType<P5> &
  ReturnType<P6> &
  ReturnType<P7> &
  ReturnType<P8> &
  ReturnType<P9>;

// Implementation
export function createKilpi<
  S, //TSubject
  P extends Policyset<S>, // TPolicyset
  P1 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P2 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P3 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P4 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P5 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P6 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P7 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P8 extends KilpiPlugin<KilpiCore<S, P>, object>,
  P9 extends KilpiPlugin<KilpiCore<S, P>, object>,
>({
  plugins = [],
  ...args
}: KilpiConstructorArgs<S, P> & {
  // Strongly typed plugins
  // prettier-ignore
  plugins?:
      | []
			| [P1]
			| [P1, P2]
			| [P1, P2, P3]
			| [P1, P2, P3, P4]
			| [P1, P2, P3, P4, P5]
			| [P1, P2, P3, P4, P5, P6]
			| [P1, P2, P3, P4, P5, P6, P7]
			| [P1, P2, P3, P4, P5, P6, P7, P8]
			| [P1, P2, P3, P4, P5, P6, P7, P8, P9];
}) {
  // Construct base KilpiCore class
  const Kilpi = new KilpiCore(args);

  // Apply each plugin and get the plugin interfaces
  const interfaces = plugins.map((applyPlugin) => applyPlugin(Kilpi));

  // Merge all plugin interfaces
  const mergedInterface = interfaces.reduce(
    (acc, plugin) => {
      return { ...acc, ...plugin };
    },
    {} as ReturnType<P1> &
      ReturnType<P2> &
      ReturnType<P3> &
      ReturnType<P4> &
      ReturnType<P5> &
      ReturnType<P6> &
      ReturnType<P7> &
      ReturnType<P8> &
      ReturnType<P9>,
  );

  // Return Kilpi with merged interface
  return Object.assign(Kilpi, mergedInterface);
}
