import { createKilpi, EndpointPlugin } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it } from "vitest";

type Sub = { id: string; name: string };

/**
 * Setup a new server and client.
 */
function init(options: { subject: Sub | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {},
    plugins: [EndpointPlugin({ secret: "secret" })],
  });

  return createKilpiClient({
    infer: {} as typeof Kilpi,

    // Connect directly to endpoint
    connect: { handleRequest: Kilpi.createPostEndpoint(), secret: "secret" },

    // Short timeout for local testing
    batching: { jobTimeoutMs: 100 },
  });
}

describe("fetchSubject", () => {
  it("should return null when unauthenticated", async () => {
    const Client = init({ subject: null });
    const subject = await Client.fetchSubject();
    expect(subject).toBeNull();
  });

  it("should return subject when authenticated", async () => {
    const subject: Sub = { id: "1", name: "Tester" };
    const Client = init({ subject });
    expect(await Client.fetchSubject()).toMatchObject(subject);
  });
});
