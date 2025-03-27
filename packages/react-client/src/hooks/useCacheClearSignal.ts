import type { KilpiClient } from "@kilpi/client";
import type { AnyKilpiCore } from "@kilpi/core";
import { useEffect, useState } from "react";
import { useWrapRef } from "./useWrapRef";

/**
 * Get a signal to pass to `useEffect` or other react hook as dependency to force re-calculating
 * when `
 */
export function useCacheClearSignal<T extends AnyKilpiCore>(
  client: KilpiClient<T>,
  onCacheCleared?: () => void,
) {
  const [signal, setSignal] = useState(0);

  const onCacheClearedRef = useWrapRef(onCacheCleared);

  /**
   * Subscribe to cache clear events.
   */
  useEffect(() => {
    return client.onCacheClear(() => {
      // Increment singal
      setSignal(signal + 1);

      // Run custom callback
      onCacheClearedRef.current?.();
    });
  }, [client, setSignal, onCacheClearedRef]);

  return signal;
}
