import { createKilpi } from "src";
import { createRbacPolicy } from "src/createRbacPolicy";
import { describe, expect, it } from "vitest";
import { TestUtils, type TestSubject } from "./testUtils";

// Rbac policy
const RbacPolicy = createRbacPolicy((subject: TestSubject | null) => {
  if (!subject) return null;
  return { subject, roles: subject.roles };
});

const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: {
    anyone: RbacPolicy("admin", "user", "guest"),
    userOrAdmin: RbacPolicy("admin", "user"),
    adminOnly: RbacPolicy("admin"),
    guestOnly: RbacPolicy("guest"),
  },
  settings: { disableSubjectCaching: true },
});

describe("Policy.rbac", () => {
  it("should pass when user has any of the roles", async () => {
    const user = { id: "1", roles: ["admin" as const] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("anyone")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("userOrAdmin")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("adminOnly")).resolves.toMatchObject(user);
    });
  });
  it("should fail when user has none of the roles", async () => {
    const user = { id: "1", roles: ["user" as const] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("anyone")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("userOrAdmin")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("adminOnly")).rejects.toThrowError();
    });
  });
  it("should match any role", async () => {
    const user = { id: "1", roles: ["guest" as const, "user" as const] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("anyone")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("guestOnly")).resolves.toMatchObject(user);
      await expect(Kilpi.authorize("adminOnly")).rejects.toThrowError();
    });
  });
  it("should fail when user has no roles", async () => {
    const user = { id: "1", roles: [] };
    await TestUtils.runAs(user, async () => {
      await expect(Kilpi.authorize("anyone")).rejects.toThrowError();
      await expect(Kilpi.authorize("userOrAdmin")).rejects.toThrowError();
      await expect(Kilpi.authorize("adminOnly")).rejects.toThrowError();
    });
  });
});
