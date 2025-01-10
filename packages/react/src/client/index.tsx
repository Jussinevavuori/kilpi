import React from "react";

import {
  AnyKilpiClientSideClient,
  GetRuleByKey,
  InferRuleGuardedSubject,
  InferRuleResource,
  RulesetKeys,
} from "@kilpi/client";
import { useEffect, useState } from "react";

export type CreateReactClientSideComponentOptions = {
  DefaultErrorComponent?: React.ReactNode;
  DefaultDeniedComponent?: React.ReactNode;
  DefaultLoadingComponent?: React.ReactNode;
};

export type UseSubjectReturn<TClient extends AnyKilpiClientSideClient> =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "success";
      subject: TClient["$$infer"]["subject"];
    };

export type UsePermissionReturn<
  TClient extends AnyKilpiClientSideClient,
  TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
> =
  | { status: "loading" }
  | { status: "denied"; message?: string }
  | { status: "error" }
  | {
      status: "granted";
      subject: InferRuleGuardedSubject<GetRuleByKey<TClient["$$infer"]["ruleset"], TKey>>;
    };

/**
 * Has permission props
 */
export type WithPermissionProps<
  TClient extends AnyKilpiClientSideClient,
  TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
> = {
  /**
   * Rule key to access.
   */
  key: TKey;

  /**
   * Resource to provide to rule. Pass undefined / null if no resource is needed.
   */
  resource: InferRuleResource<GetRuleByKey<TClient["$$infer"]["ruleset"], TKey>>;

  /**
   * Render based on dynamic render prop function with access as argument.
   */
  children?: (permission: UsePermissionReturn<TClient, TKey>) => React.ReactNode;
};

/**
 * Has permission props
 */
export type HasPermissionProps<
  TClient extends AnyKilpiClientSideClient,
  TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
> = {
  /**
   * Rule key to access.
   */
  key: TKey;

  /**
   * Resource to provide to rule. Pass undefined / null if no resource is needed.
   */
  resource: InferRuleResource<GetRuleByKey<TClient["$$infer"]["ruleset"], TKey>>;

  /**
   * Rendered when access is granted.
   */
  children?: React.ReactNode;

  /**
   * Rendered while fetching. If undefined, defaults to global default if exists.
   * If null, no loading component is rendered.
   */
  Loading?: React.ReactNode;

  /**
   * Rendered if access is denied. If undefined, defaults to global default if exists.
   * If null, no denied component is rendered.
   */
  Denied?: React.ReactNode;

  /**
   * Rendered if fetch errored. If undefined, defaults to global default if exists.
   * If null, no denied component is rendered.
   */
  Error?: React.ReactNode;
};

/**
 * Create all React client components for Kilpi usage on React in browser or SSR.
 */
export function createKilpiReactClientComponents<TClient extends AnyKilpiClientSideClient>(
  KilpiClient: TClient,
  options: CreateReactClientSideComponentOptions
) {
  /**
   * Use invalidation signal to trigger re-fetching of permissions when the `KilpiClient.invalidate`
   * function is called.
   */
  function useInvalidationSignal<TClient extends AnyKilpiClientSideClient>(KilpiClient: TClient) {
    const [signal, setSignal] = useState(0);
    useEffect(() => KilpiClient.onInvalidate(() => setSignal((_) => _ + 1)), [setSignal]);
    return signal;
  }

  /**
   * Fetch subject
   */
  function useSubject<TClient extends AnyKilpiClientSideClient>({
    KilpiClient,
  }: {
    KilpiClient: TClient;
  }): UseSubjectReturn<TClient> {
    const [subject, setSubject] = useState<UseSubjectReturn<TClient>>({
      status: "loading",
    });

    // Fetch permission (refetch on invalidation signal)
    useEffect(() => {
      KilpiClient.getSubject()
        .then((subject) => setSubject({ status: "success", subject }))
        .catch((error) => {
          console.error(error);
          setSubject({ status: "error" });
        });
    }, [KilpiClient, setSubject, useInvalidationSignal(KilpiClient)]);

    return subject;
  }

  /**
   * Fetch permission
   */
  function usePermission<
    TClient extends AnyKilpiClientSideClient,
    TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
  >(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<TClient["$$infer"]["ruleset"], TKey>>
  ): UsePermissionReturn<TClient, TKey> {
    const [permission, setPermission] = useState<UsePermissionReturn<TClient, TKey>>({
      status: "loading",
    });

    // Fetch permission (refetch on invalidation signal)
    useEffect(() => {
      KilpiClient.getPermission(key, resource)
        .then((result) => {
          if (result.granted) {
            setPermission({ status: "granted", subject: result.subject });
          } else {
            setPermission({ status: "denied" });
          }
        })
        .catch((error) => {
          console.error(error);
          setPermission({ status: "error" });
        });
    }, [KilpiClient, key, resource, setPermission, useInvalidationSignal(KilpiClient)]);

    return permission;
  }

  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function WithPermission<
    TClient extends AnyKilpiClientSideClient,
    TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
  >(props: WithPermissionProps<TClient, TKey>) {
    const permission = usePermission(props.key, props.resource);
    return props.children?.(permission);
  }

  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject. Supports Loading and Denied components for alternative UIs on suspense and denied
   * access.
   */
  function HasPermission<
    TClient extends AnyKilpiClientSideClient,
    TKey extends RulesetKeys<TClient["$$infer"]["ruleset"]>
  >(props: HasPermissionProps<TClient, TKey>) {
    const permission = usePermission(props.key, props.resource);

    switch (permission.status) {
      case "loading":
        return props.Loading === null ? null : props.Loading ?? options.DefaultLoadingComponent;
      case "denied":
        return props.Denied === null ? null : props.Denied ?? options.DefaultDeniedComponent;
      case "error":
        return props.Error === null ? null : props.Error ?? options.DefaultErrorComponent;
      case "granted":
        return props.children;
    }
  }

  return {
    WithPermission,
    HasPermission,
    useSubject,
    usePermission,
    useInvalidationSignal,
  };
}
