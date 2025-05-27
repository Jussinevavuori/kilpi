import { createKilpi } from "src";
import { describe, expect, it } from "vitest";
import { TestUtils, type TestSubject } from "./testUtils";

type MockRequest = {
  cookies?: {
    userId?: string;
  };
};

async function getSubject(request?: MockRequest): Promise<TestSubject | null> {
  if (!request?.cookies?.userId) return null;
  return { id: request.cookies.userId, roles: ["user"] };
}

const Kilpi = createKilpi({
  getSubject,
  policies: TestUtils.policies,
});

describe("Kilpi.context", () => {
  it("should be unauthorized when no scope", async () => {
    const result = await Kilpi.isAuthorized("authed");
    expect(result).toBe(false);
  });
  it("should be unauthorized when no context in scope", async () => {
    await Kilpi.runInScope(async () => {
      const result = await Kilpi.isAuthorized("authed");
      expect(result).toBe(false);
    });
  });
  it("should be authorized when context provided via Kilpi.runInScope", async () => {
    await Kilpi.runInScope(
      async () => {
        const result = await Kilpi.isAuthorized("authed");
        expect(result).toBe(true);
      },
      { cookies: { userId: "2" } },
    );
  });
  it("should be authorized when context provided via Kilpi.scoped", async () => {
    const scopedFn = Kilpi.scoped(
      async () => {
        const result = await Kilpi.isAuthorized("authed");
        expect(result).toBe(true);
      },
      { cookies: { userId: "1" } },
    );
    await scopedFn();
  });
  it("should allow Kilpi.getContext", async () => {
    const context1 = Kilpi.getContext();
    expect(context1).toBeUndefined();

    await Kilpi.runInScope(async () => {
      const context2 = Kilpi.getContext();
      expect(context2).toBeUndefined();
    });

    await Kilpi.runInScope(
      async () => {
        const context3 = Kilpi.getContext();
        expect(context3).toEqual({ cookies: { userId: "1" } });
      },
      { cookies: { userId: "1" } },
    );
  });
});
