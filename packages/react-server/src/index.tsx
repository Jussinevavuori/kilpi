import type {
  GetPolicyByKey,
  InferPolicyInputs,
  KilpiCore,
  PolicySetKeysWithoutResource,
  PolicysetKeysWithResource,
} from "@kilpi/core";
import React, { Suspense } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Options for creating React server components.
 */
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
   * If null, no loading component is rendered (opts out of global default as well).
   */
  Loading?: React.ReactNode;

  /**
   * Rendered if access is denied. If undefined, defaults to global default if exists.
   * If null, no denied component is rendered (opts out of global default as well).
   */
  Unauthorized?: React.ReactNode;

  /**
   * onUnauthorized callback, e.g. for redirecting.
   */
  onUnauthorized?: () => void;
};

/**
 * Custom access props for each key to ensure correct types (e.g. for resource) are provided
 * based on the provided policy key (`to`).
 */
type AccessPropsByKey<TCore extends KilpiCore<any, any>> = {
  // Policies that do not take in a resource:
  // Type as { to: "policy:key" }, no resource required
  [K in PolicySetKeysWithoutResource<TCore["policies"]>]: {
    to: K;
    on?: never;
  };
} & {
  // Policies that do take in a resource:
  // Type as { to: "policy:key", on: resource }, resource required
  [K in PolicysetKeysWithResource<TCore["policies"]>]: {
    to: K;
    on: InferPolicyInputs<GetPolicyByKey<TCore["policies"], K>>[0];
  };
};

/**
 * Access props, with correct types based on the provided policy key (`to`).
 */
type AccessProps<
  TCore extends KilpiCore<any, any>,
  TKey extends
    | PolicySetKeysWithoutResource<TCore["policies"]>
    | PolicysetKeysWithResource<TCore["policies"]>,
> = AccessBaseProps & AccessPropsByKey<TCore>[TKey];

/**
 * Create all React server components for Kilpi usage in RSCs.
 */
export function createKilpiReactServerComponents<
  TCore extends KilpiCore<any, any>,
>(KilpiCore: TCore, options: CreateReactServerComponentOptions) {
  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function Access<
    TKey extends
      | PolicySetKeysWithoutResource<TCore["policies"]>
      | PolicysetKeysWithResource<TCore["policies"]>,
  >(props: AccessProps<TCore, TKey>) {
    // Async component for suspending by parnent
    async function Access_InnerSuspendable() {
      // Get authorization
      const authorization = await KilpiCore.getAuthorization(
        props.to,
        props.on,
      );

      // No authorization, render Unauthorized component and run callback
      if (!authorization.granted) {
        await props.onUnauthorized?.();
        return props.Unauthorized === null
          ? null
          : (props.Unauthorized ?? options.DefaultUnauthorizedComponent);
      }

      // Authorization passed
      return props.children;
    }

    // Implementation is in suspendable component, the parent facade component only handles
    // type overloads and the loading fallback for the suspense.
    return (
      <Suspense
        fallback={
          props.Loading === null
            ? null
            : (props.Loading ?? options.DefaultLoadingComponent)
        }
      >
        <Access_InnerSuspendable />
      </Suspense>
    );
  }

  // Return all components
  return { Access };
}
