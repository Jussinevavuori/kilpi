/** https://trpc.io/blog/tinyrpc-client */

export type RecursiveProxyCallbackOptions = {
  path: readonly string[];
  args: readonly unknown[];
};

export type RecursiveProxyCallback = (opts: RecursiveProxyCallbackOptions) => unknown;

/**
 * Utility for creating a recursive proxy.
 */
export function createRecursiveProxy(callback: RecursiveProxyCallback, path: readonly string[]) {
  return new Proxy(() => {}, {
    get(_obj, key) {
      if (typeof key !== "string") return undefined;

      // Recursively compose the full path until a function is invoked
      return createRecursiveProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      // Call the callback function with the entire path and forward the arguments
      return callback({ path, args });
    },
  }) as unknown;
}
