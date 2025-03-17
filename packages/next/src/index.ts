import type { KilpiAdapterInitializer, KilpiRequestContext } from "@kilpi/core";
import React from "react";
import { isRunningInRscContext } from "./isRunningInRscContext";

/**
 * Pre-built Next.js adapter.
 *
 * - Automatically provides a context for RSC components.
 * - Elsewhere (e.g. in server actions) the context must be manually provided with `Kilpi.runWithContext`.
 */
export function KilpiNextAdapter(): KilpiAdapterInitializer {
  return function initializeAdapter({ defaults }) {
    const rscCache = React.cache(() => ({
      current: defaults as KilpiRequestContext,
    }));

    return {
      getContext() {
        if (isRunningInRscContext()) {
          return rscCache().current;
        }

        return undefined;
      },
    };
  };
}
