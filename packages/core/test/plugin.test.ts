import { describe } from "node:test";
import { createKilpi, type AnyKilpiCore } from "src";
import { createKilpiPlugin } from "src/KilpiPlugin";
import type { KilpiScope } from "src/KilpiScope";
import { expect, it, vi } from "vitest";
import { TestUtils } from "./testUtils";

export function TestPlugin<T extends AnyKilpiCore>() {
  let value = 0;

  const scope: KilpiScope<T> = {};

  return createKilpiPlugin((Kilpi: T) => {
    Kilpi.hooks.onRequestScope(() => scope);

    return Kilpi.extend({
      test: {
        get() {
          return value;
        },
        set(v: number) {
          value = v;
        },
      },
    });
  });
}

const defaultFn = vi.fn(() => {
  throw new Error("Unauthorized");
});

const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  defaults: { onUnauthorized: defaultFn },
  plugins: [TestPlugin()],
});

describe("plugin", () => {
  it("should provide a scope automatically", async () => {
    const overrideFn = vi.fn(() => {
      throw new Error("Unauthorized");
    });

    Kilpi.onUnauthorized(overrideFn);

    expect(overrideFn).not.toHaveBeenCalled();
    expect(defaultFn).not.toHaveBeenCalled();

    await expect(Kilpi.authorize("never")).rejects.toThrowError();

    expect(overrideFn).toHaveBeenCalledOnce();
    expect(defaultFn).not.toHaveBeenCalled();
  });

  it("should be overridden by explicit scope", async () => {
    const pluginOverrideFn = vi.fn(() => {
      throw new Error("Unauthorized");
    });
    const explicitOverrideFn = vi.fn(() => {
      throw new Error("Unauthorized");
    });

    Kilpi.onUnauthorized(pluginOverrideFn);

    await Kilpi.runInScope(async () => {
      Kilpi.onUnauthorized(explicitOverrideFn);

      expect(pluginOverrideFn).not.toHaveBeenCalled();
      expect(explicitOverrideFn).not.toHaveBeenCalled();
      expect(defaultFn).not.toHaveBeenCalled();

      await expect(Kilpi.authorize("never")).rejects.toThrowError();

      expect(pluginOverrideFn).not.toHaveBeenCalled();
      expect(defaultFn).not.toHaveBeenCalled();
      expect(explicitOverrideFn).toHaveBeenCalledOnce();
    });
  });

  it("should allow interacting via public interface", async () => {
    expect(Kilpi.test.get()).toBe(0);
    Kilpi.test.set(42);
    expect(Kilpi.test.get()).toBe(42);
  });
});
