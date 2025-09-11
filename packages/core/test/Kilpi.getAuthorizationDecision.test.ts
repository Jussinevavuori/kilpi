import { createKilpi } from "src";
import { describe, expect, it } from "vitest";
import type { TestDocument, TestSubject } from "./testUtils";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  settings: { disableSubjectCaching: true },
});

describe("Kilpi.getAuthorization", () => {
  const object: TestDocument = { id: "doc1", userId: "user1" };

  const Granted = (subject: TestSubject | null) => ({ granted: true, subject });
  const Denied = () => ({ granted: false });

  it("should grant public when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.getAuthorizationDecision("public")).resolves.toMatchObject(Granted(null));
    });
  });

  it("should grant public when authed", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(Kilpi.getAuthorizationDecision("public")).resolves.toMatchObject(
        Granted(subject),
      );
    });
  });

  it("should deny authed when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(Kilpi.getAuthorizationDecision("authed")).resolves.toMatchObject(Denied());
    });
  });

  it("should grant authed when authed", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(Kilpi.getAuthorizationDecision("authed")).resolves.toMatchObject(
        Granted(subject),
      );
    });
  });

  it("should deny authed object check when unauthed", async () => {
    await TestUtils.runAs(null, async () => {
      await expect(
        Kilpi.getAuthorizationDecision("docs:ownDocument", object),
      ).resolves.toMatchObject(Denied());
    });
  });

  it("should grant authed object check when authed as correct user", async () => {
    await TestUtils.runAs({ id: "user1", roles: [] }, async (subject) => {
      await expect(
        Kilpi.getAuthorizationDecision("docs:ownDocument", object),
      ).resolves.toMatchObject(Granted(subject));
    });
  });

  it("should deny authed object check when authed as incorrect user", async () => {
    await TestUtils.runAs({ id: "user2", roles: [] }, async () => {
      await expect(
        Kilpi.getAuthorizationDecision("docs:ownDocument", object),
      ).resolves.toMatchObject(Denied());
    });
  });

  it("should work on deeply nested actions", async () => {
    await TestUtils.runAs({ id: "user2", roles: [] }, async () => {
      await expect(
        Kilpi.getAuthorizationDecision("docs:deeply:nested:policy", object),
      ).resolves.toMatchObject(Denied());
    });
  });
});
