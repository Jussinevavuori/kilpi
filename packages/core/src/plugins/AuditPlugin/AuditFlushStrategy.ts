import type { AnyKilpiCore } from "src/KilpiCore";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Options provided to all strategies
 */
export type AuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  /**
   * When strategy flushes events, run this callback.
   */
  onFlushEvents(events: KilpiAuditEvent<T>[]): Promise<void>;

  /**
   * Optional waitUntil function for serverless environments to ensure latest batch completes.
   */
  waitUntil?: (promise: Promise<unknown>) => void;
};

export interface AuditFlushStrategy<T extends AnyKilpiCore> {
  /**
   * Add event to storage.
   */
  onAuditEvent(event: KilpiAuditEvent<T>): void;

  /**
   * Trigger flushing manually
   */
  triggerFlush(): Promise<void>;
}
