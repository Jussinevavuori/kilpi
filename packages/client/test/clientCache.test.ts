import { ClientCache } from "src/utils/ClientCache";
import { describe, expect, it } from "vitest";

describe("ClientCache", () => {
  it("handle key serialization", () => {
    const cache = new ClientCache();
    cache.set(["example", 1, true, { a: 1, b: 2 }], "value");
    expect(cache.get(["example", 1, true, { a: 1, b: 2 }])).toBe("value");
    expect(cache.get(["example", 1, true, { b: 2, a: 1 }])).toBe("value");
    expect(cache.get(["example", 1, true, { b: 2, a: 1, c: 3 }])).toBeUndefined();
    expect(cache.get(["example", 1, false, { a: 1, b: 2 }])).toBeUndefined();
  });

  it("handles cache expiry", async () => {
    const cache = new ClientCache();
    cache.set(["key"], "value", { ttlMs: 10 });
    expect(cache.get(["key"])).toBe("value");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cache.get(["key"])).toBeUndefined();
  });

  it("can clear the cache", () => {
    const cache = new ClientCache();
    cache.set(["key"], "value");
    expect(cache.get(["key"])).toBe("value");
    cache.clear();
    expect(cache.get(["key"])).toBeUndefined();
  });
});
