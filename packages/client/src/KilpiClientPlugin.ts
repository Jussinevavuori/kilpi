import type { AnyKilpiCore } from "@kilpi/core";
import type { KilpiClient } from "./KilpiClient";

export type KilpiClientPlugin<TIn extends AnyKilpiCore, TExtension extends object> = (
  core: KilpiClient<TIn>,
) => TExtension;

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
 *       sayHello: () => console.log(`Hello rom ${opts.name}`),
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
 * Kilpi.sayHello(); // Hello from Kilpi Client Plugin
 * ```
 */
export function createKilpiClientPlugin<TIn extends AnyKilpiCore, TExtension extends object>(
  plugin: KilpiClientPlugin<TIn, TExtension>,
): KilpiClientPlugin<TIn, TExtension> {
  return plugin;
}
