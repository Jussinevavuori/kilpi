import type { endpointRequestSchema } from "@kilpi/core";
import type { z } from "zod";
import type { BatcherOptions } from "./utils/Batcher";
import type { AnyRequestStrategyOptions } from "./utils/HandleRequestStrategy";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get head of array
 */
export type ArrayHead<T extends any[]> = T extends [infer H, ...any[]] ? H : never;

/**
 * Given a tuple of length N, returns a union of all the sub-tuples from 0..N
 */
export type AnyLengthHead<T extends any[]> = T extends [...infer Head, any]
  ? AnyLengthHead<Head> | T
  : [];

/**
 * Infer type of KilpiClientRequest from schema
 */
export type KilpiClientRequest = z.infer<typeof endpointRequestSchema>;

/**
 * Base options for creating a Kilpi client.
 */
export type KilpiClientOptions = {
  /**
   * Connection options. This constructs a HandleRequestStrategy under the hood.
   */
  connect: AnyRequestStrategyOptions;

  /**
   * Enable customizing the batching behaviour.
   */
  batching?: Pick<BatcherOptions<KilpiClientRequest>, "batchDelayMs" | "jobTimeoutMs">;
};

/**
 * Value optionally wrapped in a promise.
 */
export type MaybePromise<T> = T | Promise<T>;
