import { describe, expect, it } from "bun:test";
import { getPermission } from "../src";
import { TestDocument, TestUtils } from "./testUtils";

describe("should", () => {
  const resource: TestDocument = { id: "doc1", userId: "user1" };

  const resources_user1: TestDocument[] = [
    { id: "doc1", userId: "user1" },
    { id: "doc2", userId: "user1" },
  ];

  const resources_mixed: TestDocument[] = [
    { id: "doc3", userId: "user1" },
    { id: "doc4", userId: "user2" },
  ];

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "public",
        })
      ).resolves.toMatchObject({ granted: true, subject: null });
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "public",
        })
      ).resolves.toMatchObject({ granted: true, subject });
    });
  });

  it("should deny authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "authed",
        })
      ).resolves.toMatchObject({ granted: false, message: undefined });
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "authed",
        })
      ).resolves.toMatchObject({ granted: true, subject });
    });
  });

  it("should deny authed resource check when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).resolves.toMatchObject({ granted: false, message: undefined });
    });
  });

  it("should grant authed resource check when authed as correct user", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).resolves.toMatchObject({ granted: true, subject });
    });
  });

  it("should deny authed resource check when authed as incorrect user", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource,
        })
      ).resolves.toMatchObject({ granted: false, message: undefined });
    });
  });

  it("should grant array of owned resources", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource: resources_user1,
        })
      ).resolves.toMatchObject({ granted: true, subject });
    });
  });

  it("should deny array with non-owned resources", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:ownDocument",
          resource: resources_mixed,
        })
      ).resolves.toMatchObject({ granted: false, message: undefined });
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(
        getPermission({
          subject: TestUtils.getSubject,
          ruleset: TestUtils.ruleset,
          key: "docs:deeply:nested:rule",
          resource,
        })
      ).resolves.toMatchObject({ granted: false, message: undefined });
    });
  });
});
