import React from "react";

/**
 * Hack for checking whether we are currently running in a RSC context. React.cache
 * only works within the RSC context, therefore if a cached random function returns
 * the same value twice, we can deduce that we are running in RSC context.
 */
const rscCacheProbe = React.cache(() => Math.random());

/**
 * Utility to probe whether we are running in RSC context.
 */
export const isRunningInRscContext = () => rscCacheProbe() === rscCacheProbe();
