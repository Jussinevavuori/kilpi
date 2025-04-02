import type { AnyKilpiCore } from "src/KilpiCore";
import type { AuditFlushStrategy, AuditFlushStrategyOptions } from "./AuditFlushStrategy";
import { Batcher } from "./Batcher";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Options to construct a batch flush strategy.
 */
export type BatchAuditFlushStrategyOptions<T extends AnyKilpiCore> = {
  strategy: "batch";
  batchTimeoutSeconds: number;
} & AuditFlushStrategyOptions<T>;

/**
 * Flush strategy that flushes events every `flushPeriodSeconds`.
 */
export class BatchAuditFlushStrategy<T extends AnyKilpiCore> implements AuditFlushStrategy<T> {
  private options: BatchAuditFlushStrategyOptions<T>;

  private eventBatcher: Batcher<KilpiAuditEvent<T>, void>;

  constructor(options: BatchAuditFlushStrategyOptions<T>) {
    this.options = options;

    // Create event batcher. It applies the waitUntil function if provided. Connect to
    // flush function.
    this.eventBatcher = new Batcher({
      // Apply given options
      batchDelayMs: options.batchTimeoutSeconds * 1000,
      waitUntil: options.waitUntil,

      // Flush all events and resolve each job
      runJobs: async (jobs) => {
        console.log(`🔥 BATCH: Running ${jobs.length} jobs`);
        await this.options.onFlushEvents(jobs.map((_) => _.payload));
        jobs.map((_) => _.resolve());
      },
    });
  }

  onAuditEvent(event: KilpiAuditEvent<T>): void {
    this.eventBatcher.queueJob(event);
    console.log(Date.now() % 10_000, "Enqueued", event);
  }

  async triggerFlush(): Promise<void> {
    await this.eventBatcher.flushBatch();
  }
}
