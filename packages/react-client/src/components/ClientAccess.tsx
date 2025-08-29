"use client";

import type { KilpiClient } from "@kilpi/client";
import type {
  AnyKilpiCore,
  GetPolicyByKey,
  InferPolicyInputs,
  PolicySetKeysWithoutObject,
  PolicysetKeysWithObject,
} from "@kilpi/core";
import { createUseIsAuthorized } from "src/hooks/useIsAuthorized";

/**
 * Base access props, always present, not-depending on key
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
 * Custom access props for each key to ensure correct types (e.g. for object) are provided
 * based on the provided policy key (`to`).
 */
type ClientAccessPropsByKey<TCore extends AnyKilpiCore> = {
  // Policies that do not take in an object:
  // Type as { to: "policy:key" }, no object required
  [K in PolicySetKeysWithoutObject<TCore["policies"]>]: {
    to: K;
    on?: never;
  };
} & {
  // Policies that do take in an object:
  // Type as { to: "policy:key", on: object }, object required
  [K in PolicysetKeysWithObject<TCore["policies"]>]: {
    to: K;
    on: InferPolicyInputs<GetPolicyByKey<TCore["policies"], K>>[0];
  };
};

/**
 * Access props, with correct types based on the provided policy key (`to`).
 */
type ClientAccessProps<
  TCore extends AnyKilpiCore,
  TKey extends
    | PolicySetKeysWithoutObject<TCore["policies"]>
    | PolicysetKeysWithObject<TCore["policies"]>,
> = ClientAccessBaseProps & ClientAccessPropsByKey<TCore>[TKey];

/**
 * Create the <ClientAccess /> react client component.
 */
export function createClientAccess<T extends AnyKilpiCore>(KilpiClient: KilpiClient<T>) {
  // Hook to fetch authorizations
  const useIsAuthorized = createUseIsAuthorized(KilpiClient);

  /**
   * Render children only if access to={key} (and optionally on={object}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function ClientAccess<
    TKey extends PolicySetKeysWithoutObject<T["policies"]> | PolicysetKeysWithObject<T["policies"]>,
  >(props: ClientAccessProps<T, TKey>) {
    // Get data via hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = useIsAuthorized<TKey>(props.to as any, ...([props.to, props.on] as any));

    // Render correct component based on query status
    switch (query.status) {
      case "error":
        return props.Error ?? null;
      case "loading":
      case "idle":
        return props.Loading ?? null;
      case "success":
        return props.children;
    }
  }

  // Return all components
  return ClientAccess;
}
