import { betterAuth } from "better-auth";
import { admin } from "better-auth/docs/plugins";
import { nextCookies } from "better-auth/next-js";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { db } from "./db";

/**
 * Better-auth configuration
 *
 * https://www.better-auth.com/docs/docs/installation
 */
export const auth = betterAuth({
  // Connect to Bun in-memory SQL database. It is seeded in the `seed` function
  // during Next.js instrumentation.
  database: new BunSqliteDialect({ database: db }),

  // Demo sign in with email and password.
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  plugins: [
    // Admin plugin to get "user" and "admin" roles.
    admin({ defaultRole: "user" }),
    // https://www.better-auth.com/docs/integrations/next
    nextCookies(),
  ],
});
