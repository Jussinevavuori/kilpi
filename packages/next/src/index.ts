import type { KilpiAdapterInitializer } from "@kilpi/core";
import React from "react";
import type { KilpiContext } from "../../core/src/KilpiContext";
import { isRunningInRscContext } from "./isRunningInRscContext";

/**
 * Automatically provides a context within the RSC scope. Elsewhere, e.g. in server actions,
 * the context must be manually provided with `Kilpi.runWithContext`.
 */
export function KilpiNextAdapter(): KilpiAdapterInitializer {
  return function initializeAdapter({ defaults }) {
    const rscCache = React.cache(() => ({ current: defaults as KilpiContext }));

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
