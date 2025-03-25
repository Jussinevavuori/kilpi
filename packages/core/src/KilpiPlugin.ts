import type { AnyKilpiCore } from "./KilpiCore";

export type KilpiPlugin<TIn extends AnyKilpiCore, TExtension extends object> = (
  core: TIn,
) => TExtension;

/**
 * Kilpi plugins are functions that take in a KilpiCore instance, do something with the instance
 * and finally return the public interface for the plugin (or `{}`).
 *
 * ## Example
 *
 * @usage
 * ```ts
 * function CountAuthorizationsPlugin<T extends AnyKilpiCore>(opts: { msg: string }) {
 *   return createKilpiPlugin((Kilpi: T) => {
 *
 *     let count = 0;
 *
 *     Kilpi.hooks.onBeforeAuthorization(() => {
 *       count++;
 *     })
 *
 *     return {
 *       counter: {
 *         logCount() {
 *           console.log(msg.replace("%", count.toString()));
 *         }
 *       }
 *     };
 *   })
 * }
 *
 * const Kilpi = createKilpi({
 *   getSubject,
 *   policies,
 *   plugins: [
 *     CountAuthorizationsPlugin({ msg: "% authorizations made!" }),
 *   ],
 * })
 *
 * Kilpi.authorize("policy");
 *
 * Kilpi.counter.logCount(); // 1 authorizations made!
 * ```
 */
export function createKilpiPlugin<TIn extends AnyKilpiCore, TExtension extends object>(
  plugin: KilpiPlugin<TIn, TExtension>,
): KilpiPlugin<TIn, TExtension> {
  return plugin;
}
