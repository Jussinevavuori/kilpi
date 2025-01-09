/**
 * Create batcher. You batch job inputs which resolve in a single request using `runBatchedJobs`.
 * The batch job must return a promise which resolves to an array of job outputs, which are matched
 * to the inputs by index. Ensure that the indices in the input and output match.
 *
 * TODO: Deduping
 */
export function createBatcher<TJobInput, TJobOutput>(
  /**
   * Batch runner function.
   */
  runJobs: (jobs: TJobInput[]) => Promise<TJobOutput[]>,

  options: {
    /**
     * How long to wait for before processing the batch in a single request. Defaults to 50ms.
     */
    batchTimeMs?: number;
  } = {}
) {
  type Job = {
    input: TJobInput;
    resolve: (output: TJobOutput) => void;
    reject: (error: unknown) => void;
  };

  /**
   * Current batch status
   */
  let batch: { jobs: Job[]; runnerTimeout: ReturnType<typeof setTimeout> } | undefined = undefined;

  /**
   * Create runner for given jobs
   */
  function setupRunner(jobs: Job[]): ReturnType<typeof setTimeout> {
    async function commitBatch() {
      // When starting to run, remove batch as it is now committed into this scope
      batch = undefined;

      // Run jobs to get batched outputs
      const outputs = await runJobs(jobs.map((_) => _.input));

      // Reoslve outputs (or reject on error)
      for (let i = 0; i < jobs.length; i++) {
        try {
          const output = await outputs[i];
          jobs[i].resolve(output);
        } catch (error) {
          jobs[i].reject(error);
        }
      }
    }

    return setTimeout(commitBatch, options.batchTimeMs ?? 50);
  }

  /**
   * Enqueue job and resolve as promise once batch runs.
   */
  function enqueueJob(input: TJobInput): Promise<TJobOutput> {
    const { promise, reject, resolve } = Promise.withResolvers<TJobOutput>();

    // Cancel current runner if it exists
    const currentBatch = batch;
    if (currentBatch) clearTimeout(currentBatch.runnerTimeout);

    // Setup jobs for next batch (currently batched jobs + new job) and setup a runner for them
    const jobs = (currentBatch?.jobs ?? []).concat({ input, resolve, reject });
    const runnerTimeout = setupRunner(jobs);

    // Set as new batch
    batch = { jobs, runnerTimeout };

    // Return promise
    return promise;
  }

  return { enqueueJob };
}
