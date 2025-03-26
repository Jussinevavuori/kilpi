import { useEffect, useRef } from "react";

/**
 * Wrap any item in a reference for reference integrity reasons.
 */
export function useWrapRef<T>(t: T) {
  const ref = useRef<T>(t);

  useEffect(() => {
    ref.current = t;
  }, [t]);

  return ref;
}
