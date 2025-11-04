import fastJsonStableStringify from "fast-json-stable-stringify";
import type { AnyKilpiClient } from "./KilpiClient";
import type { KilpiClientHooks } from "./KilpiClientHooks";
import { removeStringSuffix } from "./utils/removeStringSuffix";

export class KilpiClientCache<TClient extends AnyKilpiClient> {
  #hooks: KilpiClientHooks<TClient>;
  #asyncCache: Map<string, Promise<unknown>>;

  constructor(hooks: KilpiClientHooks<TClient>) {
    this.#hooks = hooks;
    this.#asyncCache = new Map();
  }

  /**
   * Wrap a function with a cache key to cache the result.
   */
  static runAsyncCachedFunction<TData, TClient extends AnyKilpiClient>(
    options: { key: unknown[]; client: TClient },
    resolve: () => Promise<TData>,
  ): Promise<TData> {
    // Stable stringify the key to ensure consistent keying
    const key = fastJsonStableStringify(options.key);

    // Cache hit
    const cachedPromise = options.client.$cache.#asyncCache.get(key);
    if (cachedPromise) return cachedPromise as Promise<TData>;

    // Cache miss
    const promise = resolve();
    options.client.$cache.#asyncCache.set(key, promise);
    return promise;
  }

  /**
   * Invalidate the full cache, a single key or a path of keys.
   *
   * @usage
   * ```ts
   * cache.invalidate();            // Invalidate all
   * cache.invalidate([]);          // Invalidate all
   * cache.invalidate(['a']);       // Invalidates "a" and all keys under it (e.g. "a.b", "a.b.c")
   * cache.invalidate(['b', 'c']);  // Invalidate "b.c" and all keys under it (e.g. "b.c.d")
   * ```
   *
   * Calls all onCacheInvalidate hooks.
   */
  public invalidate(path: unknown[] = []) {
    if (path.length === 0) {
      this.#asyncCache.clear();
    } else {
      this.#asyncCache.keys().forEach((key) => {
        if (KilpiClientCache.keyMatchesPath(key, path)) {
          this.#asyncCache.delete(key);
        }
      });
    }

    // Dispatch hook with constructed utility function
    this.#hooks.registeredHooks.onCacheInvalidate.forEach((hook) =>
      hook({
        path,
        matches(key) {
          const extractedKey = typeof key === "object" && "$cacheKey" in key ? key.$cacheKey : key;
          return KilpiClientCache.keyMatchesPath(extractedKey, path);
        },
      }),
    );
  }

  /**
   * Fine-grained invalidation: invalidate a specific cache key.
   *
   * Only supports invalidating a single key. Use `invalidate` to invalidate single keys,
   * paths or the full cache.
   *
   * @deprecated Will be removed in future versions. Use `invalidate` instead.
   */
  public invalidateKey(key: unknown[]) {
    const stringifiedKey = fastJsonStableStringify(key);
    this.#asyncCache.delete(stringifiedKey);
    this.#hooks.registeredHooks.onCacheInvalidate.forEach((hook) =>
      hook({
        path: key,
        matches(key) {
          const extractedKey = typeof key === "object" && "$cacheKey" in key ? key.$cacheKey : key;
          return fastJsonStableStringify(extractedKey) === stringifiedKey;
        },
      }),
    );
  }

  /**
   * Check if a target cache key matches a path. Matches if the key is a prefix of the path
   * or equals the path.
   */
  static keyMatchesPath(key: unknown[] | string, path: unknown[]) {
    const keyStr = typeof key === "string" ? key : fastJsonStableStringify(key);
    const pathStr = removeStringSuffix(fastJsonStableStringify(path), "]");
    return keyStr.startsWith(pathStr);
  }
}
