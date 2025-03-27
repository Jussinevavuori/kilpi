import { BatchJob } from "./BatchJob";

export type BatcherOptions<TPayload, TOutput = unknown> = {
  /**
   * When flushing the batch, this function is called with all jobs in the batch. It is this
   * function's responsibility to resolve each promise in the batch.
   */
  runJobs: Batcher<TPayload, TOutput>["runJobs"];

  /**
   * Custom comparison function. If provided and returns true, the requests are considered
   * identical and are automatically deduped.
   */
  dedupe?: (a: TPayload, b: TPayload) => boolean;

  /**
   * Override default batch delay
   */
  batchDelayMs?: number;

  /**
   * Override default job timeout
   */
  jobTimeoutMs?: number;
};

export class Batcher<TPayload, TOutput = unknown> {
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
  dedupe?: (a: TPayload, b: TPayload) => boolean;

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
    jobs: Array<BatchJob<TPayload, TOutput>>;
  };

  /**
   * Job handler
   */
  private runJobs: (jobs: Array<BatchJob<TPayload, TOutput>>) => Promise<void>;

  // Simple constructor
  constructor(options: BatcherOptions<TPayload, TOutput>) {
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
  public async queueJob(
    payload: TPayload,
    options: {
      signal?: AbortSignal | null | undefined;
    } = {},
  ) {
    // Initialize batch
    if (!this.batch) {
      const timer = setTimeout(() => this.flushBatch(), this.batchDelayMs);
      this.batch = { jobs: [], timer };
    }

    // Check if duplicate exists and dedupe. Return the same promise as the two jobs will resolve
    // to the same value.
    const duplicateJob = this.batch.jobs.find((job) => this.dedupe?.(job.payload, payload));
    if (duplicateJob) {
      return duplicateJob.dedupe({ signal: options.signal }).promise;
    }

    // Initialize a new job (no duplicate found) and add it to batch
    const job = new BatchJob<TPayload, TOutput>(payload, {
      jobTimeoutMs: this.jobTimeoutMs + this.batchDelayMs,
      signal: options.signal,
    });
    this.batch.jobs.push(job);

    // Return promise that job will resolve to
    return job.promise;
  }
}
