import { createKilpiClient } from "@kilpi/client";
import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { ReactClientPlugin } from "src/plugins/ReactClientPlugin";
import { describe, expect, it } from "vitest";

const Kilpi = createKilpi({
  getSubject: () => ({ id: "1" }),
  policies: {
    async always(subject) {
      return Grant(subject);
    },
    async never(subject) {
      return Deny();
    },
  },
  plugins: [EndpointPlugin({ secret: "secret" })],
});

const Client = createKilpiClient({
  infer: {} as typeof Kilpi,
  connect: { handleRequest: Kilpi.$createPostEndpoint(), secret: "secret" },
  plugins: [ReactClientPlugin()],
});

describe("types", () => {
  it("should pass", async () => {
    expect(true).toBe(true);
    const a = Client.always().$sayMyName();
    const b = Client.never().useAuthorize();
    void a;
    void b;
  });
});
