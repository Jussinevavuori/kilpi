/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Converts a union (e.g. `{ name: string } | { age: number }`) into an intersection
 * (`{ name: string } & { age: number } = { name: string, age: number }`) with evil
 * Typescript magic.
 *
 * https://stackoverflow.com/a/50375286
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
