"use client";

import { useEffect, useState } from "react";
import type { KilpiClientInstance } from "../client/client.index";
import { InferRuleResource, InferRuleSubjectNarrowed } from "../lib/rule";
import { GetRuleByKey, Ruleset, RulesetKeys } from "../lib/ruleset";

export type CreateKilpiReactClientOptions = {
  defaultComponents?: {
    Loading?: React.ReactNode;
    Denied?: React.ReactNode;
    Error?: React.ReactNode;
  };
};

export type UsePermissionOptions<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TKey extends RulesetKeys<TRuleset>
> = {
  to: TKey;
  on: InferRuleResource<GetRuleByKey<TRuleset, TKey>>;
};

export type UsePermissionReturn<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TKey extends RulesetKeys<TRuleset>
> =
  | { status: "loading" }
  | { status: "denied"; message?: string }
  | { status: "error" }
  | {
      status: "granted";
      subject: InferRuleSubjectNarrowed<GetRuleByKey<TRuleset, TKey>>;
    };

export type UseSubjectReturn<TSubject> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; subject: TSubject };

export type WithPermissionProps<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TKey extends RulesetKeys<TRuleset>
> = {
  children?: (permission: UsePermissionReturn<TSubject, TRuleset, TKey>) => React.ReactNode;
} & UsePermissionOptions<TSubject, TRuleset, TKey>;

export type HasPermissionProps<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TKey extends RulesetKeys<TRuleset>
> = {
  children?: React.ReactNode;
  Loading?: React.ReactNode;
  Denied?: React.ReactNode;
  Error?: React.ReactNode;
} & UsePermissionOptions<TSubject, TRuleset, TKey>;

export function createKilpiReactClient<TSubject, const TRuleset extends Ruleset<TSubject>>(
  KilpiClient: KilpiClientInstance<TSubject, TRuleset, any>,
  globalOptions: CreateKilpiReactClientOptions = {}
) {
  /**
   * Signal that gets a new value each time the `KilpiClient.invalidate` function is called. Used as
   * a dependency in `useEffect` to trigger re-fetching of data.
   */
  function useInvalidationSignal() {
    const [signal, setSignal] = useState(0);
    useEffect(() => KilpiClient.onInvalidate(() => setSignal((_) => _ + 1)), [setSignal]);
    return signal;
  }

  /**
   * Access permission to rule by its key given a resource.
   */
  function usePermission<TKey extends RulesetKeys<TRuleset>>(
    options: UsePermissionOptions<TSubject, TRuleset, TKey>
  ): UsePermissionReturn<TSubject, TRuleset, TKey> {
    const invalidationSignal = useInvalidationSignal();

    const [permission, setPermission] = useState<UsePermissionReturn<TSubject, TRuleset, TKey>>({
      status: "loading",
    });

    useEffect(() => {
      setPermission({ status: "loading" });

      KilpiClient.getPermission(options.to, options.on)
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
    }, [options.to, options.on, setPermission, invalidationSignal]);

    return permission;
  }

  /**
   * Access subject
   */
  function useSubject(): UseSubjectReturn<TSubject> {
    const invalidationSignal = useInvalidationSignal();

    const [subject, setSubject] = useState<UseSubjectReturn<TSubject>>({ status: "loading" });

    useEffect(() => {
      KilpiClient.getSubject()
        .then((subject) => {
          setSubject({ status: "success", subject });
        })
        .catch((error) => {
          console.error(error);
          setSubject({ status: "error" });
        });
    }, [setSubject, invalidationSignal]);

    return subject;
  }

  /**
   * Renders `children` if permission is granted, `Denied` if denied, and `Loading` if loading.
   * `Denied` and `Loading` default to `undefined` (or the given global `Denied` and `Loading`
   * components if specified -- you can opt out of global defaults by providing `null`)
   */
  function HasPermission<TKey extends RulesetKeys<TRuleset>>(
    props: HasPermissionProps<TSubject, TRuleset, TKey>
  ) {
    // Default components shorthand
    const DefComps = globalOptions.defaultComponents;

    // Access permission
    const permission = usePermission({
      to: props.to,
      on: props.on,
    });

    switch (permission.status) {
      case "denied":
        return props.Denied === null ? null : props.Denied || DefComps?.Denied;
      case "error":
        return props.Error === null ? null : props.Error || DefComps?.Error;
      case "loading":
        return props.Loading === null ? null : props.Loading || DefComps?.Loading;
      case "granted":
        return props.children;
    }
  }

  /**
   * Provide a render function that is given the permission as a prop.
   */
  function WithPermission<TKey extends RulesetKeys<TRuleset>>(
    props: WithPermissionProps<TSubject, TRuleset, TKey>
  ) {
    const permission = usePermission({
      to: props.to,
      on: props.on,
    });

    return props.children?.(permission);
  }

  return {
    useSubject,
    usePermission,
    HasPermission,
    WithPermission,
  };
}
