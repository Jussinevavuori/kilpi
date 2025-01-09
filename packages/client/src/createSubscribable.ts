/**
 * Create a simple pub-sub channel of event type T.
 */
export function createSubscribable<T>() {
  const subscribers = new Set<(value: T) => void>();

  return {
    /**
     * Subscribe to changes
     */
    subscribe(callback: (value: T) => void) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },

    /**
     * Publish new value
     */
    publish(value: T) {
      for (const subscriber of subscribers) {
        subscriber(value);
      }
    },
  };
}
