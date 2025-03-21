import { describe, expect, it } from "vitest";
import { createKilpi, KilpiError } from "../src";
import type { TestDocument } from "./testUtils";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  advanced: { disableSubjectCaching: true },
});

describe("Kilpi.authorize", () => {
  const doc: TestDocument = { id: "doc1", userId: "user1" };
  const Denied = KilpiError.AuthorizationDenied;

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.authorize("public")).resolves.toBe(null);
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(Kilpi.authorize("public")).resolves.toMatchObject(subject);
    });
  });

  it("should deny and throw authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.authorize("authed")).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(Kilpi.authorize("authed")).resolves.toMatchObject(subject);
    });
  });

  it("should deny resource when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.authorize("docs:ownDocument", doc)).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should grant if owner of resource", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(Kilpi.authorize("docs:ownDocument", doc)).resolves.toMatchObject(subject);
    });
  });

  it("should deny if not owner of resource", async () => {
    await TestUtils.runAs({ id: "user2", roles: [] }, async () => {
      await expect(Kilpi.authorize("docs:ownDocument", doc)).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2", roles: [] }, async () => {
      expect(Kilpi.authorize("docs:deeply:nested:policy", doc)).rejects.toBeInstanceOf(Denied);
    });
  });
});
