import { createKilpi, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it } from "vitest";

describe("endpoint secret", () => {
  /**
   * Setup a new server and client.
   */
  function init(options: { serverSecret: string; clientSecret: string }) {
    const Kilpi = createKilpi({
      getSubject: () => null,
      policies: { always: (s) => Grant(s) },
      plugins: [EndpointPlugin({ secret: options.serverSecret })],
    });

    return createKilpiClient({
      infer: {} as typeof Kilpi,
      batching: { jobTimeoutMs: 0 },
      connect: {
        handleRequest: Kilpi.createPostEndpoint(),
        secret: options.clientSecret,
      },
    });
  }

  it("should fail when mismatched secrets", async () => {
    const Client = init({ clientSecret: "1", serverSecret: "2" });
    await expect(Client.always().authorize()).resolves.toMatchObject({
      granted: false,
      reason: "KILPI_INTERNAL::INVALID_RESPONSE",
    });
  });

  it("should succeed when matched secrets", async () => {
    const Client = init({ clientSecret: "XXX", serverSecret: "XXX" });
    await expect(Client.always().authorize()).resolves.toMatchObject({
      granted: true,
      subject: null,
    });
  });
});
