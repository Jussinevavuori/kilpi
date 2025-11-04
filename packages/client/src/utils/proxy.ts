/** https://trpc.io/blog/tinyrpc-client */

export type RecursiveProxyCallbackOptions = {
  path: readonly string[];
  args: readonly unknown[];
};

export type RecursiveProxyCallback = (opts: RecursiveProxyCallbackOptions) => unknown;

/**
 * Utility for creating a recursive proxy.
 */
export function createRecursiveProxy<TNamespace extends object>(
  callback: RecursiveProxyCallback,
  options: {
    path: readonly string[];
    decorateNamespace?: (path: readonly string[]) => TNamespace;
  },
) {
  // Instantiate namespace decoration once per proxy
  const namespaceDecoration = options.decorateNamespace?.(options.path);

  return new Proxy(() => {}, {
    get(_obj, key) {
      if (typeof key !== "string") return undefined;

      // Reflect namespace decoration properties
      if (namespaceDecoration && Reflect.has(namespaceDecoration, key)) {
        const value = Reflect.get(namespaceDecoration, key);
        if (typeof value === "function") {
          return value.bind(namespaceDecoration);
        }
        return value;
      }

      // Recursively compose the full path until a function is invoked
      return createRecursiveProxy(callback, {
        decorateNamespace: options.decorateNamespace,
        path: [...options.path, key],
      });
    },

    apply(_1, _2, args) {
      return callback({ path: options.path, args });
    },
  }) as unknown;
}
