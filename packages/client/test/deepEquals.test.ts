import { deepEquals } from "src/utils/deepEquals";
import { describe, expect, it } from "vitest";

describe("deepObjectEquals", () => {
  it("compares primitives", () => {
    expect(deepEquals(1, 1)).toBe(true);
    expect(deepEquals(1, 2)).toBe(false);
    expect(deepEquals(1, "test")).toBe(false);
    expect(deepEquals("test", "test")).toBe(true);
    expect(deepEquals("test", "testx")).toBe(false);
  });

  it("shallow compares objects", () => {
    const ref = {};
    const a = { id: "1", name: "2", ref };
    const b = { ref, id: "1", name: "2" };

    expect(deepEquals(a, b)).toBe(true);
    expect(deepEquals(a, { id: "1", ref })).toBe(false);
    expect(deepEquals(a, { id: "1", name: "2", ref, extra: true })).toBe(false);
  });

  it("compares arrays", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    const c = [1, 2, 3, 4];

    expect(deepEquals(a, b)).toBe(true);
    expect(deepEquals(a, c)).toBe(false);
  });

  it("compares nested objects & arrays", () => {
    const a = { id: "1", name: "2", nested: { id: "3", name: "4", array: [1, 2, 3] } };
    const b = { id: "1", name: "2", nested: { id: "3", name: "4", array: [1, 2, 3] } };
    const c = { id: "1", name: "2", nested: { id: "3", name: "4", array: [1, 2, 3, 4] } };
    const d = { id: "1", name: "2", nested: { id: "3", name: "4", array: [1, 2, 3] } };

    expect(deepEquals(a, b)).toBe(true);
    expect(deepEquals(a, c)).toBe(false);
    expect(deepEquals(a, d)).toBe(true);
  });
});
