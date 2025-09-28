import { createKilpi, Deny, Grant, KilpiError } from "src";
import { describe, expect, it } from "vitest";
import { TestingUtils } from "./TestingUtils";

describe("KilpiPolicy", () => {
  // Subject state
  const subjectState = TestingUtils.createSubjectState({ userId: "1" });

  // Testing utilities
  const Kilpi = createKilpi({
    async getSubject() {
      return subjectState.getSubject();
    },
    policies: {
      async always(subject) {
        return Grant(subject);
      },
      async never() {
        return Deny({ reason: "NEVER" });
      },
      posts: {
        async create(subject) {
          return subject ? Grant(subject) : Deny({ reason: "UNAUTHENTICATED" });
        },
        async delete(subject, post: { authorId: string }) {
          if (!subject) return Deny({ reason: "UNAUTHENTICATED" });
          if (subject.userId !== post.authorId) return Deny({ reason: "NOT_OWNER" });
          return Grant(subject);
        },
      },
    },
  });

  it("should return granted decision when evaluating allowed action", async () => {
    expect(await Kilpi.always().authorize()).toMatchObject({
      granted: true,
      subject: subjectState.getSubject(),
    });
  });

  it("should return granted decision when requiring allowed action", async () => {
    expect(await Kilpi.always().authorize().assert()).toMatchObject({
      granted: true,
      subject: subjectState.getSubject(),
    });
  });

  it("should return denied decision when evaluating disallowed action", async () => {
    expect(await Kilpi.never().authorize()).toMatchObject({
      granted: false,
      reason: "NEVER",
    });
  });

  it("should throw when requiring disallowed action", async () => {
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(
      KilpiError.Unauthorized,
    );
  });

  it("should work on nested policies", async () => {
    expect(await Kilpi.posts.create().authorize()).toMatchObject({
      granted: true,
      subject: subjectState.getSubject(),
    });
  });

  it("should deny when unauthenticated on nested policy", async () => {
    subjectState.setSubject(null);
    expect(await Kilpi.posts.create().authorize()).toMatchObject({
      granted: false,
      reason: "UNAUTHENTICATED",
    });
  });

  it("should allow passing objects", async () => {
    subjectState.setSubject({ userId: "1" });
    expect(await Kilpi.posts.delete({ authorId: "1" }).authorize()).toMatchObject({
      granted: true,
      subject: subjectState.getSubject(),
    });

    subjectState.setSubject({ userId: "1" });
    expect(await Kilpi.posts.delete({ authorId: "2" }).authorize()).toMatchObject({
      granted: false,
      reason: "NOT_OWNER",
    });
  });
});
