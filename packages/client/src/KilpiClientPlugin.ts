import type { AnyKilpiCore, PolicysetActions } from "@kilpi/core";
import type { KilpiClient } from "./KilpiClient";
import type { KilpiClientPolicy } from "./KilpiClientPolicy";

// Alternative naming suggestions:
// - "publicInterface" could be "expose", "api", "methods", or "exports".
// - "extendPolicy" could be "policyExtension", "extendPolicyApi", or "policyEnhancer".

export type KilpiClientPlugin<TCore extends AnyKilpiCore, TClientExtension extends object> = (
  client: KilpiClient<TCore>,
) => {
  extendClient?: () => TClientExtension;
  extendPolicy?: (
    policy: KilpiClientPolicy<KilpiClient<TCore>, PolicysetActions<TCore["$$infer"]["policies"]>>,
  ) => object; // Typed via declaration merging in the plugin files
};

/**
 * Kilpi plugins are functions that take in a KilpiCore instance, do something with the instance
 * and finally return the public interface for the plugin (or `{}`).
 *
 * ## Example
 *
 * @usage
 * ```typescript
 * function SayHelloPlugin<T extends AnyKilpiCore>(opts: { name: string }) {
 *   return createKilpiPlugin((Client: KilpiClient<T>) => {
 *     return {
 *       extendClient() {
 *         return {
 *           $sayHello: () => console.log(`Hello from ${opts.name}`),
 *         };
 *       }
 *     };
 *   });
 * }
 *
 * const KilpiClient = createKilpiClient<typeof Kilpi>({
 *   plugins: [
 *     SayHelloPlugin({ name: "Kilpi Client Plugin" }),
 *   ],
 * });
 *
 * Kilpi.$sayHello(); // Hello from Kilpi Client Plugin
 * ```
 */
export function createKilpiClientPlugin<TCore extends AnyKilpiCore, TExtension extends object>(
  plugin: KilpiClientPlugin<TCore, TExtension>,
) {
  return plugin;
}
