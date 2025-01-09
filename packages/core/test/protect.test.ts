import { describe, expect, it } from "bun:test";
import { KilpiError, protect } from "../src";
import { TestDocument, TestUtils } from "./testUtils";

describe("protect", () => {
  const resource: TestDocument = { id: "doc1", userId: "user1" };

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "public",
        })
      ).resolves.toBe(null);
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "public",
        })
      ).resolves.toMatchObject(subject);
    });
  });

  it("should deny and throw authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "authed",
        })
      ).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "authed",
        })
      ).resolves.toMatchObject(subject);
    });
  });

  it("should deny resource when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });
  });

  it("should grant if owner of resource", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).resolves.toMatchObject(subject);
    });
  });

  it("should deny if not owner of resource", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(
        protect({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:deeply:nested:rule",
          resource,
        })
      ).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });
  });
});
