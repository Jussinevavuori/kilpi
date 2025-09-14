import { createKilpiPlugin, type AnyKilpiCore, type AnyKilpiScope } from "@kilpi/core";
import React from "react";
import { create_Access } from "src/components/Access";

// This is a hack to determine if we are running in a React Server Component context.
// If a cached random function returns the same result twice, the cache is working
// and we are in a React Server Component context.
const rscProbe = React.cache(() => Math.random());
const isRscContext = () => rscProbe() === rscProbe();

// Using React.cache allows us to keep a mutable value for the current request, but only
// when inside a React Server Component context.
const rscCache = React.cache(() => ({ current: {} as AnyKilpiScope }));

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components and for creating the React Server Component bindings
 * to work with Kilpi.
 */
export function ReactServerComponentPlugin<T extends AnyKilpiCore>() {
  return createKilpiPlugin((Kilpi: T) => {
    // Provide automatic scope when in RSC context
    Kilpi.hooks.onRequestScope(() => (isRscContext() ? rscCache().current : undefined));

    return {
      ReactServer: {
        // Create components
        createComponents() {
          const Access = create_Access(Kilpi);
          return { Access };
        },
      },
    };
  });
}
