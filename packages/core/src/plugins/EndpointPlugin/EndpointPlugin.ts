import { KilpiPolicy } from "src/KilpiPolicy";
import { tryCatch } from "src/utils/tryCatch";
import type { MaybePromise } from "src/utils/types";
import * as SuperJSON from "superjson";
import { z } from "zod";
import { KilpiCore, type AnyKilpiCore } from "../../KilpiCore";
import { createKilpiPlugin } from "../../KilpiPlugin";

/**
 * Endpoint request schemas for different types of requests.
 */
export const endpointRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fetchDecision"),
    requestId: z.string(),
    action: z.string(),
    object: z.any(),
  }),
]);

/**
 * Endpoint plugin. Apply this plugin as
 *
 * ```ts
 * export const Kilpi = createKilpi({
 *   ...,
 *   plugins: [EndpointPlugin({ secret: "my-public-secret" })]
 * })
 *
 * export const POST = Kilpi.createPostEndpoint();
 */
export function EndpointPlugin<T extends AnyKilpiCore>(options: {
  secret: string;
  getContext?: (req: Request) => T["$$infer"]["context"];
  onBeforeHandleRequest?: (req: Request) => MaybePromise<void | never | Response>;
  onBeforeProcessItem?: (request: z.infer<typeof endpointRequestSchema>) => MaybePromise<void>;
}) {
  return createKilpiPlugin((Kilpi: T) => {
    /**
     * Utility function to process requests into a JSON object that can be responded with.
     */
    async function processRequests(
      body: Array<z.infer<typeof endpointRequestSchema>>,
      ctx?: T["$$infer"]["context"],
    ) {
      // Resolve shared subject for all requests
      const subject = await KilpiCore.expose(Kilpi).getSubject(ctx);
      void subject; // Placeholder

      return await Promise.all(
        body.map(async (request) => {
          // Callback
          await options.onBeforeProcessItem?.(request);

          // Utility to construct a response object
          function createResponse<T>(data: T) {
            return { requestId: request.requestId, data };
          }

          // Process requests by type
          switch (request.type) {
            /**
             * Fetch the decision for a given policy.
             */
            case "fetchDecision": {
              // Initialize policy
              const policy = new KilpiPolicy({
                core: Kilpi,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                action: request.action as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputs: [request.object] as any,
              });

              // Evaluate policy with pre-resolved subject
              const decision = await policy.authorize({ subject });

              // Respond with the decision
              return createResponse({ decision });
            }
          }
        }),
      );
    }

    return {
      extendCore() {
        return {
          /**
           * Create endpoint using a web standard request-response handler. Must be used as a POST
           * endpoint.
           *
           * @param options Endpoint options.
           */
          $createPostEndpoint() {
            return async function handle(req: Request) {
              // Callback: allow early response or modification of request
              const earlyResponse = await options.onBeforeHandleRequest?.(req);
              if (earlyResponse) return earlyResponse;

              // Authenticate request: Must have Bearer {secret} in Authorization header.
              if (req.headers.get("Authorization") !== `Bearer ${options.secret}`) {
                return Response.json({ message: "Unauthorized" }, { status: 401 });
              }

              // Parse and validate body
              const body = await tryCatch(
                req
                  .text()
                  .then((data) => SuperJSON.parse(data))
                  .then((data) => endpointRequestSchema.array().parse(data)),
              );

              // Invalid request body
              if (body.error) {
                return Response.json({ message: "Invalid request body" }, { status: 400 });
              }

              // Process each request, and respond with the results as SuperJSON
              const responses = await processRequests(body.value);
              return Response.json(SuperJSON.stringify(responses));
            };
          },
        };
      },
    };
  });
}
