import type { KilpiClient } from "@kilpi/client";
import { createKilpiClientPlugin } from "@kilpi/client";
import type { AnyKilpiCore, PolicysetActions } from "@kilpi/core";
import { create_AuthorizeClient } from "../components/AuthorizeClient";
import { create_useAuthorize } from "../hooks/useAuthorize";
import type { KilpiClientPolicyExtension_ReactClientPlugin } from "../type.extension";

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components and for creating the React Server Component bindings
 * to work with Kilpi.
 */
export function ReactClientPlugin<TCore extends AnyKilpiCore>() {
  return createKilpiClientPlugin((Client: KilpiClient<TCore>) => {
    return {
      /**
       * Extend the client to allow creating components.
       */
      extendClient() {
        return {
          $createReactClientComponents() {
            const AuthorizeClient = create_AuthorizeClient(Client);
            return {
              AuthorizeClient,
            };
          },
        };
      },

      /**
       * Extend policies to add the `useAuthorize` hook. Ensure matches extension type
       * with the satisfies clause.
       */
      extendPolicy(policy) {
        return {
          useAuthorize(options) {
            const useAuthorize = create_useAuthorize(Client, policy);
            return useAuthorize(options);
          },
        } satisfies KilpiClientPolicyExtension_ReactClientPlugin<
          KilpiClient<TCore>,
          PolicysetActions<TCore["$$infer"]["policies"]>
        >;
      },
    };
  });
}
