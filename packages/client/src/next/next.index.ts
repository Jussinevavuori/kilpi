import { cache } from "react";
import { createPlugin } from "../lib/create-plugin";

/**
 * Create storage for per-page on-protect
 */
const getPerRequestOnProtectCache = cache(() => ({
  onProtect: undefined as undefined | (() => never),
}));

/**
 * Create next plugin.
 */
export function createNextKilpiPlugin(options: { disableWrapQueryInReactCache?: boolean }) {
  return createPlugin({
    pluginName: "next",

    /**
     * Wrap query with React.cache if not disabled
     */
    wrapProtectedQuery: options.disableWrapQueryInReactCache ? undefined : cache,

    /**
     * Store `onProtect` using `React.cache`.
     */
    onProtect: {
      set(onProtect) {
        getPerRequestOnProtectCache().onProtect = onProtect;
      },
      get() {
        return getPerRequestOnProtectCache().onProtect;
      },
    },

    interface: {},
  });
}
