import type { KilpiClient } from "@kilpi/client";
import { createKilpiClientPlugin } from "@kilpi/client";
import type { AnyKilpiCore } from "@kilpi/core";
import { create_ClientAccess } from "src/components/ClientAccess";
import { create_useSubject } from "src/hooks/useSubject";
import { create_useIsAuthorized } from "../hooks/useIsAuthorized";

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components and for creating the React Server Component bindings
 * to work with Kilpi.
 */
export function ReactClientComponentPlugin<T extends AnyKilpiCore>() {
  return createKilpiClientPlugin((Client: KilpiClient<T>) => {
    return {
      ReactClient: {
        createComponents() {
          // Create hooks
          const useSubject = create_useSubject(Client);
          const useIsAuthorized = create_useIsAuthorized(Client);

          // Create components with hooks
          const ClientAccess = create_ClientAccess(Client, useIsAuthorized);

          // Return
          return { useSubject, useIsAuthorized, ClientAccess };
        },
      },
    };
  });
}
