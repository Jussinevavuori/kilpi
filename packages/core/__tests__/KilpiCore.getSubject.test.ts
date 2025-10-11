import { createKilpi } from "src";
import { beforeEach, describe, expect, it } from "vitest";
import { TestingUtils } from "./TestingUtils";

describe("Kilpi.$getSubject", () => {
  const DEFAULT_USER = { userId: "1" };

  // Subject state
  const subjectState = TestingUtils.createSubjectState(DEFAULT_USER);

  // Testing utilities
  const Kilpi = createKilpi({
    async getSubject() {
      return subjectState.getSubject();
    },
    policies: {},
  });

  beforeEach(() => {
    subjectState.setSubject(DEFAULT_USER);
  });

  it("should return the subject", async () => {
    expect(await Kilpi.$getSubject()).toMatchObject(DEFAULT_USER);

    // Change subject
    const newUser = { userId: "2" };
    subjectState.setSubject(newUser);
    expect(await Kilpi.$getSubject()).toMatchObject(newUser);

    // Sign out
    subjectState.setSubject(null);
    expect(await Kilpi.$getSubject()).toBeNull();
  });

  it("should respect cache", async () => {
    // Setup subject cache
    let subjectCache: null | { subject: typeof DEFAULT_USER | null } = null;
    Kilpi.$hooks.onSubjectResolved(({ subject }) => {
      subjectCache = { subject };
    });
    Kilpi.$hooks.onSubjectRequestFromCache(() => subjectCache);

    // Authorize 3 times with different states
    subjectState.setSubject({ userId: "a" });
    const s1 = await Kilpi.$getSubject();
    subjectState.setSubject({ userId: "b" });
    const s2 = await Kilpi.$getSubject();
    subjectState.setSubject(null);
    const s3 = await Kilpi.$getSubject();

    // Expect to only have ran getSubject once
    expect(s1).toEqual({ userId: "a" });
    expect(s2).toEqual({ userId: "a" });
    expect(s3).toEqual({ userId: "a" });
  });

  it("should pass context to getSubject", async () => {
    // Testing utilities
    const Kilpi = createKilpi({
      async getSubject(ctx?: { cookies?: string }) {
        if (!ctx?.cookies) return null;
        return { userId: ctx.cookies };
      },
      policies: {},
    });

    expect(await Kilpi.$getSubject()).toBeNull();
    expect(await Kilpi.$getSubject({ ctx: { cookies: "a" } })).toMatchObject({ userId: "a" });
  });
});
