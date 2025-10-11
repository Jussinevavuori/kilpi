import { createKilpi, Deny, EndpointPlugin, Grant } from "@kilpi/core";
import { ReactServerPlugin } from "@kilpi/react-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Article } from "./article-service";
import { auth } from "./auth.server";

/**
 * Utility denials
 */
const Denials = {
  Unauthorized: () =>
    Deny({
      message: "You must be signed in to perform this action",
      reason: "unauthorized",
    }),
  Forbidden: (message = "You do not have permission to perform this action") =>
    Deny({
      message,
      reason: "forbidden",
    }),
};

/**
 * Define the Kilpi authorization system
 */
export const Kilpi = createKilpi({
  /**
   * Get subject from better-auth.
   *
   * Due to next's `headers()` function, this does not need a `ctx` parameter.
   */
  async getSubject() {
    // Get session from better-auth
    const result = await auth.api.getSession({ headers: await headers() });
    if (!result) return null;

    // Return the user object with the session
    return Object.assign(result.user, { session: result.session });
  },

  /**
   * Define all policies.
   *
   * Since there are so few, we do it inline.
   */
  policies: {
    async always(subject) {
      return Grant(subject);
    },
    async authed(subject) {
      if (!subject) return Denials.Unauthorized();
      return Grant(subject);
    },

    articles: {
      // Published articles can be read by anyone, non-publised only by admins or the author
      read(subject, article: Article) {
        if (article.isPublished) return Grant(subject);
        if (!subject) return Denials.Unauthorized();
        if (subject.role === "admin") return Grant(subject);
        if (subject.id === article.userId) return Grant(subject);
        return Denials.Forbidden("You do not have access to this article");
      },

      // Articles can be created by any logged in user
      create(subject) {
        if (!subject) return Denials.Unauthorized();
        return Grant(subject);
      },

      // Articles can only be updated by the author
      update(subject, article: Article) {
        if (!subject) return Denials.Unauthorized();
        if (subject.id === article.userId) return Grant(subject);
        return Denials.Forbidden("You are not the owner of this article");
      },

      // Articles can be deleted by the author or admins
      delete(subject, article: Article) {
        if (!subject) return Denials.Unauthorized();
        if (subject.role === "admin") return Grant(subject);
        if (subject.id === article.userId) return Grant(subject);
        return Denials.Forbidden("You are not the owner of this article or an admin");
      },
    },
  },

  /**
   * By default, when `.assert()` fails, go to the sign-in page.
   */
  async onUnauthorizedAssert(decision) {
    redirect(`/sign-in?message=${decision.message}`);
  },

  /**
   * Plugins
   *
   * - EndpointPlugin     to enable using KilpiClient
   * - ReactServerPlugin  for <Authorize /> and more
   */
  plugins: [
    EndpointPlugin({
      secret: process.env.NEXT_PUBLIC_KILPI_SECRET!,
    }),
    ReactServerPlugin(),
  ],
});

export const { Authorize } = Kilpi.$createReactServerComponents();

export type Subject = (typeof Kilpi)["$$infer"]["subject"];
