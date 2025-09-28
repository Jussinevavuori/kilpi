import { AuditPlugin, createKilpi, Deny, Grant, type Policyset } from "src";
import { describe, expect, it, vi } from "vitest";
import { TestingUtils, type TestingSubject } from "./TestingUtils";

describe("AuditPlugin", () => {
  // Subject state
  const subjectState = TestingUtils.createSubjectState({ userId: "1" });

  // Kilpi constructor params
  const getSubject = async () => subjectState.getSubject();
  const policies = {
    always(subject) {
      return Grant(subject);
    },
    never() {
      return Deny();
    },
  } as const satisfies Policyset<TestingSubject>;

  it("should work with immediate strategy", async () => {
    const mockAuditApi = vi.fn();

    const Kilpi = createKilpi({
      getSubject,
      policies,
      plugins: [
        AuditPlugin({
          strategy: "immediate",
          onFlushEvents: async (events) => events.forEach((e) => mockAuditApi(e)),
        }),
      ],
    });

    await Kilpi.always().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(1);

    await Kilpi.never().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(2);
  });

  it("should work with manual strategy", async () => {
    const mockAuditApi = vi.fn();

    const Kilpi = createKilpi({
      getSubject,
      policies,
      plugins: [
        AuditPlugin({
          strategy: "manual",
          onFlushEvents: async (events) => events.forEach((e) => mockAuditApi(e)),
        }),
      ],
    });

    await Kilpi.always().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    await Kilpi.never().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    await Kilpi.$audit.flush();
    expect(mockAuditApi).toHaveBeenCalledTimes(2);
  });

  it("should work with periodical strategy", async () => {
    const timestamps: number[] = [];
    const mockAuditApi = vi.fn(() => timestamps.push(Date.now()));

    const Kilpi = createKilpi({
      getSubject,
      policies,
      plugins: [
        AuditPlugin({
          strategy: "periodical",
          flushPeriodSeconds: 0.1,
          onFlushEvents: async (events) => events.forEach(() => mockAuditApi()),
        }),
      ],
    });

    // Call twice with 50 ms inbetween
    await Kilpi.always().authorize();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockAuditApi).toHaveBeenCalledTimes(0);
    await Kilpi.never().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    // Allow time for flushing
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockAuditApi).toHaveBeenCalledTimes(2);

    // Ensure flushed at same time
    expect(timestamps).toHaveLength(2);
    expect(Math.abs(timestamps[0] - timestamps[1])).toBeLessThan(50);

    // Call again twice with 50 ms inbetween
    await Kilpi.always().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(2);
    await new Promise((resolve) => setTimeout(resolve, 50));
    await Kilpi.never().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(2);

    // Allow time for flushing
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockAuditApi).toHaveBeenCalledTimes(4);

    // Ensure flushed at same time and ~100ms after first
    expect(timestamps).toHaveLength(4);
    const deltaMs = 10;
    expect(Math.abs(timestamps[2] - timestamps[3])).toBeLessThan(50);
    expect(Math.abs(timestamps[2] - timestamps[0])).toBeGreaterThan(100 - deltaMs);
    expect(Math.abs(timestamps[2] - timestamps[0])).toBeLessThan(100 + deltaMs);
  });

  it("should work with batch strategy", async () => {
    const timestamps: number[] = [];
    const mockAuditApi = vi.fn(() => timestamps.push(Date.now()));

    const Kilpi = createKilpi({
      getSubject,
      policies,
      plugins: [
        AuditPlugin({
          strategy: "batch",
          batchTimeoutSeconds: 0.1,
          onFlushEvents: async (events) => events.forEach(() => mockAuditApi()),
        }),
      ],
    });

    // Allow for little bit of time to pass
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Call three times with 20ms breaks since "start"
    const start = Date.now();

    await Kilpi.always().authorize();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    await Kilpi.always().authorize();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    await Kilpi.always().authorize();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    // Ensure all flushed after 100 ms from first
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(mockAuditApi).toHaveBeenCalledTimes(3);
    for (const timestamp of timestamps) {
      const deltaMs = 10;
      expect(timestamp).toBeGreaterThan(start + 100 - deltaMs);
      expect(timestamp).toBeLessThan(start + 100 + deltaMs);
    }

    // Ensure manual flushing works
    await Kilpi.always().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(3);
    await Kilpi.$audit.flush();
    expect(mockAuditApi).toHaveBeenCalledTimes(4);
    await Kilpi.$audit.flush();
    expect(mockAuditApi).toHaveBeenCalledTimes(4);
  });

  it("filters events", async () => {
    const mockAuditApi = vi.fn();

    const Kilpi = createKilpi({
      getSubject,
      policies,
      plugins: [
        AuditPlugin({
          strategy: "immediate",
          onFlushEvents: async (events) => events.forEach((e) => mockAuditApi(e)),
          filterEvents(e) {
            return e.decision.granted === false;
          },
        }),
      ],
    });

    await Kilpi.always().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(0);

    await Kilpi.never().authorize();
    expect(mockAuditApi).toHaveBeenCalledTimes(1);
  });
});
