import { KilpiCore, type KilpiConstructorArgs } from "./kilpi-core";
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
export function createKilpi<S, P extends Policyset<S>, T1 extends KilpiCore<S, P>>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [(t: KilpiCore<S, P>) => T1];
  },
): T1;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [(t: KilpiCore<S, P>) => T1, (t: T1) => T2];
  },
): T2;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3];
  },
): T3;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4];
  },
): T4;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
    ];
  },
): T5;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
      (t: T5) => T6,
    ];
  },
): T6;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
  T7 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
      (t: T5) => T6,
      (t: T6) => T7,
    ];
  },
): T7;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
  T7 extends KilpiCore<S, P>,
  T8 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
      (t: T5) => T6,
      (t: T6) => T7,
      (t: T7) => T8,
    ];
  },
): T8;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
  T7 extends KilpiCore<S, P>,
  T8 extends KilpiCore<S, P>,
  T9 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
      (t: T5) => T6,
      (t: T6) => T7,
      (t: T7) => T8,
      (t: T8) => T9,
    ];
  },
): T9;
export function createKilpi<
  S,
  P extends Policyset<S>,
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
  T7 extends KilpiCore<S, P>,
  T8 extends KilpiCore<S, P>,
  T9 extends KilpiCore<S, P>,
  T10 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    plugins: [
      (t: KilpiCore<S, P>) => T1,
      (t: T1) => T2,
      (t: T2) => T3,
      (t: T3) => T4,
      (t: T4) => T5,
      (t: T5) => T6,
      (t: T6) => T7,
      (t: T7) => T8,
      (t: T8) => T9,
      (t: T9) => T10,
    ];
  },
): T10;
export function createKilpi<
  S, //TSubject
  P extends Policyset<S>, // TPolicyset
  T1 extends KilpiCore<S, P>,
  T2 extends KilpiCore<S, P>,
  T3 extends KilpiCore<S, P>,
  T4 extends KilpiCore<S, P>,
  T5 extends KilpiCore<S, P>,
  T6 extends KilpiCore<S, P>,
  T7 extends KilpiCore<S, P>,
  T8 extends KilpiCore<S, P>,
  T9 extends KilpiCore<S, P>,
  T10 extends KilpiCore<S, P>,
>(
  args: KilpiConstructorArgs<S, P> & {
    // Strongly typed plugins
    // prettier-ignore
    plugins?:
      | undefined
      | []
      | [(t: KilpiCore<S, P>) => T1]
      | [(t: KilpiCore<S, P>) => T1, (t: T1) => T2]
      | [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3]
      | [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5, (t: T5) => T6]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5, (t: T5) => T6, (t: T6) => T7]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5, (t: T5) => T6, (t: T6) => T7, (t: T7) => T8]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5, (t: T5) => T6, (t: T6) => T7, (t: T7) => T8, (t: T8) => T9]
			| [(t: KilpiCore<S, P>) => T1, (t: T1) => T2, (t: T2) => T3, (t: T3) => T4, (t: T4) => T5, (t: T5) => T6, (t: T6) => T7, (t: T7) => T8, (t: T8) => T9, (t: T9) => T10]
  },
): KilpiCore<S, P> | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 {
  // Construct base KilpiCore class
  const Kilpi = new KilpiCore(args);

  // Run all plugins
  return (args.plugins ?? []).reduce<
    KilpiCore<S, P> | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10
  >(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc, fn) => fn(acc as any),
    Kilpi,
  );
}
