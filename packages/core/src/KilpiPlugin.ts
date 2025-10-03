import type { AnyKilpiCore } from "./KilpiCore";

export type KilpiPlugin<TCore extends AnyKilpiCore, TCoreExtension extends object> = (
  core: TCore,
) => {
  extendCore?: () => TCoreExtension;
};

/**
 * Kilpi core plugins are functions that take in a KilpiCore instance and can e.g. register hooks,
 * extend the core interface or extend the policy interface.
 *
 * ## Example
 *
 * @usage
 * ```ts
 * function CounterPlugin<T extends AnyKilpiCore>(opts: { message: string }) {
 *   return createKilpiCorePlugin((Kilpi: T) => {
 *     let count = 0;
 *     Kilpi.$hooks.onAfterAuthorization(() => count++);
 *
 *     return {
 *       extendCoreApi: {
 *         $logCount: () => console.log(opts.message.replace("%", count.toString()));
 *       }
 *     };
 *   })
 * }
 *
 * const Kilpi = createKilpi({
 *   getSubject,
 *   policies,
 *   plugins: [CounterPlugin({ message: "% authorizations made!" })],
 * })
 *
 * Kilpi.$logCount(); // 10 authorizations made!
 * ```
 */
export function createKilpiPlugin<TCore extends AnyKilpiCore, TCoreExtension extends object>(
  plugin: KilpiPlugin<TCore, TCoreExtension>,
) {
  return plugin;
}
