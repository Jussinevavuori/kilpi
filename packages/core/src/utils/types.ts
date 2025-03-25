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
 * Extracts all keys from an object which have a value of type Target.
 */
export type RecursiveKeysTo<Object, Target, Separator extends string = "."> = Object extends object
  ? {
      [Key in keyof Object]: Key extends string | number
        ? Object[Key] extends Target
          ? `${Key}`
          : `${Key}${Separator}${RecursiveKeysTo<Object[Key], Target, Separator>}`
        : never;
    }[keyof Object]
  : never;

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
export type ArrayTail<T extends any[]> = T extends [any, ...infer R] ? R : never;

/**
 * Any function
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Prettify utility
 * https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
