import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Subject = { id: string };

const mockPolicyResolver = vi.fn();

/**
 * Setup a new server and client.
 */
function init(options: { subject: Subject | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {
      async authed(subject) {
        mockPolicyResolver(subject);
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        return Grant(subject);
      },
    },
    plugins: [EndpointPlugin({ secret: "secret" })],
  });

  return createKilpiClient({
    infer: {} as typeof Kilpi,
    connect: { handleRequest: Kilpi.$createPostEndpoint(), secret: "secret" },
    batching: { jobTimeoutMs: 1 },
  });
}

describe("KilpiClientPolicy", () => {
  beforeEach(() => {
    mockPolicyResolver.mockReset();
  });

  it("should cache the call", async () => {
    const Client = init({ subject: { id: "1" } });

    expect(mockPolicyResolver).toHaveBeenCalledTimes(0);
    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockPolicyResolver).toHaveBeenCalledTimes(1);
    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockPolicyResolver).toHaveBeenCalledTimes(1);
  });

  it("should allow invalidating the cache", async () => {
    const Client = init({ subject: { id: "1" } });

    expect(mockPolicyResolver).toHaveBeenCalledTimes(0);
    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockPolicyResolver).toHaveBeenCalledTimes(1);
    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockPolicyResolver).toHaveBeenCalledTimes(1);
    Client.$cache.invalidate();
    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockPolicyResolver).toHaveBeenCalledTimes(2);
  });

  it("should call hooks on cache events", async () => {
    const Client = init({ subject: { id: "1" } });

    const mockHook = vi.fn();
    Client.$hooks.onCacheInvalidate(() => {
      mockHook();
    });

    await expect(Client.authed().authorize()).resolves.toMatchObject({
      granted: true,
      subject: { id: "1" },
    });
    expect(mockHook).toHaveBeenCalledTimes(0);
    Client.$cache.invalidate();
    expect(mockHook).toHaveBeenCalledTimes(1);
  });
});
