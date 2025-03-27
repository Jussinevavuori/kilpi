import type { AnyKilpiCore } from "src/KilpiCore";
import type { AuditFlushStrategy, AuditFlushStrategyOptions } from "./AuditFlushStrategy";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Options to construct a periodical flush strategy.
 */
export type ManualAuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  strategy: "manual";
} & AuditFlushStrategyOptions<T>;

/**
 * Flush strategy that only flushes when `triggerFlush` is explicitly called.
 */
export class ManualAuditFlushStrategy<T extends AnyKilpiCore> implements AuditFlushStrategy<T> {
  /**
   * Callback for when events are flushed.
   */
  private onFlushEvents: AuditFlushStrategyOptions<T>["onFlushEvents"];

  /**
   * Events that have been collected since the last flush.
   */
  private events: KilpiAuditEvent<T>[] = [];

  constructor(options: ManualAuditFlushStrategyOptions<T>) {
    this.onFlushEvents = options.onFlushEvents;
  }

  /**
   * On event received, store it until next flush.
   */
  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.events.push(event);
  }

  /**
   * Trigger a flush of all stored events. Immediately empty events array to prevent
   * double-flushing any events.
   */
  triggerFlush(): void {
    const poppedEvents = this.events;
    this.events = [];
    this.onFlushEvents(poppedEvents);
  }
}
