import { createKilpi, Deny, Grant } from "src";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestingUtils, type TestingSubject } from "./TestingUtils";

describe("subjectCaching", () => {
  // Get subject mock
  const mockGetSubject = vi.fn();

  // Subject state
  const subjectState = TestingUtils.createSubjectState({ userId: "1" });

  // Testing utilities
  const Kilpi = createKilpi({
    async getSubject() {
      mockGetSubject();
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

  afterEach(() => {
    vi.clearAllMocks();
    Kilpi.$hooks.unregisterAll();
  });

  it("should always re-evaluate getSubject when no cache implemented", async () => {
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    expect(mockGetSubject).toHaveBeenCalledTimes(3);
  });

  it("should always re-evaluate getSubject when cache misses", async () => {
    Kilpi.$hooks.onSubjectRequestFromCache(() => null);
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    expect(mockGetSubject).toHaveBeenCalledTimes(3);
  });

  it("should always re-evaluate getSubject when cache misses", async () => {
    // Subject cache
    let subjectCache: null | { subject: TestingSubject } = null;
    Kilpi.$hooks.onSubjectResolved(({ subject }) => {
      subjectCache = { subject };
    });
    Kilpi.$hooks.onSubjectRequestFromCache(() => subjectCache);
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    await Kilpi.always().authorize();
    expect(mockGetSubject).toHaveBeenCalledTimes(1);
  });

  it("should always dismiss any changes in subject after first cache", async () => {
    // Mock hook
    const mockHook = vi.fn();
    Kilpi.$hooks.onSubjectResolved(mockHook);

    // Setup subject cache
    let subjectCache: null | { subject: TestingSubject } = null;
    Kilpi.$hooks.onSubjectResolved(({ subject }) => {
      subjectCache = { subject };
    });
    Kilpi.$hooks.onSubjectRequestFromCache(() => subjectCache);

    // Authorize 3 times with different states
    subjectState.setSubject({ userId: "a" });
    const s1 = await Kilpi.always().authorize().assert();
    subjectState.setSubject({ userId: "b" });
    const s2 = await Kilpi.always().authorize().assert();
    subjectState.setSubject(null);
    const s3 = await Kilpi.always().authorize().assert();

    // Expect to only have ran getSubject once
    expect(mockGetSubject).toHaveBeenCalledTimes(1);
    expect(s1.subject).toEqual({ userId: "a" });
    expect(s2.subject).toEqual({ userId: "a" });
    expect(s3.subject).toEqual({ userId: "a" });

    // Expect to see a resolved cached subject twice
    expect(mockHook).toHaveBeenCalledTimes(3);
    expect(mockHook).toHaveBeenNthCalledWith(1, {
      subject: { userId: "a" },
      fromCache: false,
      context: undefined,
    });
    expect(mockHook).toHaveBeenNthCalledWith(2, {
      subject: { userId: "a" },
      fromCache: true,
      context: undefined,
    });
    expect(mockHook).toHaveBeenNthCalledWith(3, {
      subject: { userId: "a" },
      fromCache: true,
      context: undefined,
    });
  });
});
