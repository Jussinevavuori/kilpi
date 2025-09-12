import { createAuthClient } from "better-auth/react";

/**
 * Better-auth athentication client
 *
 * https://www.better-auth.com/docs/docs/installation
 */
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});
