import { useEffect, useState } from "react";
import * as device from "react-device-detect";

/**
 * Shortcut for ctrl + [key] / cmd + [key]
 */
export function useShortcut(key: string, onShortcut: () => void) {
  // Check for macOS (this method avoids hydration issues)
  const [isMacOs, setIsMacOs] = useState(false);
  useEffect(() => {
    setIsMacOs(device.isMacOs);
  }, []);

  // Shortcut label
  const label = isMacOs ? `⌘ ${key}` : `Ctrl+${key}`;

  // Listener
  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener("keydown", (event) => {
      if (event.key.toUpperCase() === key.toUpperCase() && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onShortcut();
      }
    });

    return () => abortController.abort();
  }, [onShortcut]);

  return {
    isMacOs,
    label,
  };
}
