import { KilpiCore, type AnyKilpiCore } from "./KilpiCore";
import { type KilpiPlugin } from "./KilpiPlugin";
import { KilpiPolicy } from "./KilpiPolicy";
import type {
  AnyGetSubject,
  GetPolicyByAction,
  InferPolicyInputs,
  KilpiConstructorArgs,
  Policy,
  Policyset,
  PolicysetActions,
  SEPARATOR,
} from "./types";
import { createRecursiveProxy } from "./utils/proxy";
import type { AnyLengthHead } from "./utils/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Recursive type of fulent proxy API
 */
type FluentPolicyProxyApi<TCore extends AnyKilpiCore, T, TPath extends string = ""> = {
  [TKey in keyof T]: TKey extends string // Only consider string keys
    ? T[TKey] extends infer $Value // $Value := T[TKey]
      ? (TPath extends "" ? TKey : `${TPath}${typeof SEPARATOR}${TKey}`) extends infer $TAction // $TAction := TPath ? `TPath.TKey` : TKey
        ? $Value extends Policy<infer $TInputs, any, any> // $Value is a policy? (Infer policy types)
          ? // ==== POLICY REACHED: Decorate as KilpiPolicy ====
            $TAction extends PolicysetActions<TCore["$$infer"]["policies"]>
            ? (...inputs: $TInputs) => KilpiPolicy<TCore, $TAction> // Decorate policies as KilpiPolicy with plugins
            : `TS Error: $TAction is invalid (${$TAction extends string ? $TAction : "not-a-string"})` // $TAction not a valid action?
          : // ==== NAMESPACE REACHED: Recurse without changes ====
            $TAction extends string
            ? FluentPolicyProxyApi<TCore, $Value, $TAction> // Recurse
            : "TS Error: $TAction is not a string"
        : "TS Error: $Value assignment failed"
      : "TS Error: $TAction assignment failed"
    : never; // TKey not string - omit non-string keys
};

/**
 * Initialize the Kilpi library.
 *
 * Instantiates a new KilpiCore object and applies all provided plugins.
 */
export function createKilpi<
  TGetSubject extends AnyGetSubject,
  TPolicyset extends Policyset<Awaited<ReturnType<TGetSubject>>>,
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
  ...kilpiCoreOptions
}: KilpiConstructorArgs<TGetSubject, TPolicyset> & {
  // Support up to 10 strongly core and policy plugins
  plugins?: AnyLengthHead<
    [
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_00>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_01>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_02>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_03>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_04>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_05>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_06>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_07>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_08>,
      KilpiPlugin<KilpiCore<TGetSubject, TPolicyset>, P_09>,
    ]
  >;
}) {
  // =========================================================
  // INITIALIZE CORE AND PLUGINS
  // =========================================================

  // Construct base KilpiCore class
  const Core = new KilpiCore(kilpiCoreOptions);

  // Apply each core plugin and merge them into a single interface (requires type cast)
  const Plugins = plugins
    // Instantiate each plugin
    .map((instantiatePlugin) => instantiatePlugin(Core))
    // Extract interface for each plugin
    .map((plugin) => plugin.extendCore?.() || {})
    // Merge all Plugins
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
  const CoreWithPlugins = Object.assign(Core, Plugins);

  // =========================================================
  // IMPLEMENT FLUENT POLICY PROXY API
  // 1. Root level implemented here to allow reflecting core
  //    properties.
  // 2. Rest of policy namespaces in fluent policy proxy API
  //    implemented via default recursive proxy.
  // =========================================================

  return new Proxy(CoreWithPlugins, {
    get(target, prop, receiver) {
      // Reflect core properties (e.g. $hooks, $query, etc.)
      if (Reflect.has(target, prop)) return Reflect.get(target, prop, receiver);

      // Enter dynamic namespace
      return createRecursiveProxy(
        (opts) => {
          // Extract action and inputs from the proxy call
          const action = opts.path.join(".") as PolicysetActions<TPolicyset>;
          const inputs = opts.args as InferPolicyInputs<
            GetPolicyByAction<TPolicyset, typeof action>
          >;

          // Setup and return the KilpiPolicy instance
          const policy = new KilpiPolicy({ core: Core, action, inputs });
          return policy;
        },
        [String(prop)],
      );
    },
  }) as FluentPolicyProxyApi<typeof Core, TPolicyset> & typeof CoreWithPlugins;
}
