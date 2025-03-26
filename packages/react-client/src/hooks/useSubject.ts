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
export function createUseSubject<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
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
      const abortController = new AbortController();

      // Fetching function
      async function fetch() {
        try {
          // Mark as loading
          setValue({
            status: "loading",
            subject: null,
            error: null,
          });

          // Fetch subject
          const subject = await KilpiClient.fetchSubject();

          // Mark as success
          setValue({
            status: "success",
            subject: subject,
            error: null,
          });
        } catch (error) {
          // Mark as error
          setValue({
            status: "error",
            subject: null,
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
