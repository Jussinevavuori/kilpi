import React, { Suspense } from "react";

import { GetRuleByKey, InferRuleResource, RulesetKeys } from "@kilpi/client";
import { KilpiCore } from "@kilpi/core";

export type CreateReactServerComponentOptions = {
  DefaultDeniedComponent?: React.ReactNode;
  DefaultLoadingComponent?: React.ReactNode;
};

/**
 * Access props
 */
export type AccessProps<
  TCore extends KilpiCore<any, any, any>,
  TKey extends RulesetKeys<TCore["ruleset"]>
> = {
  /**
   * Rule key to access.
   */
  key: TKey;

  /**
   * Resource to provide to rule. Pass undefined / null if no resource is needed.
   */
  resource: InferRuleResource<GetRuleByKey<TCore["ruleset"], TKey>>;

  /**
   * Rendered when access is granted.
   */
  children?: React.ReactNode;

  /**
   * Rendered while suspended. If undefined, defaults to global default if exists.
   * If null, no loading component is rendered.
   */
  Loading?: React.ReactNode;

  /**
   * Rendered if access is denied. If undefined, defaults to global default if exists.
   * If null, no denied component is rendered.
   */
  Denied?: React.ReactNode;
};

/**
 * Create all React server components for Kilpi usage on React Server.
 */
export function createKilpiReactServerComponents<TCore extends KilpiCore<any, any, any>>(
  KilpiCore: TCore,
  options: CreateReactServerComponentOptions
) {
  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function Access<TKey extends RulesetKeys<TCore["ruleset"]>>(props: AccessProps<TCore, TKey>) {
    // Async component for suspending by parnent
    async function SuspendableImplementation() {
      // Get permission
      const permission = await KilpiCore.getPermission(props.key, props.resource);

      // No permission, render Denied component
      if (!permission.granted) {
        return props.Denied === null ? null : props.Denied ?? options.DefaultDeniedComponent;
      }

      // Permission granted
      return props.children;
    }

    // Implementation is in suspendable component, the parent facade component only handles
    // type overloads and the loading fallback for the suspense.
    return (
      <Suspense
        fallback={props.Loading === null ? null : props.Loading ?? options.DefaultLoadingComponent}
      >
        <SuspendableImplementation />
      </Suspense>
    );
  }

  // Return all components
  return { Access };
}
