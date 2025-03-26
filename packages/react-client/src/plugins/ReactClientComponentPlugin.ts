import type { KilpiClient } from "@kilpi/client";
import { createKilpiClientPlugin } from "@kilpi/client";
import { type AnyKilpiCore } from "@kilpi/core";
import { createClientAccess } from "src/components/ClientAccess";
import { createUseIsAuthorized } from "src/hooks/useIsAuthorized";
import { createUseSubject } from "src/hooks/useSubject";

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
          return {
            useSubject: createUseSubject(Client),
            useIsAuthorized: createUseIsAuthorized(Client),
            ClientAccess: createClientAccess(Client),
          };
        },
      },
    };
  });
}
