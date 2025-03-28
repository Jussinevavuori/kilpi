import type { AnyKilpiCore } from "src/KilpiCore";
import { createKilpiPlugin } from "src/KilpiPlugin";
import {
  createAuditFlushStrategy,
  type AnyFlushStrategyOptions,
} from "./AuditFlushStrategyFactory";
import type { KilpiAuditEvent } from "./KilpiAuditEvent";

/**
 * Audit plugin to allow for easily hooking into authorization decisions and logging them into
 * an audit log (console, sending to a server, etc).
 */
export function AuditPlugin<T extends AnyKilpiCore>(
  /**
   * Options for selecting the flushing strategy
   */
  options: AnyFlushStrategyOptions<T> & {
    /**
     * Optionally filter events. If provided, only events that pass the filter will be sent to the
     * flush strategy.
     */
    filterEvents?: (event: KilpiAuditEvent<T>) => boolean;
  },
) {
  return createKilpiPlugin((Kilpi: T) => {
    // Create flush strategy from specified options using factory pattern
    const flushStrategy = createAuditFlushStrategy(options);

    // Connect flush strategy to onAfterAuthorization hook to always send an audit event
    // when an authorization event has been performed.
    Kilpi.hooks.onAfterAuthorization((event) => {
      // Construct audit event
      const auditEvent: KilpiAuditEvent<T> = {
        type: "authorization",
        authorization: event.authorization,

        subject: event.subject,
        policyKey: event.policy,
        resource: event.resource,
        source: event.source,
        timestamp: Date.now(),
      };

      // Omit audit events based on options.filterEvents
      if (options.filterEvents && options.filterEvents(auditEvent) === false) {
        return;
      }

      // Send audit event to flush strategy
      flushStrategy.onAuditEvent(auditEvent);
    });

    return {
      /**
       * API for interacting with the audit plugin
       */
      audit: {
        /**
         * Manually trigger a flush
         */
        flush: () => flushStrategy.triggerFlush(),
      },
    };
  });
}
