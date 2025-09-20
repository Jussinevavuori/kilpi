import type { KilpiClient } from "@kilpi/client";
import type {
  AnyKilpiCore,
  GetPolicyByAction,
  InferPolicyInputs,
  PolicysetActions,
} from "@kilpi/core";
import { useEffect, useState } from "react";
import { useCacheClearSignal } from "./useCacheClearSignal";

/**
 * Value returned by useIsAuthorized
 */
type UseIsAuthorizedValue =
  | {
      status: "idle";
      isAuthorized: null;
      error: null;
    }
  | {
      status: "loading";
      isAuthorized: null;
      error: null;
    }
  | {
      status: "error";
      isAuthorized: null;
      error: unknown;
    }
  | {
      status: "success";
      isAuthorized: boolean;
      error: null;
    };

/**
 * Create the `useIsAuthorized` react client hook.
 */
export function create_useIsAuthorized<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
  /**
   * React client hook for accessing the current subject.
   */
  return function useIsAuthorized<TAction extends PolicysetActions<T["policies"]>>(
    action: TAction,
    ...inputs: InferPolicyInputs<GetPolicyByAction<T["policies"], TAction>>
  ) {
    /**
     * Hold current state of useIsAuthorized.
     */
    const [value, setValue] = useState<UseIsAuthorizedValue>({
      status: "idle",
      isAuthorized: null,
      error: null,
    });

    /**
     * Reset state and force refetch whenever client cache is cleared.
     */
    const cacheSignal = useCacheClearSignal(KilpiClient, () => {
      setValue({ status: "idle", isAuthorized: null, error: null });
    });

    /**
     * Unwrap input
     */
    const object = inputs[0];

    /**
     * Fetch the current subject. It is OK to fire this fetch function in multiple components,
     * as the subject is cached and only fetched once.
     */
    useEffect(() => {
      // Cleanup utilities: When unmounted, cancel fetch and prevent further state updates.
      let isMounted = true;
      const abortController = new AbortController();

      // Define data fetching logic with respect to cleanup utilities.
      async function fetchIsAuthorized() {
        if (isMounted) setValue({ status: "loading", error: null, isAuthorized: null });
        try {
          const isAuthorized = await KilpiClient.fetchIsAuthorized({
            action,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            object: object as any,
            queryOptions: { signal: abortController.signal },
          });
          if (isMounted) setValue({ status: "success", error: null, isAuthorized });
        } catch (error) {
          if (isMounted) setValue({ status: "error", error, isAuthorized: null });
        }
      }

      // Initiate fetch
      fetchIsAuthorized();

      // Trigger cleanup utilities
      return () => {
        isMounted = false;
        abortController.abort();
      };
    }, [setValue, cacheSignal, action, object]);

    /**
     * Return value with computed values.
     */
    return Object.assign(value, {
      isLoading: value.status === "loading",
      isError: value.status === "error",
      isSuccess: value.status === "success",
      isIdle: value.status === "idle",
    });
  };
}
