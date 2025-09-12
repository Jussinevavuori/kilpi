"use client";

import type { KilpiClient } from "@kilpi/client";
import type {
  AnyKilpiCore,
  GetPolicyByAction,
  InferPolicyInputs,
  PolicySetActionsWithoutObject,
  PolicysetActionsWithObject,
} from "@kilpi/core";
import { createUseIsAuthorized } from "src/hooks/useIsAuthorized";

/**
 * Base access props, always present, not-depending on the action
 */
type ClientAccessBaseProps = {
  /**
   * Rendered when access is granted.
   */
  children?: React.ReactNode;

  /**
   * Fallback component while loading.
   */
  Loading?: React.ReactNode;

  /**
   * Fallback component if unauthorized.
   */
  Unauthorized?: React.ReactNode;

  /**
   * Fallback component if error.
   */
  Error?: React.ReactNode;
};

/**
 * Custom access props for each action to ensure correct types (e.g. for object) are provided
 * based on the provided action (`to`).
 */
type ClientAccessPropsByAction<TCore extends AnyKilpiCore> = {
  // Policies that do not take in an object:
  // Type as { to: "policy:action" }, no object required
  [TAction in PolicySetActionsWithoutObject<TCore["policies"]>]: {
    to: TAction;
    on?: never;
  };
} & {
  // Policies that do take in an object:
  // Type as { to: "policy:action", on: object }, object required
  [TAction in PolicysetActionsWithObject<TCore["policies"]>]: {
    to: TAction;
    on: InferPolicyInputs<GetPolicyByAction<TCore["policies"], TAction>>[0];
  };
};

/**
 * Access props, with correct types based on the provided action (`to`).
 */
type ClientAccessProps<
  TCore extends AnyKilpiCore,
  TAction extends
    | PolicySetActionsWithoutObject<TCore["policies"]>
    | PolicysetActionsWithObject<TCore["policies"]>,
> = ClientAccessBaseProps & ClientAccessPropsByAction<TCore>[TAction];

/**
 * Create the <ClientAccess /> react client component.
 */
export function createClientAccess<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
  // Hook to fetch authorizations
  const useIsAuthorized = createUseIsAuthorized(KilpiClient);

  /**
   * Render children only if access to={action} (and optionally on={object}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function ClientAccess<
    TAction extends
      | PolicySetActionsWithoutObject<T["policies"]>
      | PolicysetActionsWithObject<T["policies"]>,
  >(props: ClientAccessProps<T, TAction>) {
    // Get data via hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = useIsAuthorized<TAction>(props.to as any, ...([props.on] as any));

    // Render correct component based on query status
    switch (query.status) {
      case "error":
        return props.Error ?? null;
      case "loading":
      case "idle":
        return props.Loading ?? null;
      case "success":
        if (query.isAuthorized) return props.children;
        return props.Unauthorized ?? null;
    }
  }

  // Return all components
  return ClientAccess;
}
