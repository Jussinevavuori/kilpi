import { nanoid } from "nanoid";
import { cookies } from "next/headers";

/**
 * Next.js trick to force revalidate the current page by setting a random short-lived value as
 * a cookie.
 */
export async function forceRevalidateCurrentPage() {
  const jar = await cookies();
  jar.set(`FORCE_REVALIDATE_CURRENT_PAGE`, nanoid(), { maxAge: 1 });
}
