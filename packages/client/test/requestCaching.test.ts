import { createKilpi, EndpointPlugin } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it, vi } from "vitest";

type Sub = { id: string; name: string };

const onBeforeHandleRequest = vi.fn();

/**
 * Setup a new server and client.
 */
function init(options: { subject: Sub | null }) {
  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => options.subject,
    policies: {},
    plugins: [EndpointPlugin({ secret: "secret", onBeforeHandleRequest })],
  });

  return createKilpiClient<typeof Kilpi>({
    // Connect directly to endpoint
    connect: { handleRequest: Kilpi.createPostEndpoint(), secret: "secret" },

    // Short timeout for local testing
    batching: { jobTimeoutMs: 100 },
  });
}

describe("requestCaching", () => {
  it("should cache requests", async () => {
    const subject: Sub = { id: "1", name: "Tester" };
    const KilpiClient = init({ subject });

    // Request once: Should be cache miss
    const s1 = await KilpiClient.fetchSubject();
    expect(s1).toMatchObject(subject);
    expect(onBeforeHandleRequest).toHaveBeenCalledTimes(1);

    // Request twice: Should be cache hit
    const s2 = await KilpiClient.fetchSubject();
    expect(s2).toMatchObject(subject);
    expect(onBeforeHandleRequest).toHaveBeenCalledTimes(1);
    expect(s1 === s2).toBe(true);

    // Clear cache and re-request: Should be cache miss
    KilpiClient.clearCache();
    const s3 = await KilpiClient.fetchSubject();
    expect(s3).toMatchObject(subject);
    expect(onBeforeHandleRequest).toHaveBeenCalledTimes(2);
    expect(s1 === s3).toBe(false);
  });
});
