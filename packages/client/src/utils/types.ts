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
