// Public interface of @kilpi/core
export {
  Authorization,
  type AuthorizationDenied,
  type AuthorizationGranted,
} from "./authorization";
export { createKilpi } from "./create-kilpi";
export { KilpiError } from "./error";
export { type KilpiConstructorArgs } from "./kilpi-constructor-args";
export { KilpiCore } from "./kilpi-core";
export {
  KilpiPlugin,
  type EmptyInterface,
  type KilpiPluginArgs,
  type KilpiPluginFactory,
} from "./kilpi-plugin";
export {
  type ExtendedKilpiScope,
  type KilpiOnUnauthorizedHandler,
  type KilpiScope,
} from "./kilpi-scope";
export {
  getPolicyByKey,
  Policy,
  POLICY_KEY_SEPARATOR,
  type AnyPolicyInput,
  type EnsureTypeIsPolicy,
  type GetPolicyByKey,
  type InferPolicyInputs,
  type InferPolicySubject,
  type Policyset,
  type PolicysetKeys,
  type PolicySetKeysWithoutResource,
  type PolicysetKeysWithResource,
} from "./policy";
