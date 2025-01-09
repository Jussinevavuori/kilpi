/**
 * Storage for a value that can be read and written.
 */
export type GetSetStorage<T> = {
  get: () => T;
  set: (value: T) => void;
};
