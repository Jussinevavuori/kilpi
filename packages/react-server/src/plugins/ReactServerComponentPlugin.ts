import {
  KilpiPlugin,
  type EmptyInterface,
  type KilpiCore,
  type KilpiScope,
  type Policyset,
} from "@kilpi/core";
import React from "react";

type Interface = EmptyInterface;

// Provide the request scope via React.cache
const rscCache = React.cache(() => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  current: {} as KilpiScope<any, any>,
}));

// This is a hack to determine if we are running in a React Server Component context.
// If a cached random function returns the same result twice, the cache is working
// and we are in a React Server Component context.
const rscProbe = React.cache(() => Math.random());
const isRscContext = () => rscProbe() === rscProbe();

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components.
 */
export function ReactServerComponentPlugin<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
>() {
  return function pluginFactory(_Kilpi: KilpiCore<TSubject, TPolicyset>) {
    return new KilpiPlugin<TSubject, TPolicyset, Interface>({
      name: "ReactServerComponentPlugin",
      interface: {},

      getScope() {
        if (isRscContext()) {
          return rscCache().current;
        }

        return undefined;
      },
    });
  };
}
