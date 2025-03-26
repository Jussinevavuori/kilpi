import "server-only";

import { createSafeActionClient } from "next-safe-action";
import { Kilpi } from "./kilpi";

export const ActionClient = createSafeActionClient({
  // Expose `ClientSafeError` messages to the client
  handleServerError(error) {
    if (error instanceof ClientSafeError) return error.message;
    return "An error occurred. Please try again later.";
  },
})
  // Scope middleware:
  //
  // Provide a Kilpi.scope to all actions using middleware. Also set all unauthorized errors to
  // throw a client safe error, so they can be displayed to the user by next-safe-action.
  //
  // Read more:
  // https://kilpi.vercel.app/concepts/scope/
  .use(async ({ next }) => {
    return await Kilpi.runInScope(async () => {
      // Return a ClientSafeError on all Kilpi unauthorization errors.
      Kilpi.onUnauthorized((error) => {
        throw new ClientSafeError(error.message ?? "Unauthorized");
      });

      // Run the action
      return await next();
    });
  });

/**
 * Error, whose message is safe to be displayed to the user.
 */
export class ClientSafeError extends Error {
  constructor(message: string) {
    super(message);
  }
}
