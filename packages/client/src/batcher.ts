import { PromiseWithResolvers } from "./utils/PromiseWithResolvers";

export type BatchJob<T> = {
  payload: T;
  reject: (reason: unknown) => void;
  resolve: (value: unknown) => void;
};

export type BatcherOptions<T> = {
  /**
   * When flushing the batch, this function is called with all jobs in the batch. It is this
   * function's responsibility to resolve each promise in the batch.
   */
  runJobs: Batcher<T>["runJobs"];

  /**
   * Custom comparison function. If provided and returns true, the requests are considered
   * identical and are automatically deduped.
   */
  dedupe?: (a: T, b: T) => boolean;

  /**
   * Override default batch delay
   */
  batchDelayMs?: number;

  /**
   * Override default job timeout
   */
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
   * Custom comparison function. If provided and returns true, the requests are considered
   * identical and are automatically deduped.
   */
  dedupe?: (a: T, b: T) => boolean;

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
      promise: Promise<unknown>;
    }>;
  };

  /**
   * Job handler
   */
  private runJobs: (jobs: BatchJob<T>[]) => Promise<void>;

  // Simple constructor
  constructor(options: BatcherOptions<T>) {
    this.runJobs = options.runJobs;
    this.batchDelayMs = options.batchDelayMs ?? 50;
    this.jobTimeoutMs = options.jobTimeoutMs ?? 5_000;
    this.batch = null;
    this.dedupe = options.dedupe;
  }

  /**
   * Utility function used to flush the current batch and run all jobs in batch using
   * the provided `runJobs` function.
   */
  public async flushBatch() {
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

    // Deduplication
    const duplicateJob = this.batch.jobs.find((job) => this.dedupe?.(job.payload, payload));
    if (duplicateJob) return duplicateJob.promise;

    // Set-up promise to resolve when batch completed
    const { reject, resolve, promise } = PromiseWithResolvers();

    // Add job to batch
    this.batch.jobs.push({ payload, reject, resolve, promise });

    // Set timeout for job
    setTimeout(() => {
      reject(new Error("Job timed out"));
    }, this.jobTimeoutMs);

    // Return promise
    return promise;
  }
}
