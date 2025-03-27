// TODO: Add abort signals to react-client hooks

import { Batcher } from "src/utils/Batcher";
import type { BatchJob } from "src/utils/BatchJob";
import { describe, expect, it, vi } from "vitest";

function createSquareBatcher(mockFn: ReturnType<typeof vi.fn>, timeoutMs = 0) {
  return new Batcher<number>({
    batchDelayMs: 10,
    jobTimeoutMs: 20,
    dedupe: (a, b) => a === b,

    async runJobs(jobs: BatchJob<number>[]) {
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));

      for (const job of jobs) {
        // Save on "expensive" computation or fetch or something
        if (job.signal.aborted) {
          job.reject(new Error("Aborted"));
          continue;
        }

        mockFn(job.payload);
        job.resolve(job.payload * job.payload);
      }
    },
  });
}

describe("BatchJob.abortSignal", () => {
  it("dedupes jobs", async () => {
    const mockFn = vi.fn();

    const squareBatcher = createSquareBatcher(mockFn);

    squareBatcher.queueJob(1);
    squareBatcher.queueJob(2);
    squareBatcher.queueJob(1);
    squareBatcher.queueJob(2);
    await squareBatcher.flushBatch();

    expect(mockFn).toBeCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(2);
  });

  it("doesn't abort deduped job when not some signals aborted", async () => {
    const mockFn = vi.fn();

    const squareBatcher = createSquareBatcher(mockFn);

    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    const r1 = squareBatcher.queueJob(2, { signal: ac1.signal });
    const r2 = squareBatcher.queueJob(2, { signal: ac2.signal });
    const r3 = squareBatcher.queueJob(2, { signal: ac3.signal });

    ac1.abort();
    ac2.abort();

    await squareBatcher.flushBatch();

    expect(mockFn).toBeCalledTimes(1);

    await expect(r1).resolves.toBe(4);
    await expect(r2).resolves.toBe(4);
    await expect(r3).resolves.toBe(4);
  });

  it("aborts deduped job after all signals aborted", async () => {
    const mockFn = vi.fn();

    const squareBatcher = createSquareBatcher(mockFn);

    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    const r1 = squareBatcher.queueJob(4, { signal: ac1.signal });
    const r2 = squareBatcher.queueJob(4, { signal: ac2.signal });
    const r3 = squareBatcher.queueJob(4, { signal: ac3.signal });

    ac1.abort();
    ac2.abort();
    ac3.abort();

    await squareBatcher.flushBatch();

    expect(mockFn).toBeCalledTimes(0);

    await expect(r1).rejects.toThrow();
    await expect(r2).rejects.toThrow();
    await expect(r3).rejects.toThrow();
  });

  it("aborts after timeout", async () => {
    const mockFn = vi.fn();

    const squareBatcher = createSquareBatcher(mockFn, 50);

    const r1 = squareBatcher.queueJob(4);
    const r2 = squareBatcher.queueJob(4);
    const r3 = squareBatcher.queueJob(4);

    await squareBatcher.flushBatch();

    expect(mockFn).toBeCalledTimes(0);

    await expect(r1).rejects.toThrow();
    await expect(r2).rejects.toThrow();
    await expect(r3).rejects.toThrow();
  });
});
