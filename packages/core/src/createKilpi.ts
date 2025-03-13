import type { KilpiConstructorArgs } from "./KilpiCore";
import { KilpiCore } from "./KilpiCore";
import type { Ruleset } from "./ruleset";

/**
 * KilpiCore constructor wrapped with a fake name
 */
export function createKilpi<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
>(args: KilpiConstructorArgs<TSubject, TRuleset>) {
  return new KilpiCore(args);
}
