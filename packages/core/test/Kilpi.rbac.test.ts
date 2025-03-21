import { describe } from "node:test";
import { createKilpi, Policy } from "src";
import { expect, it } from "vitest";
import { TestUtils, type TestSubject } from "./testUtils";

// Rbac policy
const RbacPolicy = Policy.rbac((subject: TestSubject | null) => {
  if (!subject) return null;
  return { subject, roles: subject.roles };
});

const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: {
    documents: {
      read: RbacPolicy("admin", "user", "guest"),
      create: RbacPolicy("admin", "user"),
      delete: RbacPolicy("admin"),
    },
  },
});

describe("Policy.rbac", () => {
  it("should pass when user has any of the roles", async () => {
    const user = { id: "1", roles: ["admin" as const] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("documents:read")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("documents:create")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("documents:delete")).resolves.toMatchObject(user);
    });
  });
  it("should fail when user has none of the roles", async () => {
    const user = { id: "1", roles: ["user" as const] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("documents:read")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("documents:create")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("documents:delete")).rejects.toThrowError();
    });
  });
  it("should fail when user has no roles", async () => {
    const user = { id: "1", roles: [] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("documents:read")).rejects.toThrowError();
      await expect(Kilpi.authorize("documents:create")).rejects.toThrowError();
      await expect(Kilpi.authorize("documents:delete")).rejects.toThrowError();
    });
  });
});
