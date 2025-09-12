"use client";

import { authClient } from "@/better-auth.client";
import { KilpiClient } from "@/kilpi.client";
import { useEffect } from "react";

/**
 * Refresh Kilpi Client cache whenever auth state changes
 */
export function KilpiClientCacheRefresh() {
  const session = authClient.useSession();

  useEffect(() => {
    console.log(`🟢 Refresh Kilpi Client cache`);
    KilpiClient.clearCache();
  }, [session]);

  return null;
}
