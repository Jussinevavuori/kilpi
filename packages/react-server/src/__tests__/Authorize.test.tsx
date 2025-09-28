import { createKilpi, Deny, Grant } from "@kilpi/core";
import { beforeEach } from "node:test";
import { describe, expect, it, vi } from "vitest";
import { ReactServerComponentPlugin } from "../plugins/ReactServerComponentPlugin";

// =================================================================================================
// IMPORTANT NOTE:
//
// Vitest does not yet support testing async react server components (as of 2025-09-28) or I was
// unable to figure it out. Therefore, these tests are mostly type tests to ensure that the
// typings work as expected.
//
// TODO: Proper RSC testing when supported.
// =================================================================================================

describe("types", () => {
  type Subject = { userId: string } | null;

  // Get subject mocker
  const mockGetSubject = vi.fn();

  // Setup testing Kilpi instance
  const Kilpi = createKilpi({
    async getSubject(): Promise<Subject> {
      mockGetSubject();
      return { userId: "1" };
    },
    policies: {
      async always(user) {
        return Grant(user);
      },
      async never() {
        return Deny();
      },
      posts: {
        async read(user, post: { userId: string }) {
          if (!user) return Deny();
          if (post.userId !== user.userId) return Deny();
          return Grant(user);
        },
      },
    },
    plugins: [ReactServerComponentPlugin()],
  });

  beforeEach(() => {
    mockGetSubject.mockReset();
  });

  it("should render children when authorized", async () => {
    const { Authorize } = Kilpi.$createReactServerComponents();

    void (await (
      <Authorize
        decision={Kilpi.always().authorize()}
        Pending={<p>PENDING</p>}
        Unauthorized={<p>UNAUTHORIZED</p>}
      >
        <p>TARGET</p>
      </Authorize>
    ));

    void (await (
      <Authorize
        decision={Kilpi.posts.read({ userId: "1" }).authorize()}
        Pending={<p>PENDING</p>}
        Unauthorized={(decision) => <p>UNAUTHORIZED: {decision.message || "Just because"}</p>}
      >
        {(decision) => <p>TARGET: {decision.subject?.userId || "No subject"}</p>}
      </Authorize>
    ));

    expect(true).toBe(true);
  });

  it("should automatically provide a subject cache", async () => {
    // TODO: Implement once RSC testing is supported
    //
    // const { Authorize } = Kilpi.$createReactServerComponents();
    //
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    //
    // expect(mockGetSubject).toHaveBeenCalledTimes(1);
    expect(true).toBe(true);
  });

  it("should allow disabling the subject cache", async () => {
    // TODO: Implement once RSC testing is supported
    //
    // const { Authorize } = Kilpi.$createReactServerComponents({ disableSubjectCaching: true });
    //
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    // void (await (<Authorize decision={Kilpi.always().authorize()} />));
    //
    // expect(mockGetSubject).toHaveBeenCalledTimes(3);

    // Currently only type testing
    void createKilpi({
      getSubject: () => null,
      policies: {},
      plugins: [ReactServerComponentPlugin({ disableSubjectCaching: true })],
    });
    expect(true).toBe(true);
  });

  it("should allow setting page-specific onUnauthorized handlers", async () => {
    // TODO: Implement once RSC testing is supported (tests for .$onUnauthorizedRscAssert)

    // Currently only type testing
    void (await Kilpi.$onUnauthorizedRscAssert((decision) => {
      throw new Error(decision.message || "Just because");
    }));

    expect(true).toBe(true);
  });
});
