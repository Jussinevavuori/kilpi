/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Compare two types for equality.
 */
export type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * Object with string keys to type T with any depth.
 */
export type DeepObject<T> = {
  [key: string]: T | DeepObject<T>;
};

/**
 * Extracts all values from an object which have a key of type Target.
 */
export type RecursiveValueByKey<
  Object,
  Key extends string,
  Separator extends string = ".",
> = Object extends object
  ? Key extends `${infer FirstKey}${Separator}${infer Rest}`
    ? FirstKey extends keyof Object
      ? RecursiveValueByKey<Object[FirstKey], Rest, Separator>
      : never
    : Key extends keyof Object
      ? Object[Key]
      : never
  : never;

/**
 * Value optionally wrapped in a promise.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Get head of array
 */
export type ArrayHead<T extends any[]> = T extends [infer H, ...any[]] ? H : never;

/**
 * Get tail of array
 */
export type ArrayTail<T extends any[]> = T extends [any, ...infer R] ? R : [];

/**
 * Any function
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Prettify utility
 * https://www.totaltypescript.com/docs/concepts/the-prettify-helper
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Given a tuple of length N, returns a union of all the sub-tuples from 0..N
 */
export type AnyLengthHead<T extends any[]> = T extends [...infer Head, any]
  ? AnyLengthHead<Head> | T
  : [];
