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

/**
 * Options provided to all strategies
 */
export type AuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  /**
   * When strategy flushes events, run this callback.
   */
  onFlushEvents(events: KilpiAuditEvent<T>[]): Promise<void>;
};

export interface AuditFlushStrategy<T extends AnyKilpiCore> {
  /**
   * Add event to storage.
   */
  onAuditEvent(event: KilpiAuditEvent<T>): void;

  /**
   * Trigger flushing manually
   */
  triggerFlush(): void;
}

/**
 * Options to construct an immediate flush strategy.
 */
export type ImmediateAuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  strategy: "immediate";
} & AuditFlushStrategyOptions<T>;

/**
 * Flush strategy that flushes events immediately, one-by-one as they come.
 */
export class ImmediateAuditFlushStrategy<T extends AnyKilpiCore> implements AuditFlushStrategy<T> {
  private onFlushEvents: AuditFlushStrategyOptions<T>["onFlushEvents"];

  constructor(options: ImmediateAuditFlushStrategyOptions<T>) {
    this.onFlushEvents = options.onFlushEvents;
  }

  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.onFlushEvents([event]);
  }

  triggerFlush(): void {}
}

/**
 * Any flush strategy options to pass to flush strategy factory.
 */
export type AnyFlushStrategyOptions<T extends AnyKilpiCore> =
  | ImmediateAuditFlushStrategyOptions<T>
  | PeriodicalAuditFlushStrategyOptions<T>;

/**
 * Factory function to construct any flush strategy.
 */
export function createAuditFlushStrategy<T extends AnyKilpiCore>(
  options: AnyFlushStrategyOptions<T>,
): AuditFlushStrategy<T> {
  switch (options.strategy) {
    case "immediate": {
      return new ImmediateAuditFlushStrategy(options);
    }
    case "periodical": {
      return new PeriodicalAuditFlushStrategy(options);
    }
  }
}
