import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it } from "vitest";

type Subject = { id: string };
type Post = { id: string; userId: string };

/**
 * Setup a new server and client.
 */
function init(options: { subject: Subject | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {
      always: (s) => Grant(s),
      never: () => Deny(),
      async authed(subject) {
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        return Grant(subject);
      },
      posts: {
        async edit(subject, post: Post) {
          if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
          if (subject.id !== post.userId) return Deny({ reason: "NOT_OWN", message: "Not own" });
          return Grant(subject);
        },
      },
    },
    plugins: [EndpointPlugin({ secret: "secret" })],
  });

  return createKilpiClient({
    infer: {} as typeof Kilpi,

    // Connect directly to endpoint
    connect: {
      handleRequest: Kilpi.$createPostEndpoint(),
      secret: "secret",
    },

    // Short timeout for local testing
    batching: { jobTimeoutMs: 1 },
  });
}

describe("KilpiClientPolicy", () => {
  it("should work when unauthenticated", async () => {
    const Client = init({ subject: null });

    await expect(Client.always().authorize()).resolves.toMatchObject({
      granted: true,
      subject: null,
    });

    await expect(Client.never().authorize()).resolves.toMatchObject({
      granted: false,
      reason: undefined,
      message: "Unauthorized",
      metadata: undefined,
    });

    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: false,
      reason: "UNAUTHENTICATED",
      message: "Not authenticated",
      metadata: undefined,
    });

    await expect(Client.posts.edit({ id: "1", userId: "1" }).authorize()).resolves.toMatchObject({
      granted: false,
      reason: "UNAUTHENTICATED",
      message: "Not authenticated",
      metadata: undefined,
    });
  });

  it("should work when authenticated", async () => {
    const Client = init({ subject: { id: "1" } });

    await expect(Client.always().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });

    await expect(Client.never().authorize()).resolves.toMatchObject({
      granted: false,
      reason: undefined,
      message: "Unauthorized",
      metadata: undefined,
    });

    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });

    await expect(Client.posts.edit({ id: "1", userId: "1" }).authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });

    await expect(Client.posts.edit({ id: "2", userId: "2" }).authorize()).resolves.toMatchObject({
      granted: false,
      reason: "NOT_OWN",
      message: "Not own",
      metadata: undefined,
    });
  });
});
