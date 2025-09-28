import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { Batcher } from "src/utils/Batcher";
import { deepEquals } from "src/utils/deepEquals";
import { describe, expect, it, vi } from "vitest";

type Sub = { id: string; name: string };
type Doc = { id: string; userId: string };

/**
 * Setup a new server and client.
 */
function init() {
  const processItemCb = vi.fn();

  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async (): Promise<Sub | null> => null,
    policies: {
      always: (s) => Grant(s),
      never: (_) => Deny(),
      doc: (s, doc: Doc) => (s && s.id === doc.userId ? Grant(s) : Deny()),
    },
    plugins: [
      EndpointPlugin({
        secret: "secret",
        onBeforeProcessItem: processItemCb,
      }),
    ],
  });

  const KilpiClient = createKilpiClient({
    infer: {} as typeof Kilpi,

    // Connect directly to endpoint
    connect: { handleRequest: Kilpi.createPostEndpoint(), secret: "secret" },

    // Short timeout for local testing
    batching: { batchDelayMs: 50, jobTimeoutMs: 100 },
  });

  return {
    KilpiClient,
    processItemCb,
  };
}

describe("requestDeduping", () => {
  it("should work with primitive comparison", async () => {
    const mockFn = vi.fn();

    const batcher = new Batcher<number>({
      async runJobs(jobs) {
        for (const job of jobs) {
          mockFn(job.payload);
          job.resolve(job.payload);
        }
      },
      dedupe: (a, b) => a === b,
      jobTimeoutMs: 10,
      batchDelayMs: 100,
    });

    // Batch one job, flush and check that it was called
    batcher.queueJob(1);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toHaveBeenLastCalledWith(1);

    // Batch two different jobs, flush and check that both were called
    batcher.queueJob(2);
    batcher.queueJob(3);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(3);
    expect(mockFn).toHaveBeenLastCalledWith(3);

    // Batch two identical jobs, flush and check that only one was called
    batcher.queueJob(4);
    batcher.queueJob(4);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(4);
    expect(mockFn).toHaveBeenLastCalledWith(4);

    // Batch mix of identical and different jobs, flush and check that only one was called
    batcher.queueJob(5);
    batcher.queueJob(6);
    batcher.queueJob(5);
    batcher.queueJob(6);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(6);
    expect(mockFn).toHaveBeenLastCalledWith(6);
  });

  it("should work with object comparison using deepEquals", async () => {
    const mockFn = vi.fn();

    const batcher = new Batcher<{ type: string; id?: string }>({
      async runJobs(jobs) {
        for (const job of jobs) {
          mockFn(job.payload);
          job.resolve(job.payload);
        }
      },
      dedupe: deepEquals,
      jobTimeoutMs: 50,
      batchDelayMs: 10,
    });

    // Batch one job, flush and check that it was called
    batcher.queueJob({ type: "a" });
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(1);

    // Batch two different jobs, flush and check that both were called
    mockFn.mockReset();
    batcher.queueJob({ type: "b" });
    batcher.queueJob({ type: "c" });
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(2);

    // Batch two identical jobs, flush and check that only one was called
    mockFn.mockReset();
    batcher.queueJob({ type: "d" });
    batcher.queueJob({ type: "d" });
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(1);

    // Batch mix of identical and different jobs, flush and check that only one was called
    mockFn.mockReset();
    batcher.queueJob({ type: "e" });
    batcher.queueJob({ type: "f" });
    batcher.queueJob({ type: "e" });
    batcher.queueJob({ type: "f" });
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(2);

    // Identical object, two different orders of properties
    mockFn.mockReset();
    batcher.queueJob({ type: "a", id: "a" });
    batcher.queueJob({ id: "a", type: "a" });
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(1);
  });

  it("should not do anything when deduping disabled", async () => {
    const mockFn = vi.fn();

    const batcher = new Batcher<number>({
      async runJobs(jobs) {
        for (const job of jobs) {
          mockFn(job.payload);
          job.resolve(job.payload);
        }
      },
      // dedupe: (a, b) => a === b,
      jobTimeoutMs: 50,
      batchDelayMs: 10,
    });

    // Batch one job, flush and check that it was called
    batcher.queueJob(1);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(1);

    // Batch two different jobs, flush and check that both were called
    batcher.queueJob(2);
    batcher.queueJob(3);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(3);

    // Batch two identical jobs, flush and check that only one was called
    batcher.queueJob(4);
    batcher.queueJob(4);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(5);

    // Batch mix of identical and different jobs, flush and check that only one was called
    batcher.queueJob(5);
    batcher.queueJob(6);
    batcher.queueJob(5);
    batcher.queueJob(6);
    await batcher.flushBatch();
    expect(mockFn).toBeCalledTimes(9);
  });
});
