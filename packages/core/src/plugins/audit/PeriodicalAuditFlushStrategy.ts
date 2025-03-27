import type { AnyKilpiCore } from "src/KilpiCore";
import type { AuditFlushStrategy, AuditFlushStrategyOptions } from "./AuditFlushStrategy";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Options to construct a periodical flush strategy.
 */
export type PeriodicalAuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  strategy: "periodical";
  flushPeriodSeconds: number;
} & AuditFlushStrategyOptions<T>;

/**
 * Flush strategy that flushes events every `flushPeriodSeconds`.
 */
export class PeriodicalAuditFlushStrategy<T extends AnyKilpiCore> implements AuditFlushStrategy<T> {
  /**
   * Callback for when events are flushed.
   */
  private onFlushEvents: AuditFlushStrategyOptions<T>["onFlushEvents"];

  /**
   * Events that have been collected since the last flush.
   */
  private events: KilpiAuditEvent<T>[] = [];

  constructor(options: PeriodicalAuditFlushStrategyOptions<T>) {
    this.onFlushEvents = options.onFlushEvents;

    // Start flushing events every `flushPeriodSeconds`
    setInterval(this.triggerFlush, options.flushPeriodSeconds);
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
