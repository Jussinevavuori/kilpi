import type {
  AnyKilpiCore,
  DeniedDecision,
  GrantedDecision,
  KilpiPolicy,
  PolicysetActions,
} from "@kilpi/core";
import { Suspense } from "react";

/**
 * The <Authorize /> component renders either children, Unauthorized or Pending
 * based on the state of an authorization decision.
 */
export type AuthorizeProps<
  TCore extends AnyKilpiCore,
  TPolicy extends KilpiPolicy<TCore, TCore["$$infer"]["policies"]>,
> = {
  /**
   * The policy to base the authorization on.
   */
  policy: TPolicy;

  /**
   * Children that are rendered when the caller is authorized. May be a dynamic function
   * that depends on the decision.
   */
  children?:
    | React.ReactNode
    | ((decision: GrantedDecision<TCore["$$infer"]["subject"]>) => React.ReactNode);

  /**
   * Children that are rendered when the caller is not authorized. May be a dynamic function
   * that depends on the decision.
   */
  Unauthorized?: React.ReactNode | ((decision: DeniedDecision) => React.ReactNode);

  /**
   * Children that are rendered while the authorization decision is pending.
   */
  Pending?: React.ReactNode;
};

/**
 * Factory function for the <Authorize /> component.
 */
export function create_Authorize<TCore extends AnyKilpiCore>(core: TCore) {
  void core;

  /**
   * The inner implementation which is rendered within a suspense boundary by the main component.
   */
  async function Authorize_Inner<
    TAction extends PolicysetActions<TCore["$$infer"]["policies"]>,
    TPolicy extends KilpiPolicy<TCore, TAction>,
  >({ policy, children, Unauthorized }: AuthorizeProps<TCore, TPolicy>) {
    // Authorize and await  the decision
    const decision = await policy.authorize();

    // Not authorized
    if (decision.granted === false) {
      return typeof Unauthorized === "function" ? Unauthorized(decision) : Unauthorized;
    }

    // Authorized: render children
    return typeof children === "function" ? children(decision) : children;
  }

  /**
   * The <Authorize /> component is used for conditionally rendering children based on
   * an authorization decision. It supports Pending and Unauthorized states.
   */
  return async function Authorize<
    TAction extends PolicysetActions<TCore["$$infer"]["policies"]>,
    TPolicy extends KilpiPolicy<TCore, TAction>,
  >(props: AuthorizeProps<TCore, TPolicy>) {
    return (
      <Suspense fallback={props.Pending || null}>
        <Authorize_Inner {...props} />
      </Suspense>
    );
  };
}
