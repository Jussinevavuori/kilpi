import type { AnyKilpiCore } from "src/KilpiCore";
import { createKilpiPlugin } from "src/KilpiPlugin";

/**
 * WIP: Audit plugin
 */
export function AuditPlugin<T extends AnyKilpiCore>() {
  return createKilpiPlugin((_Kilpi: T) => {
    return {
      audit: () => {
        throw new Error("Not implemented");
      },
    };
  });
}
