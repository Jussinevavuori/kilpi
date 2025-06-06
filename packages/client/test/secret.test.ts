import { createKilpi, EndpointPlugin, grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it } from "vitest";

type Sub = { id: string; name: string };

/**
 * Setup a new server and client.
 */
function init(options: { serverSecret: string; clientSecret: string }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async (): Promise<Sub | null> => null,
    policies: { always: (s) => grant(s) },
    plugins: [EndpointPlugin({ secret: options.serverSecret })],
  });

  return createKilpiClient({
    infer: {} as typeof Kilpi,

    // Connect directly to endpoint
    connect: { handleRequest: Kilpi.createPostEndpoint(), secret: options.clientSecret },

    // Short timeout for local testing
    batching: { jobTimeoutMs: 100 },
  });
}

describe("endpoint secret", () => {
  it("should fail when mismatched secrets", async () => {
    const Client = init({ clientSecret: "1", serverSecret: "2" });
    await expect(Client.fetchIsAuthorized({ key: "always" })).rejects.toBeInstanceOf(Error);
  });
  it("should succeed when matched secrets", async () => {
    const Client = init({ clientSecret: "same", serverSecret: "same" });
    await expect(Client.fetchIsAuthorized({ key: "always" })).resolves.toBe(true);
  });
});
