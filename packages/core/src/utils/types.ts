/**
 * Compare two types for equality.
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

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
          ? Key
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
  Separator extends string = "."
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
