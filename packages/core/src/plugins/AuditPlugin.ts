import type { AnyKilpiCore } from "src/kilpi-core";
import { createKilpiPlugin } from "src/kilpi-plugin";

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
