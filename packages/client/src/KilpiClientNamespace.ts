import { type AnyKilpiClient } from "./KilpiClient";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * When accessing a policy via the fluent proxy API, this class is instantiated.
 */
export class KilpiClientNamespace<TClient extends AnyKilpiClient, TPath extends string> {
  #client: TClient;

  public path: TPath;

  constructor(options: { client: TClient; path: TPath }) {
    this.#client = options.client;
    this.path = options.path;
  }

  /**
   * The cache key for this policy + inputs.
   */
  public get $cacheKey() {
    if (this.path === "") return [];
    return this.path.split(".");
  }

  /**
   * Allow fine-grained invalidation of the cache for this specific policy + inputs.
   */
  public $invalidate() {
    this.#client.$cache.invalidate(this.$cacheKey);
  }
}

/**
 * Implement an interface for the class for future plugins which may extend this class.
 */
export interface IKilpiClientNamespace<TClient extends AnyKilpiClient, TPath extends string>
  extends KilpiClientNamespace<TClient, TPath> {}

/**
 * Utility type
 */
export type AnyKilpiClientNamespace = KilpiClientNamespace<any, any>;
