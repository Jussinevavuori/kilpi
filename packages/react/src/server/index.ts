import { Ruleset } from "@kilpi/core";
import { KilpiServerClient } from "@kilpi/server";
import { createAccessComponent } from "./Access";
import { CreateReactServerComponentOptions } from "./types";

/**
 * Create all React server components for Kilpi usage on React Server.
 */
export function createKilpiReactServerComponents<
  TSubject extends object | undefined | null,
  TRuleset extends Ruleset<TSubject>
>(Kilpi: KilpiServerClient<TSubject, TRuleset>, options: CreateReactServerComponentOptions) {
  const Access = createAccessComponent(Kilpi, options);
  return { Access };
}
