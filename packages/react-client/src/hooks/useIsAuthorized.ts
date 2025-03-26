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
      const abortController = new AbortController();

      // Fetching function
      async function fetch() {
        try {
          // Mark as loading
          setValue({
            status: "loading",
            isAuthorized: null,
            error: null,
          });

          // Fetch isAuthorized
          const isAuthorized = await KilpiClient.fetchIsAuthorized(key, ...inputs);

          // Mark as success
          setValue({
            status: "success",
            isAuthorized: isAuthorized,
            error: null,
          });
        } catch (error) {
          // Mark as error
          setValue({
            status: "error",
            isAuthorized: null,
            error: error,
          });
        }
      }

      fetch();

      return () => {
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
