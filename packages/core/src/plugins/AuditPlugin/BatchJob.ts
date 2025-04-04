import { PromiseWithResolvers } from "src/utils/PromiseWithResolvers";

export class BatchJob<TPayload, TOutput = unknown> {
  // Typed payload for job
  public payload: TPayload;

  // Promise with Resolvers
  public promise: Promise<TOutput>;
  public resolve: (value: TOutput) => void;
  public reject: (reason: unknown) => void;

  // Construct a new job from a payload
  constructor(payload: TPayload) {
    this.payload = payload;

    // Create a new promise for this job, with resolvers
    const promiseWithResolvers = PromiseWithResolvers<TOutput>();
    this.promise = promiseWithResolvers.promise;
    this.resolve = promiseWithResolvers.resolve;
    this.reject = promiseWithResolvers.reject;
  }
}
