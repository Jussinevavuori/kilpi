import { PromiseWithResolvers } from "src/utils/PromiseWithResolvers";
import { BatchJob } from "./BatchJob";

export type BatcherOptions<TPayload, TOutput = unknown> = {
  /**
   * When flushing the batch, this function is called with all jobs in the batch. It is this
   * function's responsibility to resolve each promise in the batch.
   */
  runJobs: Batcher<TPayload, TOutput>["runJobs"];

  /**
   * Override default batch delay
   */
  batchDelayMs?: number;

  /**
   * Optional waitUntil function for serverless environments to ensure latest batch completes.
   */
  waitUntil?: (promise: Promise<unknown>) => void;
};

export class Batcher<TPayload, TOutput = unknown> {
  /**
   * Batch delay, in milliseconds. Defaults to 50ms.
   */
  private batchDelayMs: number;

  /**
   * Current batch.
   */
  private batch: null | {
    /**
     * Promise which resolves when the batch is flushed.
     */
    promise: Promise<void>;

    /**
     * Utility to resolve the promise when the batch is flushed.
     */
    resolve: () => void;

    /**
     * All jobs in current batch.
     */
    jobs: Array<BatchJob<TPayload, TOutput>>;
  };

  /**
   * Job handler
   */
  private runJobs: (jobs: Array<BatchJob<TPayload, TOutput>>) => Promise<void>;

  /**
   * Optional waitUntil function for serverless environments to ensure latest batch completes.
   */
  private waitUntil?: (promise: Promise<unknown>) => void;

  // Simple constructor
  constructor(options: BatcherOptions<TPayload, TOutput>) {
    this.runJobs = options.runJobs;
    this.batchDelayMs = options.batchDelayMs ?? 50;
    this.batch = null;
    this.waitUntil = options.waitUntil;
  }

  /**
   * Manually flush the queue
   */
  public async flushBatch() {
    const currentBatch = this.batch;
    if (currentBatch) {
      // Clear batch
      this.batch = null;

      // Run all jobs
      await this.runJobs(currentBatch.jobs);

      // Resolve current batch
      currentBatch.resolve();
    }
  }

  /**
   * Add a job to the current batch or initialize a new batch.
   */
  public async queueJob(payload: TPayload) {
    // Initialize batch
    if (!this.batch) {
      // Setup promise for current batch
      const { promise, resolve } = PromiseWithResolvers<void>();

      // Serverless: Apply WaitUntil to this batch
      if (this.waitUntil) this.waitUntil(promise);

      // Flush batch when timer
      setTimeout(() => this.flushBatch(), this.batchDelayMs);

      // Setup new batch
      this.batch = { jobs: [], promise, resolve };
    }

    // Initialize a new job and add it to the batch
    const job = new BatchJob<TPayload, TOutput>(payload);
    this.batch.jobs.push(job);

    // Return promise that job will resolve to
    return job.promise;
  }
}
