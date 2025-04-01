import { createKilpiClient } from "@kilpi/client";
import { createKilpi, deny, EndpointPlugin, grant, type Policyset } from "@kilpi/core";
import { describe } from "node:test";
import { ReactClientComponentPlugin } from "src/docs/plugins/ReactClientComponentPlugin";
import { expect, it } from "vitest";

type Sub = { id: number };
const sub = { id: 1 };

type Doc = { id: number; userId: number };
const doc = { id: 1, userId: 1 };

const policies = {
  async example(user) {
    return grant(user);
  },

  documents: {
    async read(user, doc: Doc) {
      if (!user) return deny();
      if (doc.userId !== user.id) return deny();
      return grant(user);
    },
  },
} satisfies Policyset<Sub | null>;

const Kilpi = createKilpi({
  getSubject: () => Promise.resolve(sub),
  policies,
  plugins: [EndpointPlugin({ secret: "secret" })],
});

const Client = createKilpiClient({
  infer: {} as typeof Kilpi,

  // Connect directly to endpoint
  connect: { handleRequest: Kilpi.createPostEndpoint(), secret: "secret" },

  plugins: [ReactClientComponentPlugin()],
});

describe("types", () => {
  it("should be typesafe and have correct types", async () => {
    const { ClientAccess, useIsAuthorized, useSubject } = Client.ReactClient.createComponents();

    // These should not throw type errors if all's well - wrapped in function as not to be called
    void function () {
      void (<ClientAccess to="example" />);
      void (<ClientAccess to="documents:read" on={doc} />);
      void useSubject();
      void useIsAuthorized("example");
      void useIsAuthorized("documents:read", doc);
    };

    // No run-time tests
    expect(true).toBe(true);
  });
});
