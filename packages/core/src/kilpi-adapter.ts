import type { KilpiRequestContext } from "./kilpi-request-context";

/**
 * Each adapter library should return an initializer function to provide to Kilpi. This way, the
 * default values (and other parameters in the future) can be provided to the adapter.
 */
export type KilpiAdapterInitializer = (options: {
  defaults?: KilpiRequestContext;
}) => KilpiAdapter;

/**
 * Adapters are used to automatically connect Kilpi to the current request context. This allows
 * for easy integration of Kilpi into existing frameworks and libraries.
 */
export type KilpiAdapter = {
  getContext: () => KilpiRequestContext | undefined;
};
