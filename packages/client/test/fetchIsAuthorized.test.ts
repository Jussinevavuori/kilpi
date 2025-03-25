import { createKilpi, deny, EndpointPlugin, grant } from "@kilpi/core";
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
    policies: {
      always: (s) => grant(s),
      never: () => deny(),
      authed: (s) => (s ? grant(s) : deny()),
      own: (s, doc: Doc) => (s && s.id === doc.userId ? grant(s) : deny()),
    },
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

describe("fetchIsAuthorized", (it) => {
  it("should work when unauthenticated", async () => {
    const Client = init({ subject: null });
    expect(await Client.fetchIsAuthorized("always")).toBe(true);
    expect(await Client.fetchIsAuthorized("never")).toBe(false);
    expect(await Client.fetchIsAuthorized("authed")).toBe(false);
    expect(await Client.fetchIsAuthorized("own", { id: "1", userId: "1" })).toBe(false);
  });

  it("should work when authenticated", async () => {
    const subject: Sub = { id: "1", name: "Tester" };
    const Client = init({ subject });
    expect(await Client.fetchIsAuthorized("always")).toBe(true);
    expect(await Client.fetchIsAuthorized("never")).toBe(false);
    expect(await Client.fetchIsAuthorized("authed")).toBe(true);
    expect(await Client.fetchIsAuthorized("own", { id: "1", userId: "1" })).toBe(true);
    expect(await Client.fetchIsAuthorized("own", { id: "1", userId: "2" })).toBe(false);
  });
});
