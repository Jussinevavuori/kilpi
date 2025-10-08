import type { AnyKilpiClient, KilpiClientPolicy } from "@kilpi/client";
import type { Decision, DeniedDecision, GrantedDecision, PolicysetActions } from "@kilpi/core";
import { useEffect, useState } from "react";
import { useUnmountAbortSignalRef } from "./useUnmountAbortSignalRef";

/**
 * Input type
 */
export type UseAuthorizeOptions = {
  isDisabled?: boolean;
};

/**
 * UseAuthorizeStatus
 */
export type UseAuthorizeStatus = "idle" | "pending" | "error" | "success";

/**
 * Sub-utility type for just the status and flags
 */
type UseAuthorizeStatusWithFlags<TStatus extends UseAuthorizeStatus> = {
  status: TStatus;
  isIdle: TStatus extends "idle" ? true : false;
  isError: TStatus extends "error" ? true : false;
  isSuccess: TStatus extends "success" ? true : false;
  isPending: TStatus extends "pending" ? true : false;
};

/**
 * Utility type to get status with flags to an object
 */
type UseAuthorizeReturnForStatus<
  TStatus extends UseAuthorizeStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDecision extends null | Decision<any>,
> = UseAuthorizeStatusWithFlags<TStatus> & {
  error: TStatus extends "error" ? unknown : null;
  isDisabled: boolean;
  decision: TDecision;
  granted: TDecision extends { granted: true } ? true : false;
};

/**
 * Discriminated return type by status. Implemented this way to ensure typescript
 * is better able to deduce the types when narrowing or using `Extract<...>`. Two
 * separate discriminators for `status = success` based on `granted` flag.
 */
export type UseAuthorizeReturn<
  TClient extends AnyKilpiClient,
  // @ts-expect-error Unused variable for now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> =
  | UseAuthorizeReturnForStatus<"idle", null>
  | UseAuthorizeReturnForStatus<"pending", null>
  | UseAuthorizeReturnForStatus<"error", null>
  | UseAuthorizeReturnForStatus<"success", GrantedDecision<TClient["$$infer"]["subject"]>>
  | UseAuthorizeReturnForStatus<"success", DeniedDecision>;

/**
 * Factory for useAuthorize hook given a policy
 */
export function create_useAuthorize<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
>(Client: TClient, policy: KilpiClientPolicy<TClient, TAction>) {
  void Client; // Unused, but needed to keep generic type

  /**
   * Utility to return status with flags
   */
  function getStatusWithFlags<TStatus extends UseAuthorizeStatus>(status: TStatus) {
    return {
      status,
      isIdle: status === "idle",
      isError: status === "error",
      isSuccess: status === "success",
      isPending: status === "pending",
    } as UseAuthorizeStatusWithFlags<TStatus>;
  }

  /**
   * Construct the useAuthorize hook.
   */
  return function useAuthorize(
    options: UseAuthorizeOptions = {},
  ): UseAuthorizeReturn<TClient, TAction> {
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
     * Return by status to ensure type safety
     */
    switch (status) {
      case "idle":
        return {
          ...getStatusWithFlags(status),
          decision: null,
          granted: false,
          error: null,
          isDisabled,
        };
      case "pending":
        return {
          ...getStatusWithFlags(status),
          decision: null,
          granted: false,
          error: null,
          isDisabled,
        };
      case "error":
        return {
          ...getStatusWithFlags(status),
          decision: null,
          granted: false,
          error,
          isDisabled,
        };
      case "success":
        if (decision?.granted) {
          return {
            ...getStatusWithFlags(status),
            decision: decision as GrantedDecision<TClient["$$infer"]["subject"]>,
            granted: true,
            error: null,
            isDisabled,
          };
        } else {
          return {
            ...getStatusWithFlags(status),
            // `decision` should never be null here, but we need to satisfy TypeScript
            decision: decision || { granted: false },
            granted: false,
            error: null,
            isDisabled,
          };
        }
    }
  };
}
