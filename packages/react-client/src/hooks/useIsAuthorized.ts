import type { KilpiClient } from "@kilpi/client";
import type { AnyKilpiCore, GetPolicyByKey, InferPolicyInputs, PolicysetKeys } from "@kilpi/core";
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
export function createUseIsAuthorized<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
  /**
   * React client hook for accessing the current subject.
   */
  return function useIsAuthorized<TKey extends PolicysetKeys<T["$$infer"]["policies"]>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<T["$$infer"]["policies"], TKey>>
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
            key,
            object: inputs[0],
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
    }, [setValue, cacheSignal]);

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
