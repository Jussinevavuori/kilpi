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
  private options: ManualAuditFlushStrategyOptions<T>;

  // Event batch
  private events: KilpiAuditEvent<T>[];

  constructor(options: ManualAuditFlushStrategyOptions<T>) {
    this.options = options;
    this.events = [];
  }

  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.events.push(event);
  }

  async triggerFlush(): Promise<void> {
    // Clear event batch
    const events = this.events;
    this.events = [];

    // No events to flush
    if (events.length === 0) return;

    // Flush events, apply waitUntil
    const promise = this.options.onFlushEvents(events);
    this.options.waitUntil?.(promise);
    await promise;
  }
}
