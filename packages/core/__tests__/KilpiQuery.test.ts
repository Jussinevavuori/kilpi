import { createKilpi, Deny, Grant, KilpiError } from "src";
import { describe, expect, it } from "vitest";
import { TestingUtils } from "./TestingUtils";

describe("KilpiQuery", () => {
  // Subject state
  const subjectState = TestingUtils.createSubjectState({ userId: "1" });

  // Testing utilities
  const Kilpi = createKilpi({
    async getSubject() {
      return subjectState.getSubject();
    },
    policies: {
      async authed(subject) {
        return subject ? Grant(subject) : Deny({ reason: "UNAUTHENTICATED" });
      },
    },
  });

  // =============================================
  // TEST UNAUTHORIZED QUERIES
  // =============================================

  const listPosts = Kilpi.$query(async () => {
    return [
      { id: "post1", authorId: "1", content: "Hello World" },
      { id: "post2", authorId: "2", content: "Kilpi is awesome!" },
    ];
  });

  it("should return output without authorization", async () => {
    await expect(listPosts.unauthorized()).resolves.toHaveLength(2);
  });

  // =============================================
  // TEST THROWING QUERIES
  // =============================================

  const getPost = Kilpi.$query(
    async (postId: string) => {
      return { id: postId, authorId: "1", content: "Hello World" };
    },
    {
      async authorize({ output }) {
        await Kilpi.authed().authorize().assert();
        return output;
      },
    },
  );

  it("should return output if authorized (with throwing)", async () => {
    subjectState.setSubject({ userId: "1" });
    await expect(getPost.authorized("post1")).resolves.toMatchObject({ id: "post1" });
  });

  it("should throw if unauthorized (with throwing)", async () => {
    subjectState.setSubject(null);
    await expect(getPost.authorized("post1")).rejects.toThrowError(KilpiError.Unauthorized);
  });

  it("should allow skipping authorization (with throwing)", async () => {
    subjectState.setSubject(null);
    await expect(getPost.unauthorized("post1")).resolves.toMatchObject({ id: "post1" });
  });

  // =============================================
  // TEST REDACTING QUERIES
  // =============================================

  // Example which returns redacted output when unauthorized
  const getUserData = Kilpi.$query(
    async (userId: string) => {
      return { userId, password: "supersecret", internal: "never-reveal" };
    },
    {
      async authorize({ output, subject }) {
        if (subject && subject.userId === output.userId) {
          return { userId: output.userId, password: output.password };
        }
        return { userId: output.userId };
      },
    },
  );

  it("should return full output if authorized (with redaction)", async () => {
    subjectState.setSubject({ userId: "1" });
    const userData = await getUserData.authorized("1");
    expect(userData).toEqual({ userId: "1", password: "supersecret" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((userData as any).internal).toBeUndefined();
  });

  it("should return redacted output if unauthorized (with redaction)", async () => {
    subjectState.setSubject({ userId: "2" });
    const userData = await getUserData.authorized("1");
    expect(userData).toEqual({ userId: "1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((userData as any).password).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((userData as any).internal).toBeUndefined();
  });

  it("should allow skipping authorization and seeing raw output (with redaction)", async () => {
    subjectState.setSubject(null);
    const userData = await getUserData.unauthorized("1");
    expect(userData).toEqual({ userId: "1", password: "supersecret", internal: "never-reveal" });
  });

  // =============================================
  // TEST THROWING CUSTOM ERRORS
  // =============================================

  const getSecretData = Kilpi.$query(
    async () => {
      return { secret: "42" };
    },
    {
      async authorize({ subject, output }) {
        if (subject?.userId === "123") {
          throw new Error("Access denied to you specifically");
        }
        return output;
      },
    },
  );

  it("should return output if authorized (with throwing custom error)", async () => {
    subjectState.setSubject({ userId: "1" });
    await expect(getSecretData.authorized()).resolves.toMatchObject({ secret: "42" });
    subjectState.setSubject(null);
    await expect(getSecretData.authorized()).resolves.toMatchObject({ secret: "42" });
    subjectState.setSubject({ userId: "123" });
    await expect(getSecretData.authorized()).rejects.toThrowError(
      "Access denied to you specifically",
    );
  });
});
