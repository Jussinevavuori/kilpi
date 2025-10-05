import { KilpiError } from "./KilpiError";
import { SEPARATOR, type GetPolicyByAction, type Policyset, type PolicysetActions } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Typesafe function to extract a policy from a policyset by the action.
 */
export function getPolicyByAction<
  const TPolicyset extends Policyset<any>,
  TAction extends PolicysetActions<TPolicyset>,
>(policyset: TPolicyset, action: TAction) {
  // Access policy by action
  const parts = action.split(SEPARATOR);
  const policy = parts.reduce<any>((index, k) => index[k], policyset);

  // Ensure policy found
  if (typeof policy !== "function") {
    throw new KilpiError.Internal(`Policy not found: "${action}"`);
  }

  // Typecast as this can not be done type-safely without
  return policy as GetPolicyByAction<TPolicyset, TAction>;
}
