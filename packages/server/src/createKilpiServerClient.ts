import { KilpiCore, OnDenyHandler } from "@kilpi/core";
import { GetSetStorage } from "./types";

/**
 * Server client construction options
 */
export type CreateKilpiServerClientOptions = {
  /**
   * Customize `.protect()` behaviour by providing a global `.onDeny` function. You can also provide
   * a storage with get and set methods. Using a per-request storage is recommended.
   */
  onDeny?: OnDenyHandler | GetSetStorage<OnDenyHandler | undefined>;
};

/**
 * Type of server client
 */
export type KilpiServerClient<TCore extends KilpiCore<any, any, any>> = ReturnType<
  typeof createKilpiServerClient<TCore>
>;

/**
 * Create a server client.
 */
export function createKilpiServerClient<TCore extends KilpiCore<any, any, any>>(
  core: TCore,
  options: CreateKilpiServerClientOptions
) {
  // Set on deny function if a get-set storage is provided. Otherwise this function is a no-op.
  function onDeny(onDenyHandler: OnDenyHandler | undefined) {
    if (typeof options.onDeny === "object") {
      options.onDeny.set(onDenyHandler);
    }
  }

  // Client
  return {
    // Exposed APIs from core
    guard: core.guard,
    getSubject: core.getSubject,
    getPermission: core.getPermission,
    hasPermission: core.hasPermission,
    protect: core.protect,
    createProtectedQuery: core.createProtectedQuery,
    createPostEndpoint: core.createPostEndpoint,

    // Custom APIs
    onDeny,

    // Expose core, not intended for direct use
    core,
  };
}
