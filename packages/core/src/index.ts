// Public interface of @kilpi/core
export {
  Authorization,
  type AuthorizationDenied,
  type AuthorizationGranted,
} from "./authorization";
export { createKilpi } from "./create-kilpi";
export { KilpiError } from "./error";
export {
  type KilpiAdapter,
  type KilpiAdapterInitializer,
} from "./kilpi-adapter";
export { KilpiCore, type KilpiConstructorArgs } from "./kilpi-core";
export {
  type KilpiOnUnauthorizedHandler,
  type KilpiRequestContext,
} from "./kilpi-request-context";
export {
  type AnyPolicyInput,
  type InferPolicyInputs,
  type InferPolicySubject,
  type Policy,
} from "./policy";
export {
  getPolicyByKey,
  POLICY_KEY_SEPARATOR,
  type EnsureTypeIsPolicy,
  type GetPolicyByKey,
  type Policyset,
  type PolicysetKeys,
  type PolicySetKeysWithoutResource,
  type PolicysetKeysWithResource,
} from "./policy-set";
