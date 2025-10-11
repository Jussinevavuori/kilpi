import { createKilpi, Deny, Grant } from "src";
import { describe, expect, it, vi } from "vitest";
import { TestingUtils } from "./TestingUtils";

describe("KilpiHooks", () => {
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

  it("should allow registering and unregistering KilpiOnAfterAuthorizationHook", async () => {
    // Register hook
    const mockHook = vi.fn();
    const unregister = Kilpi.$hooks.onAfterAuthorization(mockHook);

    // Call hook once
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith({
      action: "always",
      subject: subjectState.getSubject(),
      object: undefined,
      decision: {
        granted: true,
        subject: subjectState.getSubject(),
      },
    });

    // Unregister and expect to not be called again
    unregister();
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(1);
  });

  it("should allow registering and unregistering KilpiOnSubjectResolvedHook", async () => {
    // NOTE: Subject caching is tested in subjectCaching.test.ts in more detail

    // Register hook
    const mockHook = vi.fn();
    const unregister = Kilpi.$hooks.onSubjectResolved(mockHook);

    // Call hook once
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith({
      subject: subjectState.getSubject(),
      fromCache: false,
      context: undefined,
    });

    // Sign out and call again
    subjectState.setSubject(null);
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(2);
    expect(mockHook).toHaveBeenCalledWith({
      subject: null,
      fromCache: false,
      context: undefined,
    });

    // Unregister and expect to not be called again
    unregister();
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(2);
  });

  it("should allow registering and unregistering KilpiOnSubjectRequestFromCacheHook", async () => {
    // NOTE: Subject caching is tested in subjectCaching.test.ts in more detail

    // Register hook
    const mockHook = vi.fn();
    const unregister = Kilpi.$hooks.onSubjectRequestFromCache(mockHook);

    // Call hook once
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith({ context: undefined });

    // Call again and expect to be called again
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(2);
    expect(mockHook).toHaveBeenCalledWith({ context: undefined });

    // Unregister and expect to not be called again
    unregister();
    await Kilpi.always().authorize();
    expect(mockHook).toHaveBeenCalledTimes(2);
  });

  it("should allow registering and unregistering KilpiOnUnauthorizedAssertHook", async () => {
    // Register hook
    const mockHook = vi.fn();
    const unregister = Kilpi.$hooks.onUnauthorizedAssert(mockHook);

    // Call hook once
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith({
      action: "never",
      subject: subjectState.getSubject(),
      object: undefined,
      decision: {
        granted: false,
        reason: "NEVER",
      },
    });

    // Unregister and expect to not be called again
    unregister();
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(mockHook).toHaveBeenCalledTimes(1);
  });

  it("should allow throwing custom errors in KilpiOnUnauthorizedAssertHook", async () => {
    // Register hook
    const unregister = Kilpi.$hooks.onUnauthorizedAssert(() => {
      throw new Error("Custom error from hook");
    });

    // Call hook once
    await expect(Kilpi.never().authorize().assert()).rejects.toThrow("Custom error from hook");

    // Unregister and expect to not be called again
    unregister();
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
  });

  it("should allow registering all hooks with unregisterAll", async () => {
    // Register hooks
    const onAfterAuthorization_1 = vi.fn();
    const onAfterAuthorization_2 = vi.fn();
    const onSubjectResolved_1 = vi.fn();
    const onSubjectResolved_2 = vi.fn();
    const onSubjectRequestFromCache_1 = vi.fn();
    const onSubjectRequestFromCache_2 = vi.fn();
    const onUnauthorizedAssert_1 = vi.fn();
    const onUnauthorizedAssert_2 = vi.fn();
    Kilpi.$hooks.onAfterAuthorization(onAfterAuthorization_1);
    Kilpi.$hooks.onAfterAuthorization(onAfterAuthorization_2);
    Kilpi.$hooks.onSubjectResolved(onSubjectResolved_1);
    Kilpi.$hooks.onSubjectResolved(onSubjectResolved_2);
    Kilpi.$hooks.onSubjectRequestFromCache(onSubjectRequestFromCache_1);
    Kilpi.$hooks.onSubjectRequestFromCache(onSubjectRequestFromCache_2);
    Kilpi.$hooks.onUnauthorizedAssert(onUnauthorizedAssert_1);
    Kilpi.$hooks.onUnauthorizedAssert(onUnauthorizedAssert_2);

    // Call hooks once
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(1);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(1);

    // Unregister all and expect to not be called again
    Kilpi.$hooks.unregisterAll();
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(1);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(1);
  });

  it("should allow unregistering all hooks of a specific type with unregisterAll", async () => {
    // Register hooks
    const onAfterAuthorization_1 = vi.fn();
    const onAfterAuthorization_2 = vi.fn();
    const onSubjectResolved_1 = vi.fn();
    const onSubjectResolved_2 = vi.fn();
    const onSubjectRequestFromCache_1 = vi.fn();
    const onSubjectRequestFromCache_2 = vi.fn();
    const onUnauthorizedAssert_1 = vi.fn();
    const onUnauthorizedAssert_2 = vi.fn();
    Kilpi.$hooks.onAfterAuthorization(onAfterAuthorization_1);
    Kilpi.$hooks.onAfterAuthorization(onAfterAuthorization_2);
    Kilpi.$hooks.onSubjectResolved(onSubjectResolved_1);
    Kilpi.$hooks.onSubjectResolved(onSubjectResolved_2);
    Kilpi.$hooks.onSubjectRequestFromCache(onSubjectRequestFromCache_1);
    Kilpi.$hooks.onSubjectRequestFromCache(onSubjectRequestFromCache_2);
    Kilpi.$hooks.onUnauthorizedAssert(onUnauthorizedAssert_1);
    Kilpi.$hooks.onUnauthorizedAssert(onUnauthorizedAssert_2);

    // Call hooks once
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(1);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(1);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(1);

    // Unregister all of type onSubjectResolved and expect to not be called again
    Kilpi.$hooks.unregisterAll("onSubjectResolved");
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(2);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(2);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(2);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(2);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(2);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(2);

    // Unregister all of type onUnauthorizedAssert and expect to not be called again
    Kilpi.$hooks.unregisterAll("onUnauthorizedAssert");
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(3);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(3);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(3);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(3);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(2);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(2);

    // Unregister all of type onAfterAuthorization and expect to not be called again
    Kilpi.$hooks.unregisterAll("onAfterAuthorization");
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(3);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(3);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(4);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(4);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(2);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(2);

    // Unregister all of type onSubjectRequestFromCache and expect to not be called again
    Kilpi.$hooks.unregisterAll("onSubjectRequestFromCache");
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(Error);
    expect(onAfterAuthorization_1).toHaveBeenCalledTimes(3);
    expect(onAfterAuthorization_2).toHaveBeenCalledTimes(3);
    expect(onSubjectResolved_1).toHaveBeenCalledTimes(1);
    expect(onSubjectResolved_2).toHaveBeenCalledTimes(1);
    expect(onSubjectRequestFromCache_1).toHaveBeenCalledTimes(4);
    expect(onSubjectRequestFromCache_2).toHaveBeenCalledTimes(4);
    expect(onUnauthorizedAssert_1).toHaveBeenCalledTimes(2);
    expect(onUnauthorizedAssert_2).toHaveBeenCalledTimes(2);
  });

  it("should run all onUnauthorizedAssert handlers before throwing", async () => {
    // Create custom error type to distinguish from other errors
    class HookError extends Error {}

    // Register multiple hooks
    const mock1 = vi.fn();
    Kilpi.$hooks.onUnauthorizedAssert((decision) => {
      mock1(decision);
      throw new HookError("First");
    });

    const mock2 = vi.fn();
    Kilpi.$hooks.onUnauthorizedAssert((decision) => {
      mock2(decision);
      throw new HookError("Second");
    });

    // Run and expect both handlers to have ran, and either error to be thrown
    await expect(Kilpi.never().authorize().assert()).rejects.toBeInstanceOf(HookError);
    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(1);

    // Run with custom onUnauthorized and expect it's error to be prioritized,
    // and all handlers to have ran
    class PriorityError extends Error {}
    const mock3 = vi.fn();
    await expect(
      Kilpi.never()
        .authorize()
        .assert((decision) => {
          mock3(decision);
          throw new PriorityError("Priority");
        }),
    ).rejects.toBeInstanceOf(PriorityError);
    expect(mock1).toHaveBeenCalledTimes(2);
    expect(mock2).toHaveBeenCalledTimes(2);
    expect(mock3).toHaveBeenCalledTimes(1);
  });
});
