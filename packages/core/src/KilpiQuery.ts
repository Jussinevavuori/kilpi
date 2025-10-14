import { KilpiCore } from "./KilpiCore";
import type { AnyGetSubject } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Authorization function for KilpiQuery which authorizes or redacts the output.
 */
export type KilpiQueryAuthorizeFn<
  TInput,
  TRawOutput,
  TRedactedOutput,
  TGetSubject extends AnyGetSubject,
> = (args: {
  input: TInput;
  output: Awaited<TRawOutput>;
  subject: Awaited<ReturnType<TGetSubject>>;
}) => TRedactedOutput;

/**
 * Create protected queries.
 */
export class KilpiQuery<
  TCore extends KilpiCore<any, any>,
  TInput extends any[],
  TRawOutput,
  TRedactedOutput = TRawOutput,
> {
  /**
   * Reference to core instance.
   */
  private core: TCore;

  /**
   * Reference to internal query function.
   */
  private query: (...args: TInput) => TRawOutput;

  /**
   * Type inference utilities. Do not use at runtime.
   */
  public $$infer: {
    core: TCore;
    input: TInput;
    rawOutput: TRawOutput;
    redactedOutput: TRedactedOutput;
  } = {} as any;

  /**
   * Authorization function which is called after the query is executed to
   * authorize or redact the output.
   */
  private authorize: KilpiQueryAuthorizeFn<
    TInput,
    TRawOutput,
    TRedactedOutput,
    TCore["$$infer"]["getSubject"]
  >;

  /**
   * Constructor which assigns all parameters.
   */
  constructor(
    core: TCore,
    query: (...args: TInput) => TRawOutput,
    options: {
      authorize?: KilpiQueryAuthorizeFn<
        TInput,
        TRawOutput,
        TRedactedOutput,
        TCore["$$infer"]["getSubject"]
      >;
    } = {},
  ) {
    this.core = core;
    this.query = query;

    // Assign authorize output fn or use no-op authorize by default
    this.authorize = options?.authorize ?? ((args) => args.output as unknown as TRedactedOutput);
  }

  // ===============================================================================================
  // PUBLIC QUERY API
  // ===============================================================================================

  /**
   * Unsafe access. No authorization or redaction.
   */
  public async unauthorized(...args: TInput): Promise<Awaited<TRawOutput>> {
    return await this.query(...args);
  }

  /**
   * Safe access. Runs authorization and redaction.
   */
  public async authorized(...input: TInput): Promise<Awaited<TRedactedOutput>> {
    // Access subject
    const subject = await KilpiCore.expose(this.core).getSubject();

    // Run query
    const output = await this.query(...input);

    // Run through authorize to authorize or redact data
    return await this.authorize({ input, output, subject });
  }
}
