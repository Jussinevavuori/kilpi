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
import { Batcher, type BatcherOptions, type BatchJob } from "./utils/Batcher";
import { ClientCache } from "./utils/ClientCache";
import {
  createHandleRequestStrategy,
  type AnyRequestStrategyOptions,
  type HandleRequestStrategy,
} from "./utils/HandleRequestStrategy";
import { deepEquals } from "./utils/deepEquals";
import { getRequestErrorMessage } from "./utils/getRequestErrorMessage";
import { tryCatch } from "./utils/tryCatch";

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

  constructor(options: KilpiClientOptions) {
    // Setup request handler strategy with factory
    this.handleRequestStrategy = createHandleRequestStrategy(options.connect);

    // Setup cache
    this.cache = new ClientCache();

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
  public async fetchSubject() {
    return this.cache.wrap({ cacheKey: ["fetchSubject"] }, async () => {
      // Fetch subject from the server (with batching)
      const subject = await this.batcher.queueJob({
        type: "getSubject",
        requestId: nanoid(),
      });

      // Return subject (not able to validate subject type)
      return subject as T["$$infer"]["subject"];
    });
  }

  /**
   * Fetch whether the current subject is authorized to the policy.
   */
  public async fetchIsAuthorized<TKey extends PolicysetKeys<T["$$infer"]["policies"]>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<T["$$infer"]["policies"], TKey>>
  ): Promise<boolean> {
    return this.cache.wrap({ cacheKey: ["fetchIsAuthorized", key, ...inputs] }, async () => {
      // Fetch authorization from the server (with batching)
      const isAuthorized = await this.batcher.queueJob({
        type: "getIsAuthorized",
        policy: key,
        requestId: nanoid(),
        resource: inputs[0],
      });

      // Ensure the response is a boolean
      if (typeof isAuthorized !== "boolean") {
        throw new Error(
          `Kilpi server responded with non-boolean value for fetchIsAuthorized: ${JSON.stringify(isAuthorized)}`,
        );
      }

      // Return isAuthorized boolean
      return isAuthorized;
    });
  }

  /**
   * Utility to clear the cache.
   */
  public clearCache() {
    this.cache.clear();
  }

  /**
   * Utility function used to fetch all requests as batched jobs.
   */
  private async runJobs(jobs: Array<BatchJob<KilpiClientRequest>>) {
    // Use request handler strategy to get response
    const response = await this.handleRequestStrategy.request(jobs.map((job) => job.payload));

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
