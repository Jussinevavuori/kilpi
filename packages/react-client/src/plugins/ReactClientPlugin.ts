import type { AnyKilpiClient, AnyKilpiClientPolicy, KilpiClient } from "@kilpi/client";
import { createKilpiClientPlugin } from "@kilpi/client";
import type { AnyKilpiCore, PolicysetActions } from "@kilpi/core";

/**
 * Type augmentation to add the $sayMyName method to all policies in the client.
 */
interface KilpiClientPolicyExtension_ReactClientPlugin<
  TClient extends AnyKilpiClient,
  TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
> {
  $sayMyName: () => TAction;

  useAuthorize: () => null;
}

/**
 * Type augmentation to add the $sayMyName method to all policies in the client.
 */
declare module "@kilpi/client" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface IKilpiClientPolicy<
    TClient extends AnyKilpiClient,
    TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
  > extends KilpiClientPolicyExtension_ReactClientPlugin<TClient, TAction> {}
}

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components and for creating the React Server Component bindings
 * to work with Kilpi.
 */
export function ReactClientPlugin<TCore extends AnyKilpiCore>() {
  return createKilpiClientPlugin((Client: KilpiClient<TCore>) => {
    void Client;
    return {
      extendClientApi: {
        $setupReactClient() {},
      },
      extendPolicyApi: <TPolicy extends AnyKilpiClientPolicy>(Policy: TPolicy) => {
        return {
          $sayMyName() {
            return Policy.$action;
          },
          useAuthorize() {
            return null;
          },
        };
      },
    };
  });
}
