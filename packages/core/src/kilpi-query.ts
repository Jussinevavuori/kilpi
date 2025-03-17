import type { KilpiCore } from "./kilpi-core";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type KilpiQueryProtector<TInput, TRawOutput, TRedactedOutput, TSubject> =
  (args: {
    input: TInput;
    output: Awaited<TRawOutput>;
    subject: TSubject;
  }) => TRedactedOutput;

/**
 * Create protected queries. This pattern enables protection of data at the query level, allowing
 * for fine-grained control over data access. With this pattern, pages running multiple queries do
 * not have to remember to protect each piece of data individually, because calling each query
 * with `.protect()` (if a required query) will automatically
 * enforce the necessary protections.
 *
 * ```ts
 * const getUser = Kilpi.query(
 *   // Pure, cacheable query function
 *   cache(async (userId: string): Promise<User | null> => {
 *     const user = await db.query.Users.findFirst({ where: eq(Users.id, userId) });
 *     return user;
 *   },
 *
 *   // Protection options. With no protector defined, the query is unprotected.
 *   {
 *     // Protector function. Protects either by
 *     //   (a) Either returning a boolean for whether the user has access
 *     //   (b) Throwing an error if the user does not have access (e.g. with `Kilpi.protect()`)
 *     protect: async ({ input: [userId] }) => {
 *       await Kilpi.protect("Users:read", { userId });
 *     },
 *   }
 * );
 *
 * // Call directly -- no protections applied.
 * const user = await getUser.unsafe("123");
 *
 * // Call with protection -- throws if unauthorized
 * const user = await getUser.protect("123");
 * ```
 */
export class KilpiQuery<
  TCore extends KilpiCore<any, any>,
  TInput extends any[],
  TRawOutput,
  TRedactedOutput = TRawOutput,
> {
  private core: TCore;
  private query: (...args: TInput) => TRawOutput;

  // Inferring utility
  public $infer: {
    core: TCore;
    input: TInput;
    rawOutput: TRawOutput;
    redactedOutput: TRedactedOutput;
  } = {} as any;

  private protector: KilpiQueryProtector<
    TInput,
    TRawOutput,
    TRedactedOutput,
    TCore["$$infer"]["subject"]
  >;

  constructor(
    core: TCore,
    query: (...args: TInput) => TRawOutput,
    options: {
      protector?: KilpiQueryProtector<
        TInput,
        TRawOutput,
        TRedactedOutput,
        TCore["$$infer"]["subject"]
      >;
    } = {},
  ) {
    this.core = core;
    this.query = query;

    // Assign protector or use no-op protector by default
    this.protector =
      options?.protector ??
      ((args) => args.output as unknown as TRedactedOutput);
  }

  // ===============================================================================================
  // PUBLIC QUERY API
  // ===============================================================================================

  /**
   * Unsafe access. No redaction or protection.
   */
  public async unsafe(...args: TInput): Promise<TRawOutput> {
    return await this.query(...args);
  }

  /**
   * Safe access. Runs onDeny if the user does not have access.
   */
  public async protect(...args: TInput): Promise<Awaited<TRedactedOutput>> {
    // Run query and get subject
    const result = await this.query(...args);
    const subject = await this.core.getSubject();

    // Run through protector to protect (throws) or redact (returns)
    return await this.protector({
      input: args,
      output: result,
      subject,
    });
  }
}
