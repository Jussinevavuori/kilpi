import { createPlugin, FinePlugin } from "../lib/create-plugin";
import { initializeRules } from "../lib/rule";
import { Ruleset } from "../lib/ruleset";
import { setupCreateQuery } from "./setup-create-query";
import { setupEndpoint } from "./setup-endpoint";
import { setupProtectors } from "./setup-protectors";

export { createRuleset } from "./create-ruleset";

/**
 * Create a server client.
 */
export function createClient<
  TSubject,
  const TRuleset extends Ruleset<TSubject>,
  TPlugin extends ReturnType<typeof createPlugin>
>({
  getSubject,
  rules,
  plugins,
}: {
  getSubject: () => Promise<TSubject>;
  rules: TRuleset | ((Rule: ReturnType<typeof initializeRules<TSubject>>) => TRuleset);
  plugins?: TPlugin[];
}) {
  /**
   * Setup rules with Rule client.
   */
  const ruleset = typeof rules === "function" ? rules(initializeRules<TSubject>()) : rules;

  /**
   * Setup endpoint.
   */
  const createEndpoint = setupEndpoint({ getSubject, ruleset });

  /**
   * Setup protector
   */
  const { getPermission, hasPermission, protect } = setupProtectors(getSubject, ruleset);

  /**
   * Setup query creator
   */
  const createQuery = setupCreateQuery({ plugins });

  /**
   * Plugin that is used to store `onProtect`
   */
  const onProtectStorage = plugins?.find((_) => !!_.onProtect)?.onProtect!;

  /**
   * On protect functionality. Important: If no plugin defines a per-request storage for the
   * `onProtect` function, this is a no-op as the function is not stored for later usage. It will
   * not be stored globally as it should never be shared across requests.
   */
  function onProtect(onProtectFn: () => never) {
    if (!onProtectStorage) return;
    onProtectStorage.set(onProtectFn);
  }

  /**
   * Return client with all functionalities.
   */
  return {
    // Features
    createQuery,
    getSubject,
    ruleset,
    createEndpoint,
    getPermission,
    hasPermission,
    protect,
    onProtect,

    // Apply plugin interfaces
    ...(Object.values(plugins ?? []).reduce<Record<string, any>>((interfaces, plugin) => {
      interfaces[plugin.pluginName] = plugin.interface;
      return interfaces;
    }, {}) as {
      [Key in TPlugin["pluginName"]]: (TPlugin & { pluginName: Key })["interface"];
    }),

    // Type inference utilities
    $$types: {} as {
      subject: TSubject;
      ruleset: TRuleset;
      plugins: TPlugin;
    },
  };
}

export type FineServerInstance<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TPlugin extends FinePlugin
> = ReturnType<typeof createClient<TSubject, TRuleset, TPlugin>>;

export const FineServer = {
  createClient,
};
