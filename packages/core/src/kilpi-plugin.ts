import type { AnyKilpiCore } from "./kilpi-core";

export type KilpiPlugin<TIn extends AnyKilpiCore, TOut extends AnyKilpiCore> = (core: TIn) => TOut;

/**
 * Kilpi plugins are functions that take in a KilpiCore instance, do something with the instance
 * and finally return the instance with optional modifications (using `Object.assign`).
 *
 * ## Example
 *
 * @usage
 * ```ts
 * function SayHelloPlugin(opts: { name: string }) {
 *   return createKilpiPlugin((core) => {
 *     return Object.assign(core, {
 *       sayHello: () => console.log(`Hello, ${opts.name}!`),
 *     });
 *   })
 * }
 *
 * createKilpi({
 *   ...,
 *   plugins: [SayHelloPlugin({ name: "World!" })],
 * })
 * ```
 */
export function createKilpiPlugin<TIn extends AnyKilpiCore, TOut extends AnyKilpiCore>(
  plugin: KilpiPlugin<TIn, TOut>,
): KilpiPlugin<TIn, TOut> {
  return plugin;
}
