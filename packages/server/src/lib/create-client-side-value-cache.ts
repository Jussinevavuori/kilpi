/**
 * Simple cache implementation for a single value. If not defined, cache time is infinite.
 */
export function createClientSideValueCache<T>(
  options: { intialValue?: T; cacheTimeSeconds?: number } = {}
) {
  const cacheTimeMs = 1000 * (options.cacheTimeSeconds ?? Infinity);
  let updatedAt: number | null = null;
  let value: T | undefined = options.intialValue ?? undefined;

  function invalidate() {
    updatedAt = null;
    value = undefined;
  }

  function isExpired() {
    return updatedAt && Date.now() > updatedAt + cacheTimeMs;
  }

  return {
    /**
     * Get current value
     */
    get(): T | undefined {
      // Invalidate if expired
      if (isExpired()) invalidate();
      return value;
    },

    /**
     * Set new value
     */
    set(newValue: T) {
      updatedAt = Date.now();
      value = newValue;
    },

    /**
     * Invalidate the cache
     */
    invalidate() {
      invalidate();
    },
  };
}

export type ClientSideValueCache<T> = ReturnType<typeof createClientSideValueCache<T>>;
