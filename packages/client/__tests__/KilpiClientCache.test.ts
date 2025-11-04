import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient, KilpiClientCache } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Subject = { id: string };

const policyA = vi.fn();
const policyB = vi.fn();
const policyCA = vi.fn();
const policyCB = vi.fn();
const policyD = vi.fn();

/**
 * Setup a new server and client.
 */
function init(options: { subject: Subject | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {
      async a(subject) {
        policyA(subject);
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        return Grant(subject);
      },
      async b(subject) {
        policyB(subject);
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        return Grant(subject);
      },
      c: {
        async a(subject) {
          policyCA(subject);
          if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
          return Grant(subject);
        },
        async b(subject) {
          policyCB(subject);
          if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
          return Grant(subject);
        },
      },
      async d(subject, object: { id: string }) {
        policyD(subject, object);
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        return Grant(subject);
      },
    },
    plugins: [EndpointPlugin({ secret: "secret" })],
  });

  return createKilpiClient({
    infer: {} as typeof Kilpi,
    connect: { handleRequest: Kilpi.$createPostEndpoint(), secret: "secret" },
    batching: { jobTimeoutMs: 1 },
  });
}

describe("KilpiClientCache", () => {
  beforeEach(() => {
    policyA.mockReset();
    policyB.mockReset();
    policyCA.mockReset();
    policyCB.mockReset();
    policyD.mockReset();
  });

  it("should cache the call", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    expect(policyA).toHaveBeenCalledTimes(0);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
  });

  it("should allow fully invalidating the cache", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    expect(policyA).toHaveBeenCalledTimes(0);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    Client.$cache.invalidate();
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(2);
  });

  it("should allow invalidating single cache entries", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    expect(policyA).toHaveBeenCalledTimes(0);
    expect(policyB).toHaveBeenCalledTimes(0);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyB).toHaveBeenCalledTimes(1);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyB).toHaveBeenCalledTimes(1);
    Client.a().$invalidate();
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(2);
    expect(policyB).toHaveBeenCalledTimes(1);
  });

  it("should allow invalidating full cache paths", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    expect(policyA).toHaveBeenCalledTimes(0);
    expect(policyCA).toHaveBeenCalledTimes(0);
    expect(policyCB).toHaveBeenCalledTimes(0);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyCA).toHaveBeenCalledTimes(1);
    expect(policyCB).toHaveBeenCalledTimes(1);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyCA).toHaveBeenCalledTimes(1);
    expect(policyCB).toHaveBeenCalledTimes(1);
    Client.c.$invalidate();
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyCA).toHaveBeenCalledTimes(2);
    expect(policyCB).toHaveBeenCalledTimes(2);
  });

  it("should allow invalidating full cache paths for policies with objects", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    expect(policyD).toHaveBeenCalledTimes(0);

    // Call with id: "1"
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(1);

    // Call again with id: "1" (should be cached)
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(1);

    // Call with id: "2" (should NOT be cached)
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(2);

    // Call again with id: "2" (should be cached)
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(2);

    // Invalidate only id: "1"
    Client.d({ id: "1" }).$invalidate();
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(3);

    // id: "2" should still be cached
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(3);

    // Invalidate all d policies
    Client.d.$invalidate();
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);
    expect(policyD).toHaveBeenCalledTimes(5);
  });

  it.only("should support root-level namespace invalidation to invalidate everything", async () => {
    const Client = init({ subject: { id: "1" } });
    const expected = { granted: true, subject: { id: "1" } };

    // Call a few policies multiple times to populate cache
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);

    // All policies should have been cached and only called once
    expect(policyA).toHaveBeenCalledTimes(1);
    expect(policyB).toHaveBeenCalledTimes(1);
    expect(policyCA).toHaveBeenCalledTimes(1);
    expect(policyCB).toHaveBeenCalledTimes(1);
    expect(policyD).toHaveBeenCalledTimes(2);

    // Invalidate everything using root-level namespace
    Client.$invalidate();

    // All policies should be called again after invalidation
    await expect(Client.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.a().authorize()).resolves.toMatchObject(expected);
    await expect(Client.c.b().authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "1" }).authorize()).resolves.toMatchObject(expected);
    await expect(Client.d({ id: "2" }).authorize()).resolves.toMatchObject(expected);

    expect(policyA).toHaveBeenCalledTimes(2);
    expect(policyB).toHaveBeenCalledTimes(2);
    expect(policyCA).toHaveBeenCalledTimes(2);
    expect(policyCB).toHaveBeenCalledTimes(2);
    expect(policyD).toHaveBeenCalledTimes(4);

    // Check that $cacheKey exists and is an empty array
    expect(Array.isArray(Client.$cacheKey)).toBe(true);
    expect(Client.$cacheKey.length).toBe(0);
  });

  describe("keyMatchesPath", async () => {
    // Test cases for keyMatchesPath used in invalidate as list of test cases in format:
    // [key, "matches" | "does not match", path]
    const cases: [unknown[], "matches" | "does not match", unknown[]][] = [
      [["a"], "matches", ["a"]],
      [["a", "b"], "matches", ["a"]],
      [["a", "b"], "matches", ["a", "b"]],
      [["a", "b", "c"], "matches", ["a", "b"]],
      [["a", "b", "c"], "matches", ["a", "b", "c"]],
      [["a", "b", "c"], "does not match", ["a", "b", "d"]],
      [["a", "b"], "does not match", ["b"]],
      [["a"], "does not match", ["b"]],
      [["a", { id: 1 }], "matches", ["a"]],
      [["a", { id: 1 }], "matches", ["a", { id: 1 }]],
      [["a", { id: 1 }], "does not match", ["a", { id: 2 }]],
      [["d", { id: "1" }], "matches", ["d"]],
      [["d", { id: "1" }], "matches", ["d", { id: "1" }]],
      [["d", { id: "1" }], "does not match", ["d", { id: "2" }]],
    ];

    cases.forEach(([key, operator, path], idx) => {
      it(`keyMatchesPath case #${idx}: key=${JSON.stringify(key)}, path=${JSON.stringify(path)}`, () => {
        expect(KilpiClientCache.keyMatchesPath(key, path)).toBe(operator === "matches");
      });
    });

    it("empty path matches all keys", () => {
      for (const [key] of cases) {
        expect(KilpiClientCache.keyMatchesPath(key, [])).toBe(true);
      }
    });
  });

  it("should call hooks on cache events", async () => {
    const Client = init({ subject: { id: "1" } });

    const mockHook = vi.fn();
    Client.$hooks.onCacheInvalidate(() => {
      mockHook();
    });

    await expect(Client.a().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockHook).toHaveBeenCalledTimes(0);
    Client.$cache.invalidate();
    expect(mockHook).toHaveBeenCalledTimes(1);
  });
});
