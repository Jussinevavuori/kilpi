import type { AnyKilpiCore } from "src/KilpiCore";
import { createKilpiPlugin } from "src/KilpiPlugin";

/**
 * WIP: Audit plugin
 */
export function AuditPlugin<T extends AnyKilpiCore>() {
  return createKilpiPlugin((Kilpi: T) => {
    return Kilpi.extend({
      audit: () => {
        throw new Error("Not implemented");
      },
    });
  });
}
