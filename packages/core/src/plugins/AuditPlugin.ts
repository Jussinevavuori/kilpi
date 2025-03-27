import type { AnyKilpiCore } from "src/KilpiCore";
import { createKilpiPlugin } from "src/KilpiPlugin";
import { createAuditFlushStrategy, type AnyFlushStrategyOptions } from "./AuditFlushStrategy";

/**
 * Audit plugin to allow for easily hooking into authorization decisions and logging them into
 * an audit log (console, sending to a server, etc).
 */
export function unstable_AuditPlugin<T extends AnyKilpiCore>(options: {
  /**
   * Strategy on when to handle audit events.
   */
  strategy: AnyFlushStrategyOptions<T>;
}) {
  return createKilpiPlugin((Kilpi: T) => {
    // Create flush strategy from specified options
    const flushStrategy = createAuditFlushStrategy(options.strategy);

    // Connect flush strategy to onAfterAuthorization hook to always send an audit event
    // when an authorization event has been performed.
    Kilpi.hooks.onAfterAuthorization((event) => {
      flushStrategy.onAuditEvent({
        type: "authorization",
        authorization: event.authorization,
        subject: event.subject,
        policyKey: event.policy,
        resource: event.resource,
        source: event.source,
        timestamp: Date.now(),
      });
    });

    return {};
  });
}
