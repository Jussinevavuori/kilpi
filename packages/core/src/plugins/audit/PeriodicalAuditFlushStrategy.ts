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
  private options: PeriodicalAuditFlushStrategyOptions<T>;

  // Event batch
  private events: KilpiAuditEvent<T>[];

  constructor(options: PeriodicalAuditFlushStrategyOptions<T>) {
    this.options = options;

    // Initialize empty event batch
    this.events = [];

    // Start flushing events every `flushPeriodSeconds`
    setInterval(() => this.triggerFlush(), options.flushPeriodSeconds * 1000);
  }

  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.events.push(event);
  }

  async triggerFlush(): Promise<void> {
    // Clear event batch
    const events = this.events;
    this.events = [];

    // Flush events, apply waitUntil
    const promise = this.options.onFlushEvents(events);
    this.options.waitUntil?.(promise);
    await promise;
  }
}
