import { AbortSignalAll } from "./AbortSignalAll";
import { PromiseWithResolvers } from "./PromiseWithResolvers";

export class BatchJob<TPayload, TOutput = unknown> {
  // Typed payload for job
  public payload: TPayload;

  // Promise with Resolvers
  public promise: Promise<TOutput>;
  public resolve: (value: TOutput) => void;
  public reject: (reason: unknown) => void;

  // This is the publis signal passed from the job to the job runner, which may e.g.
  // pass this signal to a fetch request.
  public signal: AbortSignal;

  // Internally, the public signal is implemented using a list of private signals, such that
  // when ALL OF THEM have aborted, the public signal is also aborted. This is to support
  // deduping: We don't want to cancel a deduped request when one job is cancelled, but when
  // all of the jobs are cancelled.
  private manualSignals: AbortSignal[];
  private timeoutSignal: AbortSignal;

  // Job timeout
  private jobTimeoutMs: number;

  // Construct a new job from a payload
  constructor(
    payload: TPayload,
    args: {
      jobTimeoutMs?: number;
      signal?: AbortSignal | null | undefined;
    },
  ) {
    // Save arguments
    this.payload = payload;
    this.jobTimeoutMs = args.jobTimeoutMs ?? DEFAULT_BATCH_JOB_TIMEOUT_MS;

    // Create a new promise for this job, with resolvers
    const promiseWithResolvers = PromiseWithResolvers<TOutput>();
    this.promise = promiseWithResolvers.promise;
    this.resolve = promiseWithResolvers.resolve;
    this.reject = promiseWithResolvers.reject;

    // Create a timeout signal for this job
    this.timeoutSignal = AbortSignal.timeout(this.jobTimeoutMs);

    // Initialize signals as an empty array
    this.manualSignals = [];

    // Create a public signal for this job, with automatic timeout cancellation
    this.signal = AbortSignal.any([this.timeoutSignal, AbortSignalAll(this.manualSignals)]);

    // Register the provided signal
    this.registerSignal(args.signal);
  }

  /**
   * Public utility to dedupe a job: When another job with the same payload is detected, call this
   * to use the same job instance for both requests.
   */
  public dedupe(args: { signal?: AbortSignal | null | undefined }) {
    this.registerSignal(args.signal);
    return this;
  }

  /**
   * Utility to register a new internal signal to the signals collection.
   *
   * If no signal provided, a static never-canceling abort signal is created. This ensures that
   * the job will never be canceled (except for a timeout) as there is one copy of job that we never
   * know whether it should be canceled.
   */
  private registerSignal(_signal: AbortSignal | null | undefined) {
    // Use static never-canceling signal if no signal provided
    const signal = _signal ?? new AbortController().signal;

    // Add new signal to list of manual signals
    this.manualSignals.push(signal);

    // Create a public signal for this job, with automatic timeout cancellation
    this.signal = AbortSignal.any([this.timeoutSignal, AbortSignalAll(this.manualSignals)]);
  }
}

const DEFAULT_BATCH_JOB_TIMEOUT_MS = 10_000;
