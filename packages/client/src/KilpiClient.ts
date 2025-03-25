import type {
  AnyKilpiCore,
  endpointRequestSchema,
  GetPolicyByKey,
  InferPolicyInputs,
  PolicysetKeys,
} from "@kilpi/core";
import { nanoid } from "nanoid";
import { parse as superJsonParse, stringify as superJsonStringify } from "superjson";
import { z } from "zod";
import { Batcher, type BatcherOptions, type BatchJob } from "./batcher";
import { getRequestErrorMessage } from "./utils/getRequestErrorMessage";
import { tryCatch } from "./utils/tryCatch";

type KilpiClientRequest = z.infer<typeof endpointRequestSchema>;

const responseSchema = z.array(
  z.object({
    requestId: z.string(),
    data: z.any(),
  }),
);

export type KilpiClientOptions<T extends AnyKilpiCore> = {
  /**
   * URL of the Kilpi server endpoint.
   */
  kilpiUrl: KilpiClient<T>["kilpiUrl"];

  /**
   * Public key to authenticate with the Kilpi server.
   */
  kilpiSecret: KilpiClient<T>["kilpiSecret"];

  /**
   * Custom fetch function. Primarily used for mocking in tests.
   */
  fetch?: typeof fetch;

  /**
   * Enable customizing the batching behaviour.
   */
  batching?: BatcherOptions;
};

/**
 * Kilpi client for interacting with the kilpi endpoint.
 */
export class KilpiClient<T extends AnyKilpiCore> {
  /**
   * URL of the Kilpi server endpoint.
   */
  private kilpiUrl: string;

  /**
   * Public key to authenticate with the Kilpi server.
   */
  private kilpiSecret: string;

  /**
   * All currently batched events to fetch.
   */
  private batcher: Batcher<KilpiClientRequest>;

  /**
   * Custom fetch function
   */
  private _fetch: typeof fetch;

  /**
   * Inferring utilities
   */
  public $$infer: T["$$infer"] = {} as T["$$infer"];

  constructor(options: KilpiClientOptions<T>) {
    // Configuration
    this.kilpiUrl = options.kilpiUrl;
    this.kilpiSecret = options.kilpiSecret;
    this._fetch = options.fetch ?? global.fetch;

    // Setup batcher to run all jobs
    this.batcher = new Batcher((jobs) => this.runJobs(jobs), options.batching);
  }

  /**
   * Fetch the current subject.
   */
  public async fetchSubject() {
    // Fetch subject from the server (with batching)
    const subject = await this.batcher.queueJob({
      type: "getSubject",
      requestId: nanoid(),
    });

    // Return subject (not able to validate subject type)
    return subject as T["$$infer"]["subject"];
  }

  /**
   * Fetch whether the current subject is authorized to the policy.
   */
  public async fetchIsAuthorized<TKey extends PolicysetKeys<T["$$infer"]["policies"]>>(
    key: TKey,
    ...inputs: InferPolicyInputs<GetPolicyByKey<T["$$infer"]["policies"], TKey>>
  ): Promise<boolean> {
    // Fetch authorization from the server (with batching)
    const isAuthorized = await this.batcher.queueJob({
      type: "getAuthorization",
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
  }
  /**
   * Utility function used to fetch all requests as batched jobs.
   */
  private async runJobs(jobs: Array<BatchJob<KilpiClientRequest>>) {
    // Fetch response for each request in batch
    const response = await this._fetch(this.kilpiUrl, {
      method: "POST",
      body: superJsonStringify(jobs.map((job) => job.payload)),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.kilpiSecret}`,
      },
    });

    // Error status: Reject all requests with useful message
    if (response.status !== 200) {
      const error = new Error(getRequestErrorMessage(response.status));
      jobs.forEach((job) => job.reject(error));
      throw error;
    }

    // Parse body as Super JSON against response schema
    const body = await tryCatch(
      response
        .json()
        .then((_) => superJsonParse(_))
        .then((_) => responseSchema.parse(_)),
    );

    // Body had an error
    if (body.error) {
      const error = new Error("Kilpi server responded with invalid data.");
      jobs.forEach((job) => job.reject(error));
      throw error;
    }

    // Resolve all jobs from the response data
    body.value.forEach((response) => {
      const job = jobs.find((job) => job.payload.requestId === response.requestId);
      job?.resolve(response.data);
    });
  }
}
