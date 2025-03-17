import type { KilpiConstructorArgs } from "./kilpi-core";
import { KilpiCore } from "./kilpi-core";
import type { Policyset } from "./policy-set";

/**
 * Utility for creating a new KilpiCore instance. Primary endpoint on the Kilpi library.
 *
 * Currently, an alias for the KilpiCore constructor.
 */
export function createKilpi<
  TSubject extends object | null | undefined,
  TPolicyset extends Policyset<TSubject>,
>(args: KilpiConstructorArgs<TSubject, TPolicyset>) {
  return new KilpiCore(args);
}
