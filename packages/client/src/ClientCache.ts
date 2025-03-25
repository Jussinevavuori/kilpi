/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * All keys in the cache are complex arrays.
 */
type ClientCacheKey = unknown[];

/**
 * Cache value type.
 */
type ClientCacheValue<T = any> = {
  /**
   * The value to cache.
   */
  data: T;

  /**
   * Unix timestamp of when the value was set in the cache.
   */
  timestamp: number;

  /**
   * Time to live in milliseconds from the timestamp (optional).
   */
  ttlMs?: number;
};

/**
 * Cache implementation for react-query inspired complex keys.
 */
export class ClientCache {
  /**
   * Store all cached values in a map.
   */
  private cache: Map<string, ClientCacheValue>;
  constructor() {
    this.cache = new Map();
  }

  /**
   * Utility function to cache a function.
   */
  async wrap<T>(
    options: { cacheKey: ClientCacheKey; ttlMs?: number },
    fn: () => Promise<T>,
  ): Promise<T> {
    // Cache hit
    const cacheHit = this.get<T>(options.cacheKey);
    if (cacheHit) return cacheHit;

    // Cache miss: Auto-populate cache
    const value = await fn();
    this.set(options.cacheKey, value, { ttlMs: options.ttlMs });
    return value;
  }

  /**
   * Set a value in the cache.
   */
  set<T>(key: ClientCacheKey, data: T, options: { ttlMs?: number } = {}) {
    const cacheKey = this.serializeKey(key);
    this.cache.set(cacheKey, { data, timestamp: Date.now(), ttlMs: options.ttlMs });
  }

  /**
   * Get a value from cache (or undefined if no value in cache). If the value is expired, it will be
   * removed from the cache.
   */
  get<T>(key: ClientCacheKey): T | undefined {
    // Get entry from cache
    const cacheKey = this.serializeKey(key);
    const entry = this.cache.get(cacheKey);

    // Cache miss
    if (!entry) return undefined;

    // Cache expired
    if (entry.ttlMs !== undefined && Date.now() - entry.timestamp > entry.ttlMs) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    // Cache hit
    return entry.data;
  }

  /**
   * Stable key serialization utility.
   */
  private serializeKey(key: ClientCacheKey): string {
    return JSON.stringify(key, (_, value) =>
      typeof value === "object" && value !== null
        ? Object.keys(value)
            .sort()
            .reduce(
              (acc, k) => {
                acc[k] = (value as any)[k];
                return acc;
              },
              {} as Record<string, any>,
            )
        : value,
    );
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
  }
}
