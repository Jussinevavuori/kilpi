import React, { Suspense } from "react";
import { InferRuleResource } from "../lib/rule";
import { GetRuleByKey, Ruleset, RulesetKeys } from "../lib/ruleset";
import { KilpiServerInstance } from "../server/server.index";

export type CreateKilpiReactServerOptions = {
  defaultComponents?: {
    Loading?: React.ReactNode;
    Denied?: React.ReactNode;
  };
};

type AccessProps<
  TSubject,
  TRuleset extends Ruleset<TSubject>,
  TKey extends RulesetKeys<TRuleset>
> = {
  to: TKey;
  on?: InferRuleResource<GetRuleByKey<TRuleset, TKey>>;
  suspense?: boolean;
  children?: React.ReactNode;
  Loading?: React.ReactNode;
  Denied?: React.ReactNode;
};

export function createKilpiReactServer<TSubject, const TRuleset extends Ruleset<TSubject>>(
  Kilpi: KilpiServerInstance<TSubject, TRuleset, any>,
  globalOptions: CreateKilpiReactServerOptions = {}
) {
  /**
   * Inner access implementation. Seperate component for suspendability.
   */
  async function AccessInner<TKey extends RulesetKeys<TRuleset>>(
    props: AccessProps<TSubject, TRuleset, TKey>
  ) {
    // Get permission
    const permission = await Kilpi.getPermission(props.to, props.on);

    // Granted
    if (permission.granted) return props.children;

    // Denied
    return props.Denied === null ? null : props.Denied || globalOptions.defaultComponents?.Denied;
  }

  /**
   * Shield children components from rendering until permission is granted. If denied, renders
   * the `Denied` component (defaults to global Denied component unless `null` provided).
   *
   * Suspend with `suspense` prop and `Loading` component (defaults to global Loading component
   * unless `null` provided).
   */
  function AccessOuter<TKey extends RulesetKeys<TRuleset>>(
    props: AccessProps<TSubject, TRuleset, TKey>
  ) {
    const Loading =
      props.Loading === null ? null : props.Loading || globalOptions.defaultComponents?.Loading;

    /**
     * Wrap with suspense
     */
    if (props.suspense) {
      return (
        <Suspense fallback={Loading}>
          <AccessInner {...props} />
        </Suspense>
      );
    }

    /**
     * No suspense, return as is -- possible suspense has to be separately handled.
     */
    return <AccessInner {...props} />;
  }

  return {
    Access: AccessOuter,
  };
}
