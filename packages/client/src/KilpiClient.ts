import type {
  AnyKilpiCore,
  endpointRequestSchema,
  GetPolicyByKey,
  InferPolicyInputs,
  PolicysetKeys,
} from "@kilpi/core";
import { nanoid } from "nanoid";
import { parse as superJsonParse } from "superjson";
import { z } from "zod";
import { AbortSignalAll } from "./utils/AbortSignalAll";
import type { BatchJob } from "./utils/BatchJob";
import { Batcher, type BatcherOptions } from "./utils/Batcher";
import { ClientCache } from "./utils/ClientCache";
import {
  createHandleRequestStrategy,
  type AnyRequestStrategyOptions,
  type HandleRequestStrategy,
} from "./utils/HandleRequestStrategy";
import { createSubscribable, type Subscribable } from "./utils/createSubscribable";
import { deepEquals } from "./utils/deepEquals";
import { getRequestErrorMessage } from "./utils/getRequestErrorMessage";
import { tryCatch } from "./utils/tryCatch";
import type { ArrayHead } from "./utils/types";

type KilpiClientRequest = z.infer<typeof endpointRequestSchema>;

const responseSchema = z.array(
  z.object({
    requestId: z.string(),
    data: z.any(),
  }),
);

export type KilpiClientOptions = {
  /**
   * Connection options. This constructs a HandleRequestStrategy under the hood.
   */
  connect: AnyRequestStrategyOptions;

  /**
   * Enable customizing the batching behaviour.
   */
  batching?: Pick<BatcherOptions<KilpiClientRequest>, "batchDelayMs" | "jobTimeoutMs">;
};

/**
 * Kilpi client for interacting with the kilpi endpoint.
 */
export class KilpiClient<T extends AnyKilpiCore> {
  /**
   * Handle request strategy to use.
   */
  private handleRequestStrategy: HandleRequestStrategy;

  /**
   * All currently batched events to fetch.
   */
  private batcher: Batcher<KilpiClientRequest>;

  /**
   * Inferring utilities
   */
  public $$infer: T["$$infer"] = {} as T["$$infer"];

  /**
   * Request cache
   */
  private cache: ClientCache;

  /**
   * Subscribable to listen to cache clearings.
   */
  private _cacheClearSubscribable: Subscribable<void>;

  constructor(options: KilpiClientOptions) {
    // Setup request handler strategy with factory
    this.handleRequestStrategy = createHandleRequestStrategy(options.connect);

    // Setup cache
    this.cache = new ClientCache();

    // Setup subscribables
    this._cacheClearSubscribable = createSubscribable();

    // Setup batcher to run all jobs
    this.batcher = new Batcher({
      // Run jobs function
      runJobs: (jobs) => this.runJobs(jobs),

      // Always dedupe requests. Do not compare request ID as it is always unique.
      dedupe: (a, b) => deepEquals({ ...a, requestId: "" }, { ...b, requestId: "" }),

      // Apply custom batching options to override defaults
      ...options.batching,
    });
  }

  /**
   * Fetch the current subject.
   */
  public async fetchSubject(
    options: { queryOptions?: { signal?: AbortSignal | null | undefined } } = {},
  ) {
    return this.cache.wrap({ cacheKey: ["fetchSubject"] }, async () => {
      // Fetch subject from the server (with batching)
      const subject = await this.batcher.queueJob(
        { type: "getSubject", requestId: nanoid() },
        { signal: options.queryOptions?.signal },
      );

      // Return subject (not able to validate subject type)
      return subject as T["$$infer"]["subject"];
    });
  }

  /**
   * Fetch whether the current subject is authorized to the policy.
   */
  public async fetchIsAuthorized<TKey extends PolicysetKeys<T["$$infer"]["policies"]>>(options: {
    key: TKey;
    resource?: ArrayHead<InferPolicyInputs<GetPolicyByKey<T["$$infer"]["policies"], TKey>>>;
    queryOptions?: { signal?: AbortSignal | null | undefined };
  }): Promise<boolean> {
    return this.cache.wrap(
      { cacheKey: ["fetchIsAuthorized", options.key, options.resource] },
      async () => {
        // Fetch authorization from the server (with batching)
        const isAuthorized = await this.batcher.queueJob(
          {
            type: "getIsAuthorized",
            policy: options.key,
            requestId: nanoid(),
            resource: options.resource,
          },
          { signal: options.queryOptions?.signal },
        );

        // Ensure the response is a boolean
        if (typeof isAuthorized !== "boolean") {
          throw new Error(
            `Kilpi server responded with non-boolean value for fetchIsAuthorized: ${JSON.stringify(isAuthorized)}`,
          );
        }

        // Return isAuthorized boolean
        return isAuthorized;
      },
    );
  }

  /**
   * Utility to clear the cache.
   */
  public clearCache() {
    this.cache.clear();
    this._cacheClearSubscribable.publish();
  }

  /**
   * Utility to listen to when cache was cleared
   */
  public onCacheClear(callback: () => void) {
    return this._cacheClearSubscribable.subscribe(callback);
  }

  /**
   * Utility function used to fetch all requests as batched jobs.
   */
  private async runJobs(jobs: Array<BatchJob<KilpiClientRequest>>) {
    // Use request handler strategy to get response
    const response = await this.handleRequestStrategy.request(
      jobs.map((job) => job.payload),

      // Cancel request once all jobs cancelled
      { signal: AbortSignalAll(jobs.map((job) => job.signal)) },
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
      return jobs.forEach((job) => {
        job.reject(new Error("Kilpi server responded with invalid data."));
      });
    }

    // Resolve all jobs from the response data
    body.value.forEach((response) => {
      const job = jobs.find((job) => job.payload.requestId === response.requestId);
      job?.resolve(response.data);
    });
  }
}
