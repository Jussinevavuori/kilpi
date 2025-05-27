import { createKilpi, deny, EndpointPlugin, grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { describe, expect, it, vi } from "vitest";

type Sub = { id: string; name: string };
type Doc = { id: string; userId: string };

/**
 * Setup a new server and client.
 */
function init() {
  const processItemCb = vi.fn();
  const handleRequestCb = vi.fn();

  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async (): Promise<Sub | null> => null,
    policies: {
      always: (s) => grant(s),
      doc: (s, doc: Doc) => (s && s.id === doc.userId ? grant(s) : deny()),
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

    // Connect directly to endpoint
    connect: { handleRequest: Kilpi.createPostEndpoint(), secret: "secret" },

    // Short timeout for local testing
    batching: {
      batchDelayMs: 20,
      jobTimeoutMs: 100,
    },
  });

  return {
    KilpiClient,
    processItemCb,
    handleRequestCb,
  };
}

describe("requestBatching", () => {
  it("should batch requests", async () => {
    const { KilpiClient, handleRequestCb, processItemCb } = init();

    // Send 3 requests
    KilpiClient.fetchIsAuthorized({ key: "doc", resource: { id: "1", userId: "1" } });
    KilpiClient.fetchIsAuthorized({ key: "doc", resource: { id: "2", userId: "1" } });
    KilpiClient.fetchIsAuthorized({ key: "doc", resource: { id: "3", userId: "1" } });

    // No requests should have been sent before batch flushed
    expect(processItemCb).toHaveBeenCalledTimes(0);
    expect(handleRequestCb).toHaveBeenCalledTimes(0);

    // Wait for flush
    await new Promise((r) => setTimeout(r, 30));

    // Only 1 request with 3 items should have been sent
    expect(processItemCb).toHaveBeenCalledTimes(3);
    expect(handleRequestCb).toHaveBeenCalledTimes(1);

    // Send new items in batch
    KilpiClient.fetchIsAuthorized({ key: "doc", resource: { id: "4", userId: "1" } });
    KilpiClient.fetchIsAuthorized({ key: "doc", resource: { id: "5", userId: "1" } });

    // Wait for flush
    await new Promise((r) => setTimeout(r, 30));

    // Only 1 request with 2 items should have been sent
    expect(processItemCb).toHaveBeenCalledTimes(5);
    expect(handleRequestCb).toHaveBeenCalledTimes(2);
  });
});
