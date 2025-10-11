import type { Decision, GetPolicyByAction, InferPolicyInputs, PolicysetActions } from "@kilpi/core";
import { nanoid } from "nanoid";
import { z } from "zod";
import { KilpiClient, type AnyKilpiClient } from "./KilpiClient";
import { KilpiClientCache } from "./KilpiClientCache";
import { tryCatch } from "./utils/tryCatch";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * When accessing a policy via the fluent proxy API, this class is instantiated.
 */
export class KilpiClientPolicy<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> {
  // Private internals
  #client: TClient;
  #inputs: InferPolicyInputs<GetPolicyByAction<TClient["$$infer"]["policies"], TAction>>;

  // Utility to access the first object input (if any)
  get #object() {
    return this.#inputs?.[0];
  }

  // Public internals
  $action: TAction;

  // Constructor
  constructor(options: {
    client: TClient;
    action: TAction;
    inputs: InferPolicyInputs<GetPolicyByAction<TClient["$$infer"]["policies"], TAction>>;
  }) {
    this.#client = options.client;
    this.$action = options.action;
    this.#inputs = options.inputs || []; // Ensure iterable
  }

  /**
   * The cache key for this policy + inputs.
   */
  public get $cacheKey() {
    return [this.$action, this.#object];
  }

  /**
   * Fetch the authorization decision from the Kilpi server. Cached.
   */
  public async authorize(
    options: Partial<{ signal: AbortSignal | null | undefined }> = {},
  ): Promise<Decision<TClient["$$infer"]["subject"]>> {
    return KilpiClientCache.runAsyncCachedFunction(
      // Cache options
      {
        // Ensure unique cache key per action + inputs
        key: this.$cacheKey,
        client: this.#client,
      },
      // Cached value resolver
      async () => {
        // Access internal batcher
        const batcher = KilpiClient.expose(this.#client).batcher;

        // Parse response against the following schema
        const authorizeResponseDataSchema = z.object({
          decision: z.discriminatedUnion("granted", [
            z.object({
              granted: z.literal(true),
              subject: z.unknown(),
            }),
            z.object({
              granted: z.literal(false),
              message: z.string().optional(),
              reason: z.string().optional(),
              metadata: z.unknown().optional(),
            }),
          ]),
        });

        // Fetch authorization from the server (with batching)
        const responseAttempt = await tryCatch(
          batcher.queueJob(
            {
              type: "fetchDecision",
              action: this.$action,
              requestId: nanoid(),
              object: this.#object,
            },
            {
              signal: options.signal,
            },
          ),
        );

        // Parse response
        const parsed = authorizeResponseDataSchema.safeParse(responseAttempt.value);

        // Invalid response: Log error and return made up denied decision
        if (!parsed.success || responseAttempt.error) {
          const message = [
            `🔴 [KilpiClient] Kilpi server responded with invalid data for authorize:`,
            JSON.stringify(responseAttempt.value, null, 2),
            "Ensure that...",
            "(1) You are using the latest version of Kilpi on both client and server.",
            "(2) You have installed the EndpointPlugin on the server.",
            "(3) You have exposed the Kilpi endpoint correctly.",
            "(4) The server is not responding with an error page (check the network tab).",
            "(5) You have correctly configured CORS.",
            "(6) You have correctly configured environment variables.",
          ].join("\n");
          console.error(message);
          return {
            granted: false,
            reason: "KILPI_INTERNAL::INVALID_RESPONSE",
            message: "Authorization failed due to invalid response from server.",
            metadata: { responseData: responseAttempt.value },
          };
        }

        // Valid response: Return the decision and ensure types are correct
        if (parsed.data.decision.granted) {
          return {
            granted: true,
            subject: parsed.data.decision.subject as TClient["$$infer"]["subject"],
          };
        } else {
          return {
            granted: false,
            reason: parsed.data.decision.reason,
            message: parsed.data.decision.message,
            metadata: parsed.data.decision.metadata,
          };
        }
      },
    );
  }

  /**
   * Allow fine-grained invalidation of the cache for this specific policy + inputs.
   */
  public invalidate() {
    this.#client.$cache.invalidateKey(this.$cacheKey);
  }
}

/**
 * Implement an interface for the class for future plugins which may extend this class.
 */
export interface IKilpiClientPolicy<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> extends KilpiClientPolicy<TClient, TAction> {}

/**
 * Utility type
 */
export type AnyKilpiClientPolicy = KilpiClientPolicy<any, any>;
