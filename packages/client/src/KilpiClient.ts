import type { AnyKilpiCore } from "@kilpi/core";
import { parse as superJsonParse } from "superjson";
import { z } from "zod";
import { KilpiClientHooks } from "./KilpiClientHooks";
import type { KilpiClientOptions, KilpiClientRequest } from "./types";
import { AbortSignalAll } from "./utils/AbortSignalAll";
import type { BatchJob } from "./utils/BatchJob";
import { Batcher } from "./utils/Batcher";
import {
  createHandleRequestStrategy,
  type HandleRequestStrategy,
} from "./utils/HandleRequestStrategy";
import { deepEquals } from "./utils/deepEquals";
import { getRequestErrorMessage } from "./utils/getRequestErrorMessage";
import { tryCatch } from "./utils/tryCatch";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Loose validation schema for backend responses.
 */
const responseSchema = z.array(
  z.object({
    requestId: z.string(),
    data: z.any(),
  }),
);

/**
 * Symbols used to hide properties not meant for the public API.
 */
const KilpiClientSymbol_Batcher = Symbol("KilpiClient.batcher");
const KilpiClientSymbol_HandleRequestStrategy = Symbol("KilpiClient.handleRequestStrategy");

/**
 * Kilpi client for interacting with the kilpi endpoint.
 */
export class KilpiClient<T extends AnyKilpiCore> {
  /**
   * Handle request strategy to use.
   */
  private [KilpiClientSymbol_HandleRequestStrategy]: HandleRequestStrategy;

  /**
   * All currently batched events to fetch.
   */
  private [KilpiClientSymbol_Batcher]: Batcher<KilpiClientRequest>;

  /**
   * Hooks API. Used to register and unregister Kilpi hooks.
   *
   * ```ts
   * // Register the hook
   * const unregister = Kilpi.$hooks.onAfterAuthorization((event) => { ... });
   *
   * // Unregister the hook
   * unregister();
   * ```
   */
  public $hooks: KilpiClientHooks<typeof this>;

  /**
   * Type inferring utilities. Do not use at runtime.
   *
   * ## Example usage
   * ```ts
   * type Policyset = (typeof KilpiClient)["$$infer"]["policies"];
   * ```
   */
  public $$infer: T["$$infer"] = {} as T["$$infer"] & { core: T };

  constructor(options: KilpiClientOptions) {
    // Initialize hooks
    this.$hooks = new KilpiClientHooks();

    // Setup request handler strategy with factory
    this[KilpiClientSymbol_HandleRequestStrategy] = createHandleRequestStrategy(options.connect);

    // Setup batcher to run all jobs
    this[KilpiClientSymbol_Batcher] = new Batcher({
      // Run jobs function
      runJobs: (jobs) => this.#runJobs(jobs),

      // Always dedupe requests. Do not compare request ID as it is always unique.
      dedupe: (a, b) => deepEquals({ ...a, requestId: "" }, { ...b, requestId: "" }),

      // Apply custom batching options to override defaults
      ...options.batching,
    });
  }

  /**
   * Private utility function used to fetch all requests as batched jobs.
   */
  async #runJobs(jobs: Array<BatchJob<KilpiClientRequest>>) {
    // Run onBeforeSendRequest hooks to get additional headers
    const hookResults = await Promise.all(
      this.$hooks.registeredHooks.onBeforeSendRequest.values().map((hook) => hook({})),
    );

    // Use request handler strategy to get response
    const response = await this[KilpiClientSymbol_HandleRequestStrategy].request(
      jobs.map((job) => job.payload),

      // Request options
      {
        // Cancel request once all jobs cancelled
        signal: AbortSignalAll(jobs.map((job) => job.signal)),

        // Pass additional headers from hooks
        additionalHeaders: hookResults.reduce<Record<string, string>>(
          (acc, result) => Object.assign(acc, result?.headers ?? {}),
          {},
        ),
      },
    );

    // Error status: Reject all requests with useful message
    if (response.status !== 200) {
      return jobs.forEach((job) => {
        job.reject(new Error(getRequestErrorMessage(response.status)));
      });
    }

    // Parse body as Super JSON against response schema
    const body = await tryCatch(
      response
        .json()
        .then((_) => superJsonParse(_))
        .then((_) => responseSchema.parse(_)),
    );

    // Body had an error: Reject all requests with useful message
    if (body.error) {
      console.error(body.error);
      return jobs.forEach((job) => {
        job.reject(
          new Error(`[KilpiClient] Kilpi server responded with invalid data`, {
            cause: body.error,
          }),
        );
      });
    }

    // Resolve all jobs from the response data
    body.value.forEach((response) => {
      const job = jobs.find((job) => job.payload.requestId === response.requestId);
      job?.resolve(response.data);
    });
  }

  /**
   * Utility to expose internal properties for plugins.
   *
   * ## Example usage
   *
   * ```ts
   * const batcher = KilpiClient.expose(instance).batcher;
   * ```
   */
  static expose<T extends AnyKilpiClient>(Client: T) {
    return {
      batcher: Client[KilpiClientSymbol_Batcher],
      handleRequestStrategy: Client[KilpiClientSymbol_HandleRequestStrategy],
    } as const;
  }
}

export type AnyKilpiClient = KilpiClient<any>;
