import { GetRuleByKey, InferRuleResource, Ruleset, RulesetKeys } from "@kilpi/core";
import { KilpiServerClient } from "@kilpi/server";
import React, { Suspense } from "react";
import { CreateReactServerComponentOptions } from "./types";

export function createAccessComponent<
  TSubject extends object | undefined | null,
  TRuleset extends Ruleset<TSubject>
>(Kilpi: KilpiServerClient<TSubject, TRuleset>, options: CreateReactServerComponentOptions) {
  type AccessPropsBase = {
    children?: React.ReactNode;
    Loading?: React.ReactNode;
    Denied?: React.ReactNode;
  };

  /**
   * Base access props
   */
  type AccessProps<TRulekey extends RulesetKeys<TRuleset>> = AccessPropsBase &
    {
      [Key in RulesetKeys<TRuleset>]: InferRuleResource<GetRuleByKey<TRuleset, Key>>;
    }[TRulekey];

  /**
   * Render children only if access to={key} (and optionally on={resource}) granted to current
   * subject.
   *
   * On deny, render Denied component (or global default unless opted out with `null`).
   * On load, render Loading component (or global default unless opted out with `null`).
   */

  function Access<TRulekey extends RulesetKeys<TRuleset>>(props: AccessProps<TRulekey>) {
    // Async component for suspending by parnent
    async function SuspendableImplementatin() {
      // Get permission
      const permission = await Kilpi.getPermission(props.to, props.on);

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
        <SuspendableImplementatin />
      </Suspense>
    );
  }

  // Return component
  return Access;
}
