import { createKilpiPlugin } from "src/kilpi-plugin";

/**
 * WIP: Audit plugin
 */
export function AuditPlugin() {
  return createKilpiPlugin((core) => {
    return Object.assign(core, {
      audit: () => {
        throw new Error("Not implemented");
      },
    });
  });
}
