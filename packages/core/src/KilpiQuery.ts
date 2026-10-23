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
export type KilpiQuery<
  TCore extends KilpiCore<any, any>,
  TInput extends any[],
  TRawOutput,
  TRedactedOutput = TRawOutput,
> = {
  /**
   * Type inference utilities. Do not use at runtime.
   */
  $$infer: {
    core: TCore;
    input: TInput;
    rawOutput: TRawOutput;
    redactedOutput: TRedactedOutput;
  };

  /**
   * Unsafe access. No authorization or redaction.
   */
  unauthorized: (...args: TInput) => Promise<Awaited<TRawOutput>>;

  /**
   * Safe access. Runs authorization and redaction.
   */
  authorized: (...input: TInput) => Promise<Awaited<TRedactedOutput>>;
};

/**
 * Create protected queries without classes.
 */
export const createKilpiQuery = <
  TCore extends KilpiCore<any, any>,
  TInput extends any[],
  TRawOutput,
  TRedactedOutput = TRawOutput,
>(
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
): KilpiQuery<TCore, TInput, TRawOutput, TRedactedOutput> => {
  // Assign authorize output fn or use no-op authorize by default
  const authorize =
    options?.authorize ?? ((args) => args.output as unknown as TRedactedOutput);

  return {
    $$infer: {} as any,

    async unauthorized(...args: TInput): Promise<Awaited<TRawOutput>> {
      return await query(...args);
    },

    async authorized(...input: TInput): Promise<Awaited<TRedactedOutput>> {
      // Access subject
      const subject = await KilpiCore.expose(core).getSubject();

      // Run query
      const output = await query(...input);

      // Run through authorize to authorize or redact data
      return await authorize({ input, output, subject });
    },
  };
};
