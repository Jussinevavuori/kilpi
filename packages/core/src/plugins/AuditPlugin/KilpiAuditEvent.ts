import type { Authorization } from "src/authorization";
import type { AnyKilpiCore } from "src/KilpiCore";

export type KilpiAuditEvent<T extends AnyKilpiCore> = {
  /**
   * Type of the event
   */
  type: "authorization";

  /**
   * Authorization decision
   */
  authorization: Authorization<T["$$infer"]["subject"]>;

  /**
   * Timestamp of the event
   */
  timestamp: number;

  /**
   * Subject of the event
   */
  subject: T["$$infer"]["subject"];

  /**
   * Resource of the event
   */
  resource: unknown;

  /**
   * Key of the policy
   */
  policyKey: string;

  /**
   * Source of the event
   */
  source: string;
};
