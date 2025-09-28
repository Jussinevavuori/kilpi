import type {
  AnyKilpiCore,
  GetPolicyByAction,
  InferPolicyInputs,
  Policy,
  PolicysetActions,
} from "@kilpi/core";
import { KilpiClient, type AnyKilpiClient } from "./KilpiClient";
import type { KilpiClientPlugin } from "./KilpiClientPlugin";
import { KilpiClientPolicy, type IKilpiClientPolicy } from "./KilpiClientPolicy";
import type { AnyLengthHead, KilpiClientOptions } from "./types";
import { createRecursiveProxy } from "./utils/proxy";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Recursive type of fulent proxy API
 */
type FluentPolicyProxyApi<TClient extends AnyKilpiClient, T, TPath extends string = ""> = {
  [TKey in keyof T]: TKey extends string // Only consider string keys
    ? T[TKey] extends infer $Value // $Value := T[TKey]
      ? (TPath extends "" ? TKey : `${TPath}.${TKey}`) extends infer $TAction // $TAction := TPath ? `TPath.TKey` : TKey
        ? $Value extends Policy<infer $TInputs, any, any> // $Value is a policy? (Infer policy types)
          ? // ==== POLICY REACHED: Decorate as KilpiPolicy ====
            $TAction extends PolicysetActions<TClient["$$infer"]["policies"]>
            ? (...inputs: $TInputs) => IKilpiClientPolicy<TClient, $TAction> // Decorate policies as KilpiPolicy with plugins
            : `TS Error: $TAction is invalid (${$TAction extends string ? $TAction : "not-a-string"})` // $TAction not a valid action?
          : // ==== NAMESPACE REACHED: Recurse without changes ====
            $TAction extends string
            ? FluentPolicyProxyApi<TClient, $Value, $TAction> // Recurse
            : "TS Error: $TAction is not a string"
        : "TS Error: $Value assignment failed"
      : "TS Error: $TAction assignment failed"
    : never; // TKey not string - omit non-string keys
};

/**
 * Create Kilpi for the client.
 */
export function createKilpiClient<
  T extends AnyKilpiCore,
  // Support up to 10 strongly typed core plugins
  P_00 extends object,
  P_01 extends object,
  P_02 extends object,
  P_03 extends object,
  P_04 extends object,
  P_05 extends object,
  P_06 extends object,
  P_07 extends object,
  P_08 extends object,
  P_09 extends object,
>({
  plugins = [],
  ...options
}: KilpiClientOptions & {
  infer?: T;
  // Support up to 9 strongly typed plugins
  plugins?: AnyLengthHead<
    [
      KilpiClientPlugin<NoInfer<T>, P_00>,
      KilpiClientPlugin<NoInfer<T>, P_01>,
      KilpiClientPlugin<NoInfer<T>, P_02>,
      KilpiClientPlugin<NoInfer<T>, P_03>,
      KilpiClientPlugin<NoInfer<T>, P_04>,
      KilpiClientPlugin<NoInfer<T>, P_05>,
      KilpiClientPlugin<NoInfer<T>, P_06>,
      KilpiClientPlugin<NoInfer<T>, P_07>,
      KilpiClientPlugin<NoInfer<T>, P_08>,
      KilpiClientPlugin<NoInfer<T>, P_09>,
    ]
  >;
}) {
  // =========================================================
  // INITIALIZE CLIENT AND PLUGINS
  // =========================================================

  // Construct base KilpiCore class
  const Client = new KilpiClient<T>(options);

  // Apply each core plugin and merge them into a single interface (requires type cast)
  const Plugins = plugins
    // Instantiate each plugin
    .map((instantiatePlugin) => instantiatePlugin(Client))
    // Merge all plugins
    .reduce((merged, corePlugin) => Object.assign(merged, corePlugin), {}) as P_00 &
    P_01 &
    P_02 &
    P_03 &
    P_04 &
    P_05 &
    P_06 &
    P_07 &
    P_08 &
    P_09;
  // Merge each plugin
  const ClientWithPlugins = Object.assign(Client, Plugins);

  // =========================================================
  // IMPLEMENT FLUENT POLICY PROXY API
  // 1. Root level implemented here to allow reflecting core
  //    properties.
  // 2. Rest of policy namespaces in fluent policy proxy API
  //    implemented via default recursive proxy.
  // =========================================================

  return new Proxy(ClientWithPlugins, {
    get(target, prop, receiver) {
      // Reflect core properties (e.g. $hooks, $query, etc.)
      if (Reflect.has(target, prop)) return Reflect.get(target, prop, receiver);

      // Enter dynamic namespace
      return createRecursiveProxy(
        (opts) => {
          // Extract action and inputs from the proxy call
          const action = opts.path.join(".") as PolicysetActions<T["$$infer"]["policies"]>;
          const inputs = opts.args as InferPolicyInputs<
            GetPolicyByAction<T["$$infer"]["policies"], typeof action>
          >;

          // Setup and return the KilpiPolicy instance
          const policy = new KilpiClientPolicy({ client: ClientWithPlugins, action, inputs });
          return policy;
        },
        [String(prop)],
      );
    },
  }) as FluentPolicyProxyApi<typeof Client, T["$$infer"]["policies"]> & typeof ClientWithPlugins;
}
