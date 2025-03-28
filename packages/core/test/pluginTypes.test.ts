import { AuditPlugin, createKilpi, EndpointPlugin } from "src";
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
        EndpointPlugin({
          secret: "",
        }),
      ],
    });

    Kilpi.audit.flush();
    Kilpi.createPostEndpoint();

    expect(true).toBe(true);
  });
});
