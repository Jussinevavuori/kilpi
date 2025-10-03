import type { AnyKilpiClient, KilpiClientPolicy } from "@kilpi/client";
import type { Decision, PolicysetActions } from "@kilpi/core";
import { useEffect, useState } from "react";
import { useUnmountAbortSignalRef } from "./useUnmountAbortSignalRef";

/**
 * Input type
 */
export type UseAuthorizeOptions = {
  isDisabled?: boolean;
};

/**
 * Factory for useAuthorize hook given a policy
 */
export function create_useAuthorize<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
>(Client: TClient, policy: KilpiClientPolicy<TClient, TAction>) {
  void Client; // Unused, but needed to keep generic type

  /**
   * Construct the useAuthorize hook.
   */
  return function useAuthorize(options: UseAuthorizeOptions = {}) {
    // Destructure options with defaults
    const isDisabled = options.isDisabled || false;

    // States initialized with idle state
    const [status, setStatus] = useState<"idle" | "pending" | "error" | "success">("idle");
    const [error, setError] = useState<unknown>(null);
    const [decision, setDecision] = useState<Decision<TClient["$$infer"]["subject"]> | null>(null);

    // Get abort signal that aborts on unmount
    const signalRef = useUnmountAbortSignalRef();

    // Run fetch
    useEffect(() => {
      // If disabled, reset to initial idle state
      if (isDisabled) {
        setStatus("idle");
        setError(null);
        setDecision(null);
        return;
      }

      // If not idle, already fetching / fetched
      if (status !== "idle") {
        return;
      }

      // Fetch and go to pending
      setStatus("pending");
      policy
        // Fetch decision
        .authorize({ signal: signalRef.current })
        // Handle successs
        .then((value) => {
          if (signalRef.current.aborted) return;
          setDecision(value);
          setStatus("success");
        })
        // Handle error
        .catch((err) => {
          if (signalRef.current.aborted) return;
          setError(err);
          setStatus("error");
        });
    }, [isDisabled, status, signalRef]);

    /**
     * Return object
     */
    return {
      // Status and utility flags
      status,
      isIdle: status === "idle",
      isError: status === "error",
      isSuccess: status === "success",
      isPending: status === "pending",

      // Result and shorthands
      decision,
      granted: decision ? decision.granted : false,

      // Errors
      error,

      // Pass-through options
      isDisabled,
    };
  };
}

/**
 * Infer return type
 */
export type UseAuthorizeReturn<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> = ReturnType<ReturnType<typeof create_useAuthorize<TClient, TAction>>>;
