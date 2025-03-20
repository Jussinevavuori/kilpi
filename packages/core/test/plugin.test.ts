import { describe } from "node:test";
import type { KilpiCore } from "src";
import { createKilpi, KilpiPlugin, type Policyset } from "src";
import type { ExtendedKilpiScope } from "src/kilpi-scope";
import { expect, it, vi } from "vitest";
import { TestUtils } from "./testUtils";

type TestPluginInterface = {
  test: {
    set: (value: number) => void;
    get: () => number;
  };
};

type TestPluginScopeExtension = {
  test_value: number;
};

export function TestPlugin<TSubject, TPolicyset extends Policyset<TSubject>>() {
  return function TestPluginFactory(_Kilpi: KilpiCore<TSubject, TPolicyset>) {
    // Internal scope with extension
    const _scope: ExtendedKilpiScope<
      TSubject,
      TPolicyset,
      TestPluginScopeExtension
    > = {
      test_value: 0,
    };

    return new KilpiPlugin<
      TSubject,
      TPolicyset,
      TestPluginInterface,
      TestPluginScopeExtension
    >({
      name: "TestPlugin",

      // Automatically provide a global scope
      getScope() {
        return _scope;
      },

      // Custom interface for interacting with the plugin
      interface: {
        test: {
          set(value: number) {
            _scope.test_value = value;
          },
          get() {
            return _scope.test_value ?? 0;
          },
        },
      },
    });
  };
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
