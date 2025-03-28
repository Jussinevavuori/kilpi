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

  // Construct public signal as
  // (timeoutSignal || allSignals)
  private allSignals: AbortSignal;
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

    // Setup timeout signal
    this.timeoutSignal = AbortSignal.timeout(this.jobTimeoutMs);

    // Setup allSignals
    this.allSignals = args.signal ?? new AbortController().signal;

    // Create a public signal for this job, with automatic timeout cancellation
    this.signal = AbortSignal.any([this.timeoutSignal, this.allSignals]);
  }

  /**
   * Public utility to dedupe a job: When another job with the same payload is detected, call this
   * to use the same job instance for both requests.
   */
  public dedupe(args: { signal?: AbortSignal | null | undefined }) {
    this.allSignals = AbortSignalAll([
      this.allSignals,
      args.signal ?? new AbortController().signal,
    ]);
    this.signal = AbortSignal.any([this.timeoutSignal, this.allSignals]);
    return this;
  }
}

const DEFAULT_BATCH_JOB_TIMEOUT_MS = 10_000;
