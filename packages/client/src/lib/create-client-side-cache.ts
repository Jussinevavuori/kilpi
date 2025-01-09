/**
 * Client side cache for any complex keys
 */
export function createClientSideCache<T>(cacheTimeSeconds: number = Infinity) {
  const cache = new Map<string, { updatedAt: number; value: T }>();

  function isExpired(updatedAt: number) {
    return Date.now() > updatedAt + cacheTimeSeconds * 1000;
  }

  function getCacheKey(key: any[]) {
    return JSON.stringify(key);
  }

  function invalidate(key: any[]) {
    const cacheKey = getCacheKey(key);
    cache.delete(cacheKey);
  }

  function invalidateAll() {
    cache.clear();
  }

  function get(key: any[]): T | undefined {
    const cacheKey = getCacheKey(key);
    const entry = cache.get(cacheKey);
    if (!entry) return undefined;
    if (isExpired(entry.updatedAt)) {
      cache.delete(cacheKey);
      return undefined;
    }
    return entry.value;
  }

  function set(key: any[], value: T) {
    const cacheKey = getCacheKey(key);
    cache.set(cacheKey, { updatedAt: Date.now(), value });
    return value;
  }

  return {
    get,
    set,
    invalidate,
    invalidateAll,
  };
}
