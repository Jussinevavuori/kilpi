import { createKilpi, Deny, Grant } from "src";
import { describe, expect, it } from "vitest";

describe("context", () => {
  // Testing utilities
  const Kilpi = createKilpi({
    async getSubject(ctx?: { cookie?: string }) {
      if (ctx?.cookie) {
        return { userId: ctx.cookie };
      }
      return null;
    },
    policies: {
      posts: {
        async list(subject) {
          return subject?.userId === "superadmin"
            ? Grant(subject)
            : Deny({ reason: "UNAUTHORIZED" });
        },
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

  it("should be unauthorized when no context provided", async () => {
    const decision = await Kilpi.posts.create().authorize();
    expect(decision.granted).toBe(false);
  });

  it("should be unauthorized when invalid context provided", async () => {
    const decision1 = await Kilpi.posts.list().authorize({ ctx: undefined });
    expect(decision1.granted).toBe(false);

    const decision2 = await Kilpi.posts.list().authorize({ ctx: { cookie: undefined } });
    expect(decision2.granted).toBe(false);

    const decision3 = await Kilpi.posts.list().authorize({ ctx: { cookie: "regular-user" } });
    expect(decision3.granted).toBe(false);
  });

  it("should be authorized when valid context provided", async () => {
    const decision = await Kilpi.posts.list().authorize({ ctx: { cookie: "superadmin" } });
    expect(decision.granted).toBe(true);
  });
});
