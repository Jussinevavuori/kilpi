/**
 * Create plugin with this function. The available options are all the parts that plugins are
 * allowed to touch.
 */
export function createPlugin<const TPluginName extends string, TInterface>(plugin: {
  /**
   * Plugin name as const. Used as key for interface if defined.
   */
  pluginName: TPluginName;

  /**
   * On protect storage. Required to be defined by a plugin. Intended to be stored per-request,
   * for example with `React.cache` or similar.
   */
  onProtect?: {
    set: (onProtect: () => never) => void;
    get: () => undefined | (() => never);
  };

  /**
   * Wrap protected queries. Must not touch `type`. Intended for e.g. caching queries per-request
   * (see e.g. React.cache).
   */
  wrapProtectedQuery?: <TQuery extends (...args: any[]) => any>(query: TQuery) => TQuery;

  /**
   * Interface to use. Accessibe via `Kilpi.{pluginName}.{methodName}...`.
   */
  interface: TInterface;
}) {
  return plugin;
}

export type KilpiPlugin = ReturnType<typeof createPlugin>;
