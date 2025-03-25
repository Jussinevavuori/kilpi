import { PromiseWithResolvers } from "./utils/PromiseWithResolvers";

export type BatchJob<T> = {
  payload: T;
  reject: (reason: unknown) => void;
  resolve: (value: unknown) => void;
};

export type BatcherOptions = {
  batchDelayMs?: number;
  jobTimeoutMs?: number;
};

export class Batcher<T> {
  /**
   * Batch delay, in milliseconds. Defaults to 50ms.
   */
  private batchDelayMs: number;

  /**
   * Job timeout, in milliseconds. Defaults to 5000ms.
   */
  private jobTimeoutMs: number;

  /**
   * Current batch.
   */
  private batch: null | {
    /**
     * Timer to flush the current batch. Set once when the batch is initialized.
     */
    timer: ReturnType<typeof setTimeout>;

    /**
     * All jobs in current batch.
     */
    jobs: Array<{
      payload: T;
      reject: (reason: unknown) => void;
      resolve: (value: unknown) => void;
    }>;
  };

  /**
   * Job handler
   */
  private runJobs: (jobs: BatchJob<T>[]) => Promise<void>;

  constructor(runJobs: Batcher<T>["runJobs"], options: BatcherOptions = {}) {
    this.runJobs = runJobs;

    // Initialize all values, with defaults
    this.batchDelayMs = options.batchDelayMs ?? 50;
    this.jobTimeoutMs = options.jobTimeoutMs ?? 5_000;
    this.batch = null;
  }

  /**
   * Utility function used to flush the current batch and run all jobs in batch using
   * the provided `runJobs` function.
   */
  private async flushBatch() {
    // No batch to flush
    if (!this.batch) return;

    // Empty batch, clear timer
    const batchJobs = this.batch.jobs;
    clearTimeout(this.batch.timer);
    this.batch = null;

    // Run all jobs
    await this.runJobs(batchJobs);
  }

  /**
   * Add a job to the current batch or initialize a new batch.
   */
  public async queueJob(payload: T) {
    // Initialize batch
    if (!this.batch) {
      const timer = setTimeout(() => this.flushBatch(), this.batchDelayMs);
      this.batch = { jobs: [], timer };
    }

    // Set-up promise to resolve when batch completed
    const { reject, resolve, promise } = PromiseWithResolvers();

    // Add job to batch
    this.batch.jobs.push({ payload, reject, resolve });

    // Set timeout for job
    setTimeout(() => {
      reject(new Error("Job timed out"));
    }, this.jobTimeoutMs);

    // Return promise
    return promise;
  }
}
