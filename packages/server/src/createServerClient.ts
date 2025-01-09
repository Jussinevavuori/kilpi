import { getRuleConstructors, OnDenyHandler, RuleConstructors, Ruleset } from "@kilpi/core";
import { GetSetStorage } from "./types";
import { wrapCreatePostEndpoint } from "./wrapCreatePostEndpoint";
import { wrapCreateQuery } from "./wrapCreateQuery";
import { wrapGetPermission } from "./wrapGetPermission";
import { wrapHasPermission } from "./wrapHasPermission";
import { wrapProtect } from "./wrapProtect";

/**
 * Server client construction options
 */
export type CreateKilpiServerClientOptions<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
> = {
  /**
   * The subject getter function. Should be as light-weight as possible and preferrably cached
   * per-request (e.g. in React with `React.cache`).
   */
  getSubject: () => Promise<TSubject>;

  /**
   * Ruleset to use. Can optionally be constructed here with a function that is given the rule
   * constructors.
   */
  rules: TRuleset | ((Rule: RuleConstructors<TSubject>) => TRuleset);

  /**
   * Customize `.protect()` behaviour by providing a global `.onDeny` function. You can also provide
   * a storage with get and set methods. Using a per-request storage is recommended.
   */
  onDeny?: OnDenyHandler | GetSetStorage<OnDenyHandler | undefined>;
};

/**
 * Type of server client
 */
export type KilpiServerClient<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
> = ReturnType<typeof createKilpiServerClient<TSubject, TRuleset>>;

/**
 * Create a server client.
 */
export function createKilpiServerClient<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>(options: CreateKilpiServerClientOptions<TSubject, TRuleset>) {
  // Get rules with rule constructor (or as provided)
  const ruleset =
    typeof options.rules === "function"
      ? options.rules(getRuleConstructors<TSubject>())
      : options.rules;

  // Wrapped APIs
  const protect = wrapProtect({ ...options, ruleset });
  const getPermission = wrapGetPermission({ ...options, ruleset });
  const hasPermission = wrapHasPermission({ ...options, ruleset });
  const createPostEndpoint = wrapCreatePostEndpoint({ ...options, ruleset });
  const createQuery = wrapCreateQuery({ ...options, ruleset });

  // Set on deny function if a get-set storage is provided. Otherwise this function is a no-op.
  function onDeny(onDenyHandler: OnDenyHandler | undefined) {
    if (typeof options.onDeny === "object") {
      options.onDeny.set(onDenyHandler);
    }
  }

  /**
   * Return client with all functionalities.
   */
  return {
    // API
    getSubject: options.getSubject,
    getPermission,
    hasPermission,
    protect,
    onDeny,
    createPostEndpoint,
    createQuery,

    // Pass-through types (not for runtime usage)
    $$types: {} as {
      subject: TSubject;
      ruleset: TRuleset;
    },
  };
}
