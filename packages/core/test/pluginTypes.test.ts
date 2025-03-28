import { AuditPlugin, createKilpi } from "src";
import { describe, expect, it } from "vitest";

describe("plugin types", () => {
  it("should compile with multiple plugins", async () => {
    const Kilpi = createKilpi({
      getSubject: async () => ({ id: "1" }),
      policies: {},
      plugins: [
        AuditPlugin({
          strategy: "immediate",
          async onFlushEvents() {},
        }),
      ],
    });

    expect(true).toBe(true);
  });
});
