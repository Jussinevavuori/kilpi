import { tryCatch } from "src/utils/tryCatch";
import * as SuperJSON from "superjson";
import { z } from "zod";
import type { AnyKilpiCore } from "../../KilpiCore";
import { createKilpiPlugin } from "../../KilpiPlugin";

/**
 * Endpoint request schemas for different types of requests.
 */
export const endpointRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("getIsAuthorized"),
    requestId: z.string(),
    policy: z.string(),
    resource: z.any(),
  }),
  z.object({
    type: z.literal("getSubject"),
    requestId: z.string(),
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
  onBeforeHandleRequest?: (req: Request) => void;
  onBeforeProcessItem?: (request: z.infer<typeof endpointRequestSchema>) => void;
}) {
  return createKilpiPlugin((Kilpi: T) => {
    /**
     * Utility function to process requests into a JSON object that can be responded with.
     */
    async function processRequests(body: Array<z.infer<typeof endpointRequestSchema>>) {
      return await Promise.all(
        body.map(async (request) => {
          // Callback
          options.onBeforeProcessItem?.(request);

          // Utility to construct and SuperJSON stringify a response
          function createResponse(data: unknown) {
            return { requestId: request.requestId, data };
          }

          /**
           * Handle each type of request separately.
           */
          switch (request.type) {
            /**
             * Respond with the current subject.
             */
            case "getSubject": {
              const subject = await Kilpi.getSubject();
              return createResponse(subject);
            }

            /**
             * Respond with a boolean for whether the current subject is authorized to
             * the policy (on the resource if provided).
             */
            case "getIsAuthorized": {
              const isAuthorized = request.resource
                ? await Kilpi.isAuthorized(request.policy, request.resource)
                : await Kilpi.isAuthorized(request.policy);
              return createResponse(isAuthorized);
            }
          }
        }),
      );
    }

    return {
      /**
       * Create endpoint using a web standard request-response handler. Must be used as a POST
       * endpoint.
       *
       * @param options Endpoint options.
       */
      createPostEndpoint() {
        return async function handle(req: Request) {
          return Kilpi.runInScope(async () => {
            // Callback
            options.onBeforeHandleRequest?.(req);

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
          });
        };
      },
    };
  });
}
