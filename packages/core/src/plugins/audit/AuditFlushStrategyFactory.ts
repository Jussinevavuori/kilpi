import type { AnyKilpiCore } from "src/KilpiCore";
import type { AuditFlushStrategy } from "./AuditFlushStrategy";
import {
  ImmediateAuditFlushStrategy,
  type ImmediateAuditFlushStrategyOptions,
} from "./ImmediateAuditFlushStrategy";
import {
  ManualAuditFlushStrategy,
  type ManualAuditFlushStrategyOptions,
} from "./ManualAuditFlushStrategy";
import {
  PeriodicalAuditFlushStrategy,
  type PeriodicalAuditFlushStrategyOptions,
} from "./PeriodicalAuditFlushStrategy";

/**
 * Any flush strategy options to pass to flush strategy factory.
 */
export type AnyFlushStrategyOptions<T extends AnyKilpiCore> =
  | ImmediateAuditFlushStrategyOptions<T>
  | PeriodicalAuditFlushStrategyOptions<T>
  | ManualAuditFlushStrategyOptions<T>;

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
    case "manual": {
      return new ManualAuditFlushStrategy(options);
    }
  }
}
