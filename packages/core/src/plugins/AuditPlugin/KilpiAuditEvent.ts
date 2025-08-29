import type { Decision } from "src/decision";
import type { AnyKilpiCore } from "src/KilpiCore";

export type KilpiAuditEvent<T extends AnyKilpiCore> = {
  /**
   * Type of the event
   */
  type: "authorization";

  /**
   * Authorization decision
   */
  authorization: Decision<T["$$infer"]["subject"]>;

  /**
   * Timestamp of the event
   */
  timestamp: number;

  /**
   * Subject of the event
   */
  subject: T["$$infer"]["subject"];

  /**
   * Object of the event
   */
  object: unknown;

  /**
   * Key of the policy
   */
  policyKey: string;

  /**
   * Source of the event
   */
  source: string;
};
