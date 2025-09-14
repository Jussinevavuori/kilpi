import type { KilpiClient } from "@kilpi/client";
import type { AnyKilpiCore } from "@kilpi/core";
import { useEffect, useState } from "react";
import { useCacheClearSignal } from "./useCacheClearSignal";

/**
 * Value returned by useSubject
 */
type UseSubjectValue<T extends AnyKilpiCore> =
  | {
      status: "idle";
      subject: null;
      error: null;
    }
  | {
      status: "loading";
      subject: null;
      error: null;
    }
  | {
      status: "error";
      subject: null;
      error: unknown;
    }
  | {
      status: "success";
      subject: KilpiClient<T>["$$infer"]["subject"];
      error: null;
    };

/**
 * Create the `useSubject` react client hook.
 */
export function create_useSubject<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
  /**
   * React client hook for accessing the current subject.
   */
  return function useSubject() {
    /**
     * Hold current state of useSubject.
     */
    const [value, setValue] = useState<UseSubjectValue<T>>({
      status: "idle",
      subject: null,
      error: null,
    });

    /**
     * Reset state and force refetch whenever client cache is cleared.
     */
    const cacheSignal = useCacheClearSignal(KilpiClient, () => {
      setValue({ status: "idle", subject: null, error: null });
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
      async function fetchSubject() {
        if (isMounted) setValue({ status: "loading", subject: null, error: null });
        try {
          const subject = await KilpiClient.fetchSubject({
            queryOptions: { signal: abortController.signal },
          });
          if (isMounted) setValue({ status: "success", subject: subject, error: null });
        } catch (error) {
          if (isMounted) setValue({ status: "error", subject: null, error: error });
        }
      }

      // Initiate fetch
      fetchSubject();

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
