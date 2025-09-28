import type { AnyKilpiCore } from "@kilpi/core";
import type { KilpiClient } from "./KilpiClient";

// Alternative naming suggestions:
// - "publicInterface" could be "expose", "api", "methods", or "exports".
// - "extendPolicy" could be "policyExtension", "extendPolicyApi", or "policyEnhancer".

export type KilpiClientPlugin<TCore extends AnyKilpiCore, TExtension extends object> = (
  core: KilpiClient<TCore>,
) => {
  extendClientApi?: TExtension;
};

/**
 * Kilpi plugins are functions that take in a KilpiCore instance, do something with the instance
 * and finally return the public interface for the plugin (or `{}`).
 *
 * ## Example
 *
 * @usage
 * ```ts
 * function SayHelloPlugin<T extends AnyKilpiCore>(opts: { name: string }) {
 *   return createKilpiPlugin((Client: KilpiClient<T>) => {
 *     return {
 *       extendClientApi: {
 *         $sayHello: () => console.log(`Hello rom ${opts.name}`),
 *        }
 *     };
 *   })
 * }
 *
 * const KilpiClient = createKilpiClient<typeof Kilpi>({
 *   plugins: [
 *     SayHelloPlugin({ name: "Kilpi Client Plugin" }),
 *   ],
 * })
 *
 * Kilpi.$sayHello(); // Hello from Kilpi Client Plugin
 * ```
 */
export function createKilpiClientPlugin<TCore extends AnyKilpiCore, TExtension extends object>(
  plugin: KilpiClientPlugin<TCore, TExtension>,
) {
  return plugin;
}
