import { AbortSignalAll } from "src/utils/AbortSignalAll";
import { describe, expect, it, vi } from "vitest";

describe("AbortSignalAll", () => {
  it("should abort when all signals aborted", () => {
    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    const all = AbortSignalAll([ac1.signal, ac2.signal, ac3.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    ac1.abort();
    ac2.abort();
    ac3.abort();

    expect(listener).toHaveBeenCalledTimes(1);

    expect(all.aborted).toBe(true);
  });

  it("should abort even if some signals were already aborted", () => {
    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    ac1.abort();
    ac2.abort();

    const all = AbortSignalAll([ac1.signal, ac2.signal, ac3.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    ac3.abort();

    expect(listener).toHaveBeenCalledTimes(1);

    expect(all.aborted).toBe(true);
  });

  it("should abort when all signals already aborted", () => {
    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    ac1.abort();
    ac2.abort();
    ac3.abort();

    const all = AbortSignalAll([ac1.signal, ac2.signal, ac3.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    expect(listener).toHaveBeenCalledTimes(0); // was aborted before listener mounted

    expect(all.aborted).toBe(true);
  });

  it("should not abort when not all signals aborted", () => {
    const ac1 = new AbortController();
    const ac2 = new AbortController();
    const ac3 = new AbortController();

    const all = AbortSignalAll([ac1.signal, ac2.signal, ac3.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    ac1.abort();
    ac2.abort();

    expect(listener).toHaveBeenCalledTimes(0);
    expect(all.aborted).toBe(false);
  });

  it("should abort even with duplicate signals", () => {
    const ac1 = new AbortController();
    const ac2 = new AbortController();

    const all = AbortSignalAll([ac1.signal, ac2.signal, ac2.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    ac1.abort();
    ac2.abort();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(all.aborted).toBe(true);
  });

  it("should immediately abort on empty array", () => {
    const all = AbortSignalAll([]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    expect(listener).toHaveBeenCalledTimes(0); // was aborted before listener mounted
    expect(all.aborted).toBe(true);
  });

  it("should abort when single signal aborted", () => {
    const ac1 = new AbortController();

    const all = AbortSignalAll([ac1.signal]);

    const listener = vi.fn();

    all.addEventListener("abort", listener);

    ac1.abort();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(all.aborted).toBe(true);
  });
});
