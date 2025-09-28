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

    /**
     * Optionally disable initially. Can be re-enabled with `Kilpi.audit.enable()` and
     * disabled with `Kilpi.audit.disable()`.
     */
    disabled?: boolean;
  },
) {
  return createKilpiPlugin((Kilpi: T) => {
    // Current unsubscribe function. Also used to signal if the plugin is enabled or not.
    let unsubscribe: (() => void) | undefined;

    // Create flush strategy from specified options using factory pattern
    const flushStrategy = createAuditFlushStrategy(options);

    // Function to enable auditing
    function enable() {
      // Already enabled
      if (unsubscribe) return;

      // Connect flush strategy to onAfterAuthorization hook to always send an audit event
      // when an authorization event has been performed.
      unsubscribe = Kilpi.$hooks.onAfterAuthorization((event) => {
        // Construct audit event
        const auditEvent: KilpiAuditEvent<T> = {
          type: "authorization",
          decision: event.decision,

          subject: event.subject,
          action: event.action,
          object: event.object,
          timestamp: Date.now(),
        };

        // Omit audit events based on options.filterEvents
        if (options.filterEvents && options.filterEvents(auditEvent) === false) {
          return;
        }

        // Send audit event to flush strategy
        flushStrategy.onAuditEvent(auditEvent);
      });
    }

    // Function to disable auditing
    function disable() {
      // Already disabled
      if (!unsubscribe) return;

      // Unsubscribe from the hook
      unsubscribe();
      unsubscribe = undefined;
    }

    // Enable by default unless explicitly disabled
    if (!options.disabled) enable();

    // Public interface for interacting with the audit plugin, namespaced under "audit".
    return {
      audit: {
        /**
         * Manually trigger a flush.
         */
        flush: () => flushStrategy.triggerFlush(),

        /**
         * Dynamically enable the audit plugin.
         */
        enable,

        /**
         * Dynamically disable the audit plugin.
         */
        disable,
      },
    };
  });
}
