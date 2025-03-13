import { describe, expect, it } from "bun:test";
import { TestKilpi, TestUtils } from "./testUtils";

describe("Kilpi.filter", async () => {
  await it("filters", async () => {
    const docs = await TestUtils.listAllDocuments();

    await TestUtils.runAs(null, async () => {
      const filtered = await TestKilpi.filter("docs:ownDocument", docs);
      const expected: typeof filtered = [];
      expect(filtered).toMatchObject(expected);
    });

    await TestUtils.runAs({ id: "user1" }, async () => {
      const filtered = await TestKilpi.filter("docs:ownDocument", docs);
      const expected = docs.filter((_) => _.userId === "user1");
      expect(filtered).toMatchObject(expected);
    });
  });
});
