import fastJsonStableStringify from "fast-json-stable-stringify";
import type { AnyKilpiClient } from "./KilpiClient";
import type { KilpiClientHooks } from "./KilpiClientHooks";

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
   * Invalidate the cache by deleting a specific key.
   *
   * Calls all onCacheInvalidate hooks.
   */
  public invalidate() {
    this.#asyncCache.clear();
    this.#hooks.registeredHooks.onCacheInvalidate.forEach((hook) => hook({}));
  }
}
