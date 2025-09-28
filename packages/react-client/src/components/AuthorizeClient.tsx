import type { Decision } from "@kilpi/core";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The <Authorize /> component renders either children, Unauthorized or Pending
 * based on the state of an authorization decision.
 */
export type AuthorizeProps<TDecision extends Decision<any>> = {
  /**
   * The decision to base the authorization on.
   */
  decision: TDecision | Promise<TDecision>;

  /**
   * Children that are rendered when the caller is authorized. May be a dynamic function
   * that depends on the decision.
   */
  children?:
    | React.ReactNode
    | ((decision: Extract<TDecision, { granted: true }>) => React.ReactNode);

  /**
   * Children that are rendered when the caller is not authorized. May be a dynamic function
   * that depends on the decision.
   */
  Unauthorized?:
    | React.ReactNode
    | ((decision: Extract<TDecision, { granted: false }>) => React.ReactNode);

  /**
   * Children that are rendered while the authorization decision is pending.
   */
  Pending?: React.ReactNode;
};

/**
 * Factory function for the <Authorize /> component.
 */
export function create_Authorize() {
  /**
   * The inner implementation which is rendered within a suspense boundary by the main component.
   */
  async function Authorize_Inner<TDecision extends Decision<any>>({
    decision: decisionPromise,
    children,
    Unauthorized,
  }: AuthorizeProps<TDecision>) {
    // Note: For some reason, TS is not able to narrow the type of decision according to the
    // union discriminator "granted", so we need to use type assertions below.

    // Await the decision
    const decision = await decisionPromise;

    // Not authorized
    if (decision.granted === false) {
      return typeof Unauthorized === "function"
        ? Unauthorized(decision as Extract<TDecision, { granted: false }>)
        : Unauthorized;
    }

    // Authorized: render children
    return typeof children === "function"
      ? children(decision as Extract<TDecision, { granted: true }>)
      : children;
  }

  /**
   * The <Authorize /> component is used for conditionally rendering children based on
   * an authorization decision. It supports Pending and Unauthorized states.
   */
  return async function Authorize<TDecision extends Decision<any>>(
    props: AuthorizeProps<TDecision>,
  ) {
    return <Authorize_Inner {...props} />;
  };
}
