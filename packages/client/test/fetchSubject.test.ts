import { createKilpi, EndpointPlugin } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect } from "vitest";
import { mockFetch } from "./mockFetch";

type Sub = {
  id: string;
  name: string;
};

type Doc = {
  id: string;
  userId: string;
};

/**
 * Setup a new server and client.
 */
function init(options: { subject: Sub | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    async getSubject() {
      return options.subject;
    },
    policies: {},
    plugins: [EndpointPlugin({ kilpiSecret: "secret" })],
  });

  // Create an endpoint and a mock fetcher to fetch from the endpoint for testing
  const endpoint = Kilpi.createPostEndpoint();
  const fetcher = mockFetch(endpoint);

  const Client = createKilpiClient<typeof Kilpi>({
    kilpiSecret: "secret",
    kilpiUrl: "http://localhost:3000",
    fetch: fetcher,
    batching: { jobTimeoutMs: 100 },
  });

  return Client;
}

describe("fetchSubject", (it) => {
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
