import { createKilpiClient } from "@kilpi/client";
import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactClientPlugin } from "../plugins/ReactClientPlugin";

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

describe("<AuthorizeClient />", () => {
  it("should resolve authorized", async () => {
    const { AuthorizeClient } = Client.$createReactClientComponents();

    render(
      <AuthorizeClient
        policy={Client.always()}
        Pending={<p>PENDING</p>}
        Idle={<p>IDLE</p>}
        Unauthorized={<p>UNAUTHORIZED</p>}
        Error={<p>ERROR</p>}
      >
        <p>AUTHORIZED</p>
      </AuthorizeClient>,
    );

    // Ensure resolves to authorized
    await expect(screen.findByText("AUTHORIZED")).resolves.toBeInTheDocument();
  });

  it("should resolve unauthorized", async () => {
    const { AuthorizeClient } = Client.$createReactClientComponents();

    render(
      <AuthorizeClient
        policy={Client.never()}
        Pending={<p>PENDING</p>}
        Idle={<p>IDLE</p>}
        Unauthorized={<p>UNAUTHORIZED</p>}
        Error={<p>ERROR</p>}
      >
        <p>AUTHORIZED</p>
      </AuthorizeClient>,
    );

    // Ensure resolves to authorized
    await expect(screen.findByText("UNAUTHORIZED")).resolves.toBeInTheDocument();
  });

  it("should respect isDisabled", async () => {
    const { AuthorizeClient } = Client.$createReactClientComponents();

    render(
      <AuthorizeClient
        policy={Client.never()}
        Pending={<p>PENDING</p>}
        Idle={<p>IDLE</p>}
        Unauthorized={<p>UNAUTHORIZED</p>}
        Error={<p>ERROR</p>}
        isDisabled
      >
        <p>AUTHORIZED</p>
      </AuthorizeClient>,
    );

    // Ensure resolves to authorized
    await expect(screen.findByText("IDLE")).resolves.toBeInTheDocument();
  });

  it("renders function childrens", async () => {
    const { AuthorizeClient } = Client.$createReactClientComponents();

    render(
      <AuthorizeClient policy={Client.always()}>
        {(q) => (
          <p data-testid={"subject-" + (q.decision?.granted ? q.decision.subject.id : "0")} />
        )}
      </AuthorizeClient>,
    );

    // Ensure resolves to authorized
    await expect(screen.findByTestId("subject-1")).resolves.toBeInTheDocument();
  });
});
