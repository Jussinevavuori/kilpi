import { KilpiConstructorArgs, KilpiCore } from "./KilpiCore";
import { Ruleset } from "./ruleset";

/**
 * KilpiCore constructor wrapped with a fake name
 */
export function createKilpi<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
>(args: KilpiConstructorArgs<TSubject, TRuleset>) {
  return new KilpiCore(args);
}
