import { describe, expect, it } from "bun:test";
import { KilpiError } from "../src";
import { TestKilpi, TestUtils } from "./testUtils";

describe("createQuery", async () => {
  /**
   * Get a document by ID, protected by the "docs:ownDocument" rule
   */
  const getDoc = TestKilpi.createProtectedQuery(
    async (id: string) => await TestUtils.getDocument(id),
    (doc, id) => TestKilpi.protect("docs:ownDocument", doc)
  );

  const doc1 = await getDoc("doc1");

  await it("without protect call, should return document regardless of auth", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(getDoc("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc("doc1")).resolves.toMatchObject(doc1);
    });
  });

  await it("with safe call, should return null if unauthorized", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc.safe("doc1")).resolves.toBe(null);
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(getDoc.safe("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc.safe("doc1")).resolves.toBe(null);
    });
  });

  await it("with protect call, should throw if unauthorized", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });

    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(getDoc.protect("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(KilpiError.PermissionDenied);
    });
  });
});
