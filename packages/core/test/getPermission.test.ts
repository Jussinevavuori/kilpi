import { describe, expect, it } from "bun:test";
import type { TestDocument, TestSubject } from "./testUtils";
import { TestKilpi, TestUtils } from "./testUtils";

describe("getPermission", () => {
  const resource: TestDocument = { id: "doc1", userId: "user1" };

  const Denied = { granted: false, message: undefined };
  const Granted = (subject: TestSubject | null) => ({ granted: true, subject });

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.getPermission("public")).resolves.toMatchObject(Granted(null));
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.getPermission("public")).resolves.toMatchObject(Granted(subject));
    });
  });

  it("should deny authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.getPermission("authed")).resolves.toMatchObject(Denied);
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.getPermission("authed")).resolves.toMatchObject(Granted(subject));
    });
  });

  it("should deny authed resource check when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.getPermission("docs:ownDocument", resource)).resolves.toMatchObject(Denied);
    });
  });

  it("should grant authed resource check when authed as correct user", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.getPermission("docs:ownDocument", resource)).resolves.toMatchObject(
        Granted(subject),
      );
    });
  });

  it("should deny authed resource check when authed as incorrect user", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(TestKilpi.getPermission("docs:ownDocument", resource)).resolves.toMatchObject(Denied);
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(TestKilpi.getPermission("docs:deeply:nested:rule", resource)).resolves.toMatchObject(
        Denied,
      );
    });
  });
});
