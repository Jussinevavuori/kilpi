import type { AnyKilpiCore } from "@kilpi/core";
import { KilpiClient, type KilpiClientOptions } from "./KilpiClient";

/**
 * Create Kilpi for the client.
 */
export function createKilpiClient<T extends AnyKilpiCore>(
  options: KilpiClientOptions<T>,
): KilpiClient<T> {
  return new KilpiClient<T>(options);
}
