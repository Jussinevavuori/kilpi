import React from "react";

const rscCacheabilityProbe = React.cache(() => Math.random());

/**
 * Utility to probe whether we are running in RSC context.
 */
export const isRunningInRscContext = () => rscCacheabilityProbe() === rscCacheabilityProbe();
