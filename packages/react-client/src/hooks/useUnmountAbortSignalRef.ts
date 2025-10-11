import { useEffect, useRef } from "react";

/**
 * Create an abort signal that aborts on unmount.
 */
export function useUnmountAbortSignalRef() {
  const controllerRef = useRef(new AbortController());
  const signalRef = useRef(controllerRef.current.signal);

  // Reset on unmount
  useEffect(() => {
    return () => {
      controllerRef.current.abort();
    };
  }, []);

  return signalRef;
}
