import { KilpiCore } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestUtils } from "./testUtils";

// Create a vitest mock functions
const defaultFn = vi.fn();

// Test Kilpi instance
const Kilpi = new KilpiCore({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  defaults: { onUnauthorized: defaultFn },
});

describe("Kilpi.runWithContext", () => {
  beforeEach(() => defaultFn.mockReset());

  it("should use default values when no context is provided", async () => {
    expect(defaultFn).toHaveBeenCalledTimes(0);

    await expect(Kilpi.authorize("never")).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledTimes(1);
  });

  it("should fail to set value to context when no context provided", async () => {
    const overrideFn = vi.fn();

    Kilpi.onUnauthorized(overrideFn); // Should do nothing

    expect(defaultFn).toHaveBeenCalledTimes(0);
    expect(overrideFn).toHaveBeenCalledTimes(0);

    await expect(Kilpi.authorize("never")).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledTimes(1);
    expect(overrideFn).toHaveBeenCalledTimes(0);
  });

  it("should use override value from context when provided", async () => {
    const overrideFn = vi.fn();

    await Kilpi.runWithContext(async () => {
      Kilpi.onUnauthorized(overrideFn);

      expect(defaultFn).toHaveBeenCalledTimes(0);
      expect(overrideFn).toHaveBeenCalledTimes(0);

      await expect(Kilpi.authorize("never")).rejects.toThrowError();

      expect(defaultFn).toHaveBeenCalledTimes(0);
      expect(overrideFn).toHaveBeenCalledTimes(1);
    });
  });
});
