import { createKilpi } from "src";
import { describe, expect, it } from "vitest";
import { TestUtils } from "./testUtils";

// Test Kilpi instance
const Kilpi = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  advanced: { disableSubjectCaching: true },
});

describe("Kilpi.filter", async () => {
  await it("filters", async () => {
    const docs = await TestUtils.listAllDocuments();

    await TestUtils.runAs(null, async () => {
      const filtered = await Kilpi.filter("docs:ownDocument", docs);
      const expected: typeof filtered = [];
      expect(filtered).toMatchObject(expected);
    });

    await TestUtils.runAs({ id: "user1", roles: [] }, async () => {
      const filtered = await Kilpi.filter("docs:ownDocument", docs);
      const expected = docs.filter((_) => _.userId === "user1");
      expect(filtered).toMatchObject(expected);
    });
  });
});
