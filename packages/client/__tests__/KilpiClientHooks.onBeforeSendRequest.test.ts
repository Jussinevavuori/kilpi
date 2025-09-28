import { createKilpi, EndpointPlugin, Grant } from "@kilpi/core";
import { createKilpiClient } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("KilpiClientHooks.onBeforeSendRequest", () => {
  // Mock function for inspecting received headers
  const mockOnBeforeHandleRequest = vi.fn();

  // Setup Kilpi server instance
  const Kilpi = createKilpi({
    getSubject: async () => null,
    policies: { test: (s) => Grant(s) },
    plugins: [
      EndpointPlugin({
        secret: "secret",
        onBeforeHandleRequest(request) {
          mockOnBeforeHandleRequest(request);
        },
      }),
    ],
  });

  // Create client with onBeforeSendRequest hook
  const KilpiClient = createKilpiClient({
    infer: {} as typeof Kilpi,
    batching: { jobTimeoutMs: 0 },
    connect: {
      handleRequest: Kilpi.createPostEndpoint(),
      secret: "secret",
    },
  });

  // Reset mock before each test
  beforeEach(() => {
    mockOnBeforeHandleRequest.mockReset();
  });

  it("should inject custom headers", async () => {
    KilpiClient.$hooks.onBeforeSendRequest(() => {
      return {
        headers: {
          "X-Custom-Header": "CustomValue",
          "X-Another-Header": "AnotherValue",
        },
      };
    });
    await KilpiClient.test().authorize();
    expect(mockOnBeforeHandleRequest).toHaveBeenCalledTimes(1);
    const lastRequest: Request = mockOnBeforeHandleRequest.mock.lastCall?.[0];
    expect(lastRequest.headers.get("X-Custom-Header")).toBe("CustomValue");
    expect(lastRequest.headers.get("X-Another-Header")).toBe("AnotherValue");
  });
});
