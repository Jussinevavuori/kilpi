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
  private options: ImmediateAuditFlushStrategyOptions<T>;

  constructor(options: ImmediateAuditFlushStrategyOptions<T>) {
    this.options = options;
  }

  onAuditEvent(event: KilpiAuditEvent<T>): void {
    const promise = this.options.onFlushEvents([event]);
    this.options.waitUntil?.(promise);
  }

  async triggerFlush(): Promise<void> {
    console.warn(
      [
        `You are manually attempting to flush all audit events in Kilpi AuditPlugin`,
        `with the immediate flushing strategy. This will not do anything as`,
        `all events are flushed immediately.`,
      ].join(" "),
    );
  }
}
