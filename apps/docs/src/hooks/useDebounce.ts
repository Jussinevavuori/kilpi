import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, debouceMs = 200) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, debouceMs);

    return () => clearTimeout(handler);
  }, [value, debouceMs]);

  return debouncedValue;
}
