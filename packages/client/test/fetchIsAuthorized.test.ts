import { createKilpi, deny, EndpointPlugin, grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect } from "vitest";

type Sub = { id: string; name: string };
type Doc = { id: string; userId: string };

/**
 * Setup a new server and client.
 */
function init(options: { subject: Sub | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {
      always: (s) => grant(s),
      never: () => deny(),
      authed: (s) => (s ? grant(s) : deny()),
      own: (s, doc: Doc) => (s && s.id === doc.userId ? grant(s) : deny()),
    },
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

describe("fetchIsAuthorized", (it) => {
  it("should work when unauthenticated", async () => {
    const Client = init({ subject: null });
    expect(await Client.fetchIsAuthorized({ key: "always" })).toBe(true);
    expect(await Client.fetchIsAuthorized({ key: "never" })).toBe(false);
    expect(await Client.fetchIsAuthorized({ key: "authed" })).toBe(false);
    expect(await Client.fetchIsAuthorized({ key: "own", resource: { id: "1", userId: "1" } })).toBe(
      false,
    );
  });

  it("should work when authenticated", async () => {
    const subject: Sub = { id: "1", name: "Tester" };
    const Client = init({ subject });
    expect(await Client.fetchIsAuthorized({ key: "always" })).toBe(true);
    expect(await Client.fetchIsAuthorized({ key: "never" })).toBe(false);
    expect(await Client.fetchIsAuthorized({ key: "authed" })).toBe(true);
    expect(await Client.fetchIsAuthorized({ key: "own", resource: { id: "1", userId: "1" } })).toBe(
      true,
    );
    expect(await Client.fetchIsAuthorized({ key: "own", resource: { id: "1", userId: "2" } })).toBe(
      false,
    );
  });
});
