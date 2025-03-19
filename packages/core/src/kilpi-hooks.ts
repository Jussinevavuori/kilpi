import type { Authorization } from "./authorization";
import type { KilpiScope } from "./kilpi-scope";
import type { InferPolicySubject, Policyset, PolicysetKeys } from "./policy";

/**
 * Different hooks that can be used to extend Kilpi functionality via plugins.
 */
export type KilpiHooks<TSubject, TPolicyset extends Policyset<TSubject>> = {
  /**
   * Before authorization
   */
  onBeforeAuthorization: (
    event: {
      [key in PolicysetKeys<TPolicyset>]: {
        policy: key;
        subject: TSubject;
        scope: KilpiScope<TSubject, TPolicyset>;
      };
    }[PolicysetKeys<TPolicyset>],
  ) => void;

  /**
   * After authorization
   */
  onAfterAuthorization: (
    event: {
      [key in PolicysetKeys<TPolicyset>]: {
        policy: key;
        subject: TSubject;
        authorization: Authorization<InferPolicySubject<TPolicyset[key]>>;
        scope: KilpiScope<TSubject, TPolicyset>;
      };
    }[PolicysetKeys<TPolicyset>],
  ) => void;
};
