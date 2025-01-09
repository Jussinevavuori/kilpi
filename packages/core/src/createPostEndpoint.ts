import { z } from "zod";
import { getPermission } from "./getPermission";
import { Ruleset } from "./ruleset";

// Schema for request data
const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("fetchSubject"),
  }),
  z.object({
    action: z.literal("fetchPermissions"),
    rules: z.object({ key: z.string(), resource: z.any().optional() }).array(),
  }),
]);

// Export types for utility
export type KilpiEndpointRequestBody = z.infer<typeof requestSchema>;
export type KilpiEndpointRequestAction = KilpiEndpointRequestBody["action"];

export type CreatePostEndpointOptions<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
> = {
  subject: TSubject | (() => Promise<TSubject>);
  ruleset: TRuleset;
  secret: string;
};

/**
 * Create post endpoint with the given options.
 */
export function createPostEndpoint<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>(options: CreatePostEndpointOptions<TSubject, TRuleset>) {
  // Endpoint body
  return async function kilpiEndpoint(request: Request) {
    try {
      // Protection: ensure secret provided to server and by client
      if (!options.secret) return new Response("No secret setup on server", { status: 501 });
      if (request.headers.get("authorization") !== `Bearer ${options.secret}`) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Parse data according to schema
      const body = requestSchema.parse(await request.json());

      // Access subject
      const subject =
        typeof options.subject === "function" ? await options.subject() : options.subject;

      // Run correct action based on specified action
      switch (body.action) {
        // Fetch subject: Simply return subject
        case "fetchSubject": {
          return Response.json(subject);
        }

        // Fetch permission: Run all specified rules and return results
        case "fetchPermissions": {
          const permissions = Promise.all(
            body.rules.map(async ({ key, resource }) => {
              return await getPermission({
                subject,
                ruleset: options.ruleset,
                // We cannot guarantee these types due to this being an endpoint
                key: key as any,
                resource: resource,
              });
            })
          );
          return Response.json(permissions);
        }
      }
    } catch (error) {
      return new Response(`Invalid request`, { status: 400 });
    }
  };
}
