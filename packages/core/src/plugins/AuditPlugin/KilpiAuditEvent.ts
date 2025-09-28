import type { AnyKilpiCore } from "src/KilpiCore";
import type { Decision } from "src/types";

export type KilpiAuditEvent<T extends AnyKilpiCore> = {
  /**
   * Type of the event
   */
  type: "authorization";

  /**
   * Authorization decision
   */
  decision: Decision<T["$$infer"]["subject"]>;

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
   * The action
   */
  action: string;
};
