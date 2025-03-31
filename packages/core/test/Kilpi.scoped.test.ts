import { createKilpi } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestUtils } from "./testUtils";

// Create a vitest mock functions
const defaultFn = vi.fn();

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  defaults: { onUnauthorized: defaultFn },
});

describe("Kilpi.scoped", () => {
  beforeEach(() => defaultFn.mockReset());

  it("should use default values when no scope is provided", async () => {
    expect(defaultFn).not.toHaveBeenCalled();

    await expect(Kilpi.authorize("never")).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledOnce();
  });

  it("should fail to set value to scope when no scope provided", async () => {
    const overrideFn = vi.fn();

    Kilpi.onUnauthorized(overrideFn); // Should do nothing

    expect(defaultFn).not.toHaveBeenCalled();
    expect(overrideFn).not.toHaveBeenCalled();

    await expect(Kilpi.authorize("never")).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledOnce();
    expect(overrideFn).not.toHaveBeenCalled();
  });

  it("should use override value from scope when provided", async () => {
    const overrideFn = vi.fn(() => {
      throw new Error("Unauthorized");
    });

    const scopedFn = Kilpi.scoped(async (arg1: number, arg2 = 1) => {
      Kilpi.onUnauthorized(overrideFn);

      expect(overrideFn).not.toHaveBeenCalled();
      expect(defaultFn).not.toHaveBeenCalled();

      await expect(Kilpi.authorize("never")).rejects.toThrowError();

      expect(overrideFn).toHaveBeenCalledOnce();
      expect(defaultFn).not.toHaveBeenCalled();

      return arg1 + arg2;
    });

    const sum = await scopedFn(3);
    expect(sum).toBe(4); // 3 + 1
  });
});
