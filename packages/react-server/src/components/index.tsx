import type { KilpiCore } from "@kilpi/core";
import type { CreateReactServerComponentOptions } from "../types";
import { createAccess } from "./Access";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Create all react server components for integrating Kilpi in RSCs.
 */
export function createKilpiReactServerComponents<T extends KilpiCore<any, any>>(
  Kilpi: T,
  options: CreateReactServerComponentOptions,
) {
  return {
    Access: createAccess(Kilpi, options),
  };
}
