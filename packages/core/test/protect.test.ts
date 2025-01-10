import { describe, expect, it } from "bun:test";
import { KilpiError } from "../src";
import { TestDocument, TestKilpi, TestUtils } from "./testUtils";

describe("protect", () => {
  const doc: TestDocument = { id: "doc1", userId: "user1" };
  const Denied = KilpiError.PermissionDenied;

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.protect("public", null)).resolves.toBe(null);
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.protect("public", null)).resolves.toMatchObject(subject);
    });
  });

  it("should deny and throw authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.protect("authed", null)).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.protect("authed", null)).resolves.toMatchObject(subject);
    });
  });

  it("should deny resource when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      expect(TestKilpi.protect("docs:ownDocument", doc)).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should grant if owner of resource", async () => {
    await TestUtils.runAs({ id: "user1" }, async (subject) => {
      expect(TestKilpi.protect("docs:ownDocument", doc)).resolves.toMatchObject(subject);
    });
  });

  it("should deny if not owner of resource", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(TestKilpi.protect("docs:ownDocument", doc)).rejects.toBeInstanceOf(Denied);
    });
  });

  it("should work on deeply nested keys", async () => {
    await TestUtils.runAs({ id: "user2" }, async () => {
      expect(TestKilpi.protect("docs:deeply:nested:rule", doc)).rejects.toBeInstanceOf(Denied);
    });
  });
});
