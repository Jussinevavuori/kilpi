import type { AnyKilpiClient, KilpiClientPolicy } from "@kilpi/client";
import type { PolicysetActions } from "@kilpi/core";
import type { UseAuthorizeReturn } from "../hooks/useAuthorize";
import "../type.extension.ts";
import type { KilpiClientPolicyExtension_ReactClientPlugin } from "../type.extension.ts";

/**
 * The <Authorize /> component renders either children, Unauthorized or Pending
 * based on the state of an authorization decision.
 */
export type AuthorizeClientProps<
  TClient extends AnyKilpiClient,
  TPolicy extends KilpiClientPolicy<TClient, TClient["$$infer"]["policies"]>,
> = {
  /**
   * The policy to evaluate.
   */
  policy: TPolicy;

  /**
   * Disables the authorization check when true.
   */
  isDisabled?: boolean;

  /**
   * Children that are rendered when the caller is authorized. May be a dynamic function
   * that depends on the decision.
   */
  children?:
    | React.ReactNode
    | ((query: UseAuthorizeReturn<TClient, TPolicy["$action"]>) => React.ReactNode);

  /**
   * Children that are rendered when the caller is not authorized. May be a dynamic function
   * that depends on the decision.
   */
  Unauthorized?:
    | React.ReactNode
    | ((query: UseAuthorizeReturn<TClient, TPolicy["$action"]>) => React.ReactNode);

  /**
   * Children that are rendered while the authorization decision is pending.
   */
  Pending?:
    | React.ReactNode
    | ((query: UseAuthorizeReturn<TClient, TPolicy["$action"]>) => React.ReactNode);

  /**
   * Children that are rendered while the authorization decision is idle (disabled).
   */
  Idle?:
    | React.ReactNode
    | ((query: UseAuthorizeReturn<TClient, TPolicy["$action"]>) => React.ReactNode);

  /**
   * Children that are rendered while the authorization decision is error.
   */
  Error?:
    | React.ReactNode
    | ((query: UseAuthorizeReturn<TClient, TPolicy["$action"]>) => React.ReactNode);
};

/**
 * Factory function for the <AuthorizeClient /> component.
 */
export function create_AuthorizeClient<TClient extends AnyKilpiClient>(client: TClient) {
  void client;

  /**
   * Implement Authorize_Client
   */
  return function AuthorizeClient<
    TAction extends PolicysetActions<TClient["$$infer"]["policies"]>,
    TPolicy extends KilpiClientPolicy<TClient, TAction> &
      KilpiClientPolicyExtension_ReactClientPlugin<TClient, TAction>,
  >({
    policy,
    children,
    Unauthorized,
    Idle,
    Pending,
    Error,
    isDisabled,
  }: AuthorizeClientProps<TClient, TPolicy>) {
    // Fetch using useAuthorize
    const query = policy.useAuthorize({ isDisabled });

    switch (query.status) {
      // Handle pending, idle and error states with custom functions
      case "pending": {
        return typeof Pending === "function" ? Pending(query) : (Pending ?? null);
      }
      case "idle": {
        return typeof Idle === "function" ? Idle(query) : (Idle ?? null);
      }
      case "error": {
        return typeof Error === "function" ? Error(query) : (Error ?? null);
      }

      // Success: Decide component to render based on granted
      case "success": {
        // Granted: Render authorized children
        if (query.decision?.granted) {
          return typeof children === "function" ? children(query) : (children ?? null);
        }

        // Not granted: Render unauthorized children
        return typeof Unauthorized === "function" ? Unauthorized(query) : (Unauthorized ?? null);
      }
    }
  };
}
