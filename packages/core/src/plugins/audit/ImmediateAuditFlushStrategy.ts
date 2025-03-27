import type { AnyKilpiCore } from "src/KilpiCore";
import type { AuditFlushStrategy, AuditFlushStrategyOptions } from "./AuditFlushStrategy";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Options to construct a immediate flush strategy.
 */
export type ImmediateAuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  strategy: "immediate";
} & AuditFlushStrategyOptions<T>;

/**
 * Flush strategy that flushes every event immediately as they come.
 */
export class ImmediateAuditFlushStrategy<T extends AnyKilpiCore> implements AuditFlushStrategy<T> {
  /**
   * Callback for when events are flushed.
   */
  private onFlushEvents: AuditFlushStrategyOptions<T>["onFlushEvents"];

  constructor(options: ImmediateAuditFlushStrategyOptions<T>) {
    this.onFlushEvents = options.onFlushEvents;
  }

  /**
   * On event received, flush it immediately.
   */
  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.onFlushEvents([event]);
  }

  /**
   * This is a no-op as we don't store any events to be flushed later.
   */
  triggerFlush(): void {}
}
