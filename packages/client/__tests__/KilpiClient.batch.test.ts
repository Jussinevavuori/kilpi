import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it, vi } from "vitest";

/**
 * Setup a new server and client.
 */

describe("requestBatching", () => {
  it("should batch requests", async () => {
    const processItemCb = vi.fn();
    const handleRequestCb = vi.fn();

    // Setup Kilpi server instance
    const Kilpi = createKilpi({
      getSubject: async (): Promise<{ id: string } | null> => null,
      policies: {
        async always(subject) {
          return Grant(subject);
        },
        posts: {
          async edit(subject, post: { id: string; userId: string }) {
            return subject && subject.id === post.userId ? Grant(subject) : Deny();
          },
        },
      },
      plugins: [
        EndpointPlugin({
          secret: "secret",
          onBeforeProcessItem: processItemCb,
          onBeforeHandleRequest: handleRequestCb,
        }),
      ],
    });

    const KilpiClient = createKilpiClient({
      infer: {} as typeof Kilpi,
      connect: {
        handleRequest: Kilpi.$createPostEndpoint(),
        secret: "secret",
      },
      batching: { batchDelayMs: 20, jobTimeoutMs: 100 },
    });

    // Send 3 requests
    KilpiClient.posts.edit({ id: "1", userId: "1" }).authorize();
    KilpiClient.posts.edit({ id: "2", userId: "1" }).authorize();
    KilpiClient.posts.edit({ id: "3", userId: "1" }).authorize();

    // No requests should have been sent before batch flushed
    expect(processItemCb).toHaveBeenCalledTimes(0);
    expect(handleRequestCb).toHaveBeenCalledTimes(0);

    // Wait for flush
    await new Promise((r) => setTimeout(r, 30));

    // Only 1 request with 3 items should have been sent
    expect(processItemCb).toHaveBeenCalledTimes(3);
    expect(handleRequestCb).toHaveBeenCalledTimes(1);

    // Send new items in batch
    KilpiClient.posts.edit({ id: "4", userId: "1" }).authorize();
    KilpiClient.posts.edit({ id: "5", userId: "1" }).authorize();

    // Wait for flush
    await new Promise((r) => setTimeout(r, 30));

    // Only 1 request with 2 items should have been sent
    expect(processItemCb).toHaveBeenCalledTimes(5);
    expect(handleRequestCb).toHaveBeenCalledTimes(2);
  });
});
