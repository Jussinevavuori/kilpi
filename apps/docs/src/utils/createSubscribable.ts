export function createSubscribable<T>() {
  const subscribers = new Set<(value: T) => void>();
  let latest: T | undefined;

  return {
    /**
     * Access the latest value.
     */
    getLatest() {
      return latest;
    },

    /**
     * Access and map the latest value.
     */
    mapLatest<TOutput>(map: (t: T) => TOutput): TOutput | undefined {
      if (!latest) return undefined;
      return map(latest);
    },

    /**
     * Subscribe to published value events with a listener.
     */
    subscribe(callback: (value: T) => void) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },

    /**
     * Publish a new value.
     */
    publish(value: T) {
      latest = value;
      for (const subscriber of subscribers) {
        subscriber(value);
      }
    },
  };
}

export type Subscribable<T> = ReturnType<typeof createSubscribable<T>>;
