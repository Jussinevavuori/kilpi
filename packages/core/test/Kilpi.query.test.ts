import { describe, expect, it } from "vitest";
import { createKilpi, KilpiError } from "../src";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  advanced: {
    disableSubjectCaching: true,
  },
});

describe("Kilpi.query", async () => {
  /**
   * Get a document by ID, protected by the "docs:ownDocument" policy
   */
  const getDoc = Kilpi.query(
    async (id: string) => await TestUtils.getDocument(id),
    {
      async protector({ output }) {
        await Kilpi.authorize("docs:ownDocument", output);
        return output;
      },
    },
  );

  /**
   * Get a document by ID, only returns userId if own document.
   */
  const getPublicRedactedDoc = Kilpi.query(
    async (id: string) => await TestUtils.getDocument(id),
    {
      async protector({ output, subject }) {
        if (output.userId === subject?.id) return output;
        return { id: output.id };
      },
    },
  );

  /**
   * Get a document by ID, only returns userId if own document.
   */
  const getDocs = Kilpi.query(async () => await TestUtils.listAllDocuments(), {
    async protector({ output, subject }) {
      return output.filter((_) => _.userId === subject?.id);
    },
  });

  const doc1 = await getDoc.unsafe("doc1");

  await it("unsafe call always resolves", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc.unsafe("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(getDoc.unsafe("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc.unsafe("doc1")).resolves.toMatchObject(doc1);
    });
  });

  await it("safe call resolves or returns null with custom catch", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc.protect("doc1").catch(() => null)).resolves.toBe(
        null,
      );
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(
        getDoc.protect("doc1").catch(() => null),
      ).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc.protect("doc1").catch(() => null)).resolves.toBe(
        null,
      );
    });
  });

  await it("protect call resolves or throws", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(
        KilpiError.AuthorizationDenied,
      );
    });

    await TestUtils.runAs({ id: "user1" }, async () => {
      await expect(getDoc.protect("doc1")).resolves.toMatchObject(doc1);
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(
        KilpiError.AuthorizationDenied,
      );
    });
  });

  await it("protect call respects onDeny", async () => {
    await Kilpi.runInScope(async () => {
      Kilpi.onUnauthorized(({ message }) => {
        throw new TestUtils.TestErrorClass(message);
      });
      await TestUtils.runAs(null, async () => {
        await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(
          TestUtils.TestErrorClass,
        );
      });
      await TestUtils.runAs({ id: "user1" }, async () => {
        await expect(getDoc.protect("doc1")).resolves.toMatchObject(doc1);
      });
      await TestUtils.runAs({ id: "user2" }, async () => {
        await expect(getDoc.protect("doc1")).rejects.toBeInstanceOf(
          TestUtils.TestErrorClass,
        );
      });
    });
  });

  await it("redacts when not protected", async () => {
    await TestUtils.runAs(null, async () => {
      const doc = await getPublicRedactedDoc.protect("doc1");
      expect(doc).toMatchObject({ id: doc1.id });
      expect(doc).not.toHaveProperty("userId");
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      const doc = await getPublicRedactedDoc.protect("doc1");
      expect(doc).toMatchObject(doc1);
      expect(doc).toHaveProperty("userId");
    });
    await TestUtils.runAs({ id: "user2" }, async () => {
      const doc = await getPublicRedactedDoc.protect("doc1");
      expect(doc).toMatchObject({ id: doc1.id });
      expect(doc).not.toHaveProperty("userId");
    });
    await TestUtils.runAs(null, async () => {
      const docs = await getDocs.protect();
      expect(docs).toHaveLength(0);
    });
    await TestUtils.runAs({ id: "user1" }, async () => {
      const docs = await getDocs.protect();
      expect(docs).toHaveLength(3);
      for (const doc of docs) expect(doc).toMatchObject({ userId: "user1" });
    });
  });

  await it("doesnt redact with unsafe", async () => {
    await TestUtils.runAs(null, async () => {
      const doc = await getPublicRedactedDoc.unsafe("doc1");
      expect(doc).toMatchObject(doc1);
      expect(doc).toHaveProperty("userId");
    });
    await TestUtils.runAs(null, async () => {
      const docs = await getDocs.unsafe();
      expect(docs).toHaveLength(6);
    });
  });
});
