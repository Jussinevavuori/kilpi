import { describe } from "node:test";
import { createKilpi } from "src";
import { expect, it } from "vitest";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const KilpiWithoutCaching = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  advanced: { disableSubjectCaching: true },
});

const KilpiWithCaching = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
});

describe("Kilpi.subjectCaching", () => {
  it("should cache the current subject in the current scope", async () => {
    const Kilpi = KilpiWithCaching;

    // Should not be cached, not in scope
    await TestUtils.runAs({ id: "1" }, async () => {
      expect(await Kilpi.getSubject()).toMatchObject({ id: "1" });
    });

    // Provide scope
    await Kilpi.runInScope(async () => {
      // Should be cached, in scope
      await TestUtils.runAs({ id: "2" }, async () => {
        expect(await Kilpi.getSubject()).toMatchObject({ id: "2" });
      });

      // Should not override previous cache
      await TestUtils.runAs({ id: "3" }, async () => {
        expect(await Kilpi.getSubject()).toMatchObject({ id: "2" });
      });
    });

    // Should not use cached value when exiting scope
    await TestUtils.runAs({ id: "4" }, async () => {
      expect(await Kilpi.getSubject()).toMatchObject({ id: "4" });
    });
  });
  it("should cache even a falsy subject", async () => {
    const Kilpi = KilpiWithCaching;

    // Provide scope
    await Kilpi.runInScope(async () => {
      // Should be cached, in scope
      await TestUtils.runAs(null, async () => {
        expect(await Kilpi.getSubject()).toBeNull();
      });

      // Should not override previous cache
      await TestUtils.runAs({ id: "3" }, async () => {
        expect(await Kilpi.getSubject()).toBeNull();
      });
    });
  });

  it("should not cache the current subject in the current scope when advanced.disableSubjectCaching", async () => {
    const Kilpi = KilpiWithoutCaching;

    // Provide scope
    await Kilpi.runInScope(async () => {
      await TestUtils.runAs({ id: "a" }, async () => {
        expect(await Kilpi.getSubject()).toMatchObject({ id: "a" });
      });
      await TestUtils.runAs({ id: "b" }, async () => {
        expect(await Kilpi.getSubject()).toMatchObject({ id: "b" });
      });
    });
  });
});
