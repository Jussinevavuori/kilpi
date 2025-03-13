import type {
  GetRuleByKey,
  InferRuleInputs,
  KilpiCore,
  RulesetKeysWithoutResource,
  RulesetKeysWithResource,
} from "@kilpi/core";
import React, { Suspense } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type CreateReactServerComponentOptions = {
  DefaultUnauthorizedComponent?: React.ReactNode;
  DefaultLoadingComponent?: React.ReactNode;
};

/**
 * Base access props, always present, not-depending on key
 */
type AccessBaseProps = {
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
  Unauthorized?: React.ReactNode;

  /**
   * onUnauthorized callback, e.g. for redirecting
   */
  onUnauthorized?: () => void;
};

type AccessPropsByKey<TCore extends KilpiCore<any, any>> = {
  // No inputs, no on={...} provided
  [K in RulesetKeysWithoutResource<TCore["rules"]>]: {
    to: K;
    on?: never;
  };
} & {
  // One input: on={arg}
  [K in RulesetKeysWithResource<TCore["rules"]>]: {
    to: K;
    on: InferRuleInputs<GetRuleByKey<TCore["rules"], K>>[0];
  };
};

/**
 * Access props
 */
type AccessProps<
  TCore extends KilpiCore<any, any>,
  TKey extends RulesetKeysWithoutResource<TCore["rules"]> | RulesetKeysWithResource<TCore["rules"]>,
> = AccessBaseProps & AccessPropsByKey<TCore>[TKey];

/**
 * Create all React server components for Kilpi usage on React Server.
 */
export function createKilpiReactServerComponents<TCore extends KilpiCore<any, any>>(
  KilpiCore: TCore,
  options: CreateReactServerComponentOptions,
) {
  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function Access<
    TKey extends
      | RulesetKeysWithoutResource<TCore["rules"]>
      | RulesetKeysWithResource<TCore["rules"]>,
  >(props: AccessProps<TCore, TKey>) {
    // Async component for suspending by parnent
    async function Access_InnerSuspendable() {
      // Get permission
      const permission = await KilpiCore.getPermission(props.to, props.on);

      // No permission, render Unauthorized component and run callback
      if (!permission.granted) {
        await props.onUnauthorized?.();
        return props.Unauthorized === null
          ? null
          : (props.Unauthorized ?? options.DefaultUnauthorizedComponent);
      }

      // Permission granted
      return props.children;
    }

    // Implementation is in suspendable component, the parent facade component only handles
    // type overloads and the loading fallback for the suspense.
    return (
      <Suspense
        fallback={
          props.Loading === null ? null : (props.Loading ?? options.DefaultLoadingComponent)
        }
      >
        <Access_InnerSuspendable />
      </Suspense>
    );
  }

  // Return all components
  return { Access };
}
