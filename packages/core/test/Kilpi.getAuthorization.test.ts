import { createKilpi } from "src";
import { describe, expect, it } from "vitest";
import type { TestDocument, TestSubject } from "./testUtils";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  advanced: { disableSubjectCaching: true },
});

describe("Kilpi.getAuthorization", () => {
  const resource: TestDocument = { id: "doc1", userId: "user1" };

  const Denied = { granted: false, message: undefined };
  const Granted = (subject: TestSubject | null) => ({ granted: true, subject });

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.getAuthorization("public")).resolves.toMatchObject(
        Granted(null),
      );
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      await expect(Kilpi.getAuthorization("public")).resolves.toMatchObject(
        Granted(subject),
      );
    });
  });

  it("should deny authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.getAuthorization("authed")).resolves.toMatchObject(
        Denied,
      );
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      await expect(Kilpi.getAuthorization("authed")).resolves.toMatchObject(
        Granted(subject),
      );
    });
  });

  it("should deny authed resource check when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(
        Kilpi.getAuthorization("docs:ownDocument", resource),
      ).resolves.toMatchObject(Denied);
    });
  });

  it("should grant authed resource check when authed as correct user", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      await expect(
        Kilpi.getAuthorization("docs:ownDocument", resource),
      ).resolves.toMatchObject(Granted(subject));
    });
  });

  it("should deny authed resource check when authed as incorrect user", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(
        Kilpi.getAuthorization("docs:ownDocument", resource),
      ).resolves.toMatchObject(Denied);
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(
        Kilpi.getAuthorization("docs:deeply:nested:policy", resource),
      ).resolves.toMatchObject(Denied);
    });
  });
});
