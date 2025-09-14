"use client";

import type { KilpiClient } from "@kilpi/client";
import type {
  AnyKilpiCore,
  GetPolicyByAction,
  InferPolicyInputs,
  PolicysetActionsWithoutObject,
  PolicysetActionsWithObject,
} from "@kilpi/core";
import type { create_useIsAuthorized } from "../hooks/useIsAuthorized";

/**
  type* Base access props, always present, not-depending on the action
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
  [TAction in PolicysetActionsWithoutObject<TCore["policies"]>]: {
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
    | PolicysetActionsWithoutObject<TCore["policies"]>
    | PolicysetActionsWithObject<TCore["policies"]>,
> = ClientAccessBaseProps & ClientAccessPropsByAction<TCore>[TAction];

/**
 * Create the <ClientAccess /> react client component.
 */
export function create_ClientAccess<T extends AnyKilpiCore>(
  KilpiClient: KilpiClient<T>,
  useIsAuthorized: ReturnType<typeof create_useIsAuthorized<T>>,
) {
  void KilpiClient; // Unused

  /**
   * Render children only if access to={action} (and optionally on={object}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  return function ClientAccess<
    TAction extends
      | PolicysetActionsWithoutObject<T["policies"]>
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
      default:
        return null;
    }
  };
}
