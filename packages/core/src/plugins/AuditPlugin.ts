import type { KilpiCore } from "src/kilpi-core";
import { KilpiPlugin, type EmptyInterface } from "src/kilpi-plugin";
import type { Policyset } from "src/policy";

type Interface = EmptyInterface;

/**
 * Audit plugin
 */
export function AuditPlugin<
  TSubject,
  TPolicyset extends Policyset<TSubject>,
>() {
  return function AuditPluginFactory(_Kilpi: KilpiCore<TSubject, TPolicyset>) {
    // Instantiate the AuditPlugin
    return new KilpiPlugin<TSubject, TPolicyset, Interface>({
      name: "AuditPlugin",

      // Custom interface for interacting with the plugin
      interface: {},
    });
  };
}
