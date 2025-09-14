import type {
  GetPolicyByAction,
  InferPolicyInputs,
  KilpiCore,
  PolicysetActions,
  PolicysetActionsWithObject,
  PolicysetActionsWithoutObject,
} from "@kilpi/core";
import { Suspense } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Base access props, always present, not-depending on the action
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
};

/**
 * Custom access props for each action to ensure correct types (e.g. for object) are provided
 * based on the provided action (`to`).
 */
type AccessPropsByAction<TCore extends KilpiCore<any, any>> = {
  // Policies that do not take in an object:
  // Type as { to: "some:action" }, no object required
  [K in PolicysetActionsWithoutObject<TCore["policies"]>]: {
    to: K;
    on?: never;
  };
} & {
  // Policies that do take in an object:
  // Type as { to: "some:action", on: object }, object required
  [K in PolicysetActionsWithObject<TCore["policies"]>]: {
    to: K;
    on: InferPolicyInputs<GetPolicyByAction<TCore["policies"], K>>[0];
  };
};

/**
 * Access props, with correct types based on the provided action (`to`).
 */
type AccessProps<
  TCore extends KilpiCore<any, any>,
  TAction extends PolicysetActions<TCore["policies"]>,
> = AccessBaseProps & AccessPropsByAction<TCore>[TAction];

/**
 * Create the <Access /> react server component.
 */
export function create_Access<TCore extends KilpiCore<any, any>>(KilpiCore: TCore) {
  /**
   * Render children only if access to={action} (and optionally on={object}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function Access<
    TAction extends
      | PolicysetActionsWithoutObject<TCore["policies"]>
      | PolicysetActionsWithObject<TCore["policies"]>,
  >(props: AccessProps<TCore, TAction>) {
    // Inner async component to be suspended by parent
    async function Access_InnerSuspendable() {
      // Get decision
      const decision = await KilpiCore.getAuthorizationDecision(props.to, props.on);

      // No decision, render Unauthorized component
      if (!decision.granted) return props.Unauthorized;

      // Authorization passed, render children
      return props.children;
    }

    // Implementation is in suspendable component, the parent facade component only handles
    // type overloads and the loading fallback for the suspense.
    return (
      <Suspense fallback={props.Loading}>
        <Access_InnerSuspendable />
      </Suspense>
    );
  }

  // Return all components
  return Access;
}
