import type { AnyKilpiClient } from "@kilpi/client";
import type { PolicysetActions } from "@kilpi/core";
import { type UseAuthorizeOptions, type UseAuthorizeReturn } from "./hooks/useAuthorize";

/**
 * The type of a KilpiClientPolicy extension.
 */
export interface KilpiClientPolicyExtension_ReactClientPlugin<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> {
  /**
   * Extend policies with a useAuthorize hook for usage in client-side React components.
   */
  useAuthorize(options?: UseAuthorizeOptions): UseAuthorizeReturn<TClient, TAction>;
}

/**
 * Augment KilpiClientPolicy with extension.
 */
declare module "@kilpi/client" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface IKilpiClientPolicy<
    TClient extends AnyKilpiClient,
    TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
  > extends KilpiClientPolicyExtension_ReactClientPlugin<TClient, TAction> {}
}
