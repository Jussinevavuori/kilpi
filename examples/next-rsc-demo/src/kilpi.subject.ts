import { headers } from "next/headers";
import { auth } from "./better-auth.server";

/**
 * Connect Kilpi to Better Auth by wrapping the better auth session as a Kilpi subject.
 */
export async function getSubject() {
  try {
    // Get session from better-auth
    const result = await auth.api.getSession({ headers: await headers() });
    if (!result) return null;

    // Return the user with the session
    return Object.assign(result.user, {
      session: result.session,
    });
  } catch (error) {
    console.error("Failed to get subject", error);
    return null;
  }
}

/**
 * Automatically infer the subject type from the getSubject function.
 */
export type Subject = Awaited<ReturnType<typeof getSubject>>;
