import React from "react";

/**
 * Create a cacheable value that is only kept when inside a React Server Component context.
 *
 * Used for e.g. caching the current subject.
 */
export function createRscCache<T>(initialValue: T) {
  // Using React.cache allows us to keep a mutable value for the current request, but only
  // when inside a React Server Component context.
  return React.cache(() => ({ value: initialValue }));
}

// This is a hack to determine if we are running in a React Server Component context.
// If a cached random function returns the same result twice, the cache is working
// and we are in a React Server Component context.
const rscProbe = React.cache(() => Math.random());

/**
 * Hack to determine if we are in a React Server Component context (React.cache will only
 * work in that context).
 */
export function isRscContext() {
  return rscProbe() === rscProbe();
}
