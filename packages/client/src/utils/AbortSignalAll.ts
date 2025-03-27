/**
 * Similar to AbortSignal.any, but waits for all signals to be aborted.
 */
export function AbortSignalAll(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  // Edge case: if there are no signals, abort immediately
  if (signals.length === 0) {
    controller.abort();
  }

  // Wait until all signals have been aborted
  const remainingSignals = new Set<AbortSignal>(signals);
  for (const signal of signals) {
    function handleAborted(reason: unknown) {
      remainingSignals.delete(signal);

      if (remainingSignals.size === 0) {
        controller.abort(reason);
      }
    }

    if (signal.aborted) {
      handleAborted(signal.reason);
    } else {
      signal.addEventListener("abort", (reason) => handleAborted(reason));
    }
  }

  return controller.signal;
}
