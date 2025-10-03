import { createKilpi, Grant, KilpiCore, type AnyKilpiCore } from "src";
import { createKilpiPlugin } from "src/KilpiPlugin";
import { describe, expect, it } from "vitest";

describe("plugin", () => {
  // Create testing plugin
  function TestPlugin<T extends AnyKilpiCore>() {
    let value = 0;
    let authorizationCount = 0;

    return createKilpiPlugin((Kilpi: T) => {
      Kilpi.$hooks.onAfterAuthorization(() => {
        authorizationCount++;
      });

      return {
        extendCore() {
          return {
            $test: {
              get() {
                return value;
              },
              set(v: number) {
                value = v;
              },
              countRootlevelPolicyKeys() {
                return Object.keys(KilpiCore.expose(Kilpi).policies).length;
              },
              getAuthorizationsCount() {
                return authorizationCount;
              },
            },
          };
        },
      };
    });
  }

  const Kilpi = createKilpi({
    // Placeholder
    getSubject: () => null,

    // 3 Placeholder policies to test access to Kilpi instance
    policies: {
      rootPolicy_1: (subject) => Grant(subject),
      rootPolicy_2: (subject) => Grant(subject),
      rootPolicy_3: (subject) => Grant(subject),
    },

    // Install test plugin
    plugins: [TestPlugin()],
  });

  it("should allow interacting via public interface with internal state", async () => {
    expect(Kilpi.$test.get()).toBe(0);
    Kilpi.$test.set(42);
    expect(Kilpi.$test.get()).toBe(42);
  });

  it("should allow accessing Kilpi instance", async () => {
    expect(Kilpi.$test.countRootlevelPolicyKeys()).toBe(3);
  });

  it("should allow accessing hooks", async () => {
    expect(Kilpi.$test.getAuthorizationsCount()).toBe(0);
    await Kilpi.rootPolicy_1().authorize();
    expect(Kilpi.$test.getAuthorizationsCount()).toBe(1);
    await Kilpi.rootPolicy_2().authorize();
    expect(Kilpi.$test.getAuthorizationsCount()).toBe(2);
    await Kilpi.rootPolicy_3().authorize();
    expect(Kilpi.$test.getAuthorizationsCount()).toBe(3);
  });
});
