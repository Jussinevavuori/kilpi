import { z } from "zod";
import { getRuleByKey, Ruleset, RulesetKeys } from "../lib/ruleset";

/**
 * Setup endpoint such that you can simply call the `createPostEndpoint` without having to pass
 * all required arguments.
 */
export function setupEndpoint<TSubject, const TRuleset extends Ruleset<TSubject>>({
  getSubject,
  ruleset,
}: {
  getSubject: () => Promise<TSubject>;
  ruleset: TRuleset;
}) {
  /**
   * Create post endpoint
   */
  return function createPostEndpoint({ secret }: { secret: string }) {
    // Schema for request data
    const endpointRequestSchema = z.discriminatedUnion("action", [
      z.object({
        action: z.literal("fetchSubject"),
      }),
      z.object({
        action: z.literal("fetchPermission"),
        rules: z.object({ key: z.string(), resource: z.any().optional() }).array(),
      }),
    ]);

    /**
     * Web-standard endpoint implementation. Works similarly as `getPermission` for an array
     * of rules.
     */
    return async function kilpiEndpoint(request: Request) {
      try {
        // Secret not provided
        if (!secret) return new Response("No secret setup on server", { status: 501 });

        // Ensure bearer auth with secret
        if (request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Parse request and ensure valid body
        const body = endpointRequestSchema.parse(await request.json());

        // Run correct action
        switch (body.action) {
          // Fetch subject: Simply return subject
          case "fetchSubject": {
            const subject = await getSubject();
            return Response.json(subject);
          }

          // Fetch permission: Run all specified rules and return results
          case "fetchPermission": {
            const permissions = Promise.all(
              body.rules.map(async ({ key, resource }) => {
                const rule = getRuleByKey(ruleset, key as RulesetKeys<TRuleset>);
                const subject = await getSubject();
                return rule.getPermission(subject, resource);
              })
            );
            return Response.json(permissions);
          }
        }
      } catch (error) {
        return new Response(`Invalid request`, { status: 400 });
      }
    };
  };
}
