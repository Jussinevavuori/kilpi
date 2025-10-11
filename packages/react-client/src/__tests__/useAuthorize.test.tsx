import { createKilpiClient } from "@kilpi/client";
import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { UseAuthorizeReturn } from "../hooks/useAuthorize";
import { ReactClientPlugin } from "../plugins/ReactClientPlugin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const Kilpi = createKilpi({
  getSubject: () => ({ id: "1" }),
  policies: {
    async always(subject) {
      return Grant(subject);
    },
    async never() {
      return Deny();
    },
    posts: {
      async edit(subject, post: { id: string; userId: string }) {
        if (!subject) return Deny({ reason: "UNAUTHENTICATED", message: "Not authenticated" });
        if (subject.id !== post.userId) return Deny({ reason: "NOT_OWN", message: "Not own" });
        return Grant(subject);
      },
    },
  },
  plugins: [EndpointPlugin({ secret: "secret" })],
});

const Client = createKilpiClient({
  infer: {} as typeof Kilpi,
  connect: { handleRequest: Kilpi.$createPostEndpoint(), secret: "secret" },
  plugins: [ReactClientPlugin()],
  batching: { jobTimeoutMs: 1 },
});

describe("useAuthorize", () => {
  it("should fetch data and grant", async () => {
    const { result } = renderHook(() => Client.always().useAuthorize());

    expect(result.current).toMatchObject({
      status: "pending",
      isIdle: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: false,
    } satisfies UseAuthorizeReturn<any, any>);

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: "success",
        isIdle: false,
        isPending: false,
        isSuccess: true,
        isError: false,
        decision: {
          granted: true,
          subject: { id: "1" },
        },
        error: null,
        granted: true,
        isDisabled: false,
      } satisfies UseAuthorizeReturn<any, any>);
    });
  });

  it("should fetch data and deny", async () => {
    const { result } = renderHook(() => Client.never().useAuthorize());

    expect(result.current).toMatchObject({
      status: "pending",
      isIdle: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: false,
    } satisfies UseAuthorizeReturn<any, any>);

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: "success",
        isIdle: false,
        isPending: false,
        isSuccess: true,
        isError: false,
        decision: {
          granted: false,
          message: "Unauthorized",
        },
        error: null,
        granted: false,
        isDisabled: false,
      } satisfies UseAuthorizeReturn<any, any>);
    });
  });

  it("works with objects", async () => {
    const { result } = renderHook(() => Client.posts.edit({ id: "1", userId: "1" }).useAuthorize());
    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: "success",
        isIdle: false,
        isPending: false,
        isSuccess: true,
        isError: false,
        decision: {
          granted: true,
          subject: { id: "1" },
        },
        error: null,
        granted: true,
        isDisabled: false,
      } satisfies UseAuthorizeReturn<any, any>);
    });
  });

  it("respects disabled state", async () => {
    const { result } = renderHook(() => Client.always().useAuthorize({ isDisabled: true }));

    expect(result.current).toMatchObject({
      status: "idle",
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: true,
    } satisfies UseAuthorizeReturn<any, any>);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current).toMatchObject({
      status: "idle",
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: true,
    } satisfies UseAuthorizeReturn<any, any>);
  });

  it("resets when disabled later", async () => {
    // Use the current value of isDisabled in the useAuthorize hook
    const authorizeHook = renderHook(
      ({ isDisabled }: { isDisabled: boolean }) => Client.always().useAuthorize({ isDisabled }),
      { initialProps: { isDisabled: false } },
    );

    // Should start as pending
    expect(authorizeHook.result.current).toMatchObject({
      status: "pending",
      isIdle: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: false,
    } satisfies UseAuthorizeReturn<any, any>);

    // Set to disabled
    await authorizeHook.rerender({ isDisabled: true });

    // Should be set to idle
    expect(authorizeHook.result.current).toMatchObject({
      status: "idle",
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      decision: null,
      error: null,
      granted: false,
      isDisabled: true,
    } satisfies UseAuthorizeReturn<any, any>);
  });
});
