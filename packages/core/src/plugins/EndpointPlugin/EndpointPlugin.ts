import { tryCatch } from "src/utils/tryCatch";
import * as SuperJSON from "superjson";
import { z } from "zod";
import { KilpiCore, type AnyKilpiCore } from "../../KilpiCore";
import { createKilpiPlugin } from "../../KilpiPlugin";

/**
 * Endpoint request schemas for different types of requests.
 */
export const endpointRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("getIsAuthorized"),
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
  onBeforeHandleRequest?: (req: Request) => void;
  onBeforeProcessItem?: (request: z.infer<typeof endpointRequestSchema>) => void;
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
          options.onBeforeProcessItem?.(request);

          // Utility to construct a response object
          function createResponse<T>(data: T) {
            return { requestId: request.requestId, data };
          }

          /**
           * Handle each type of request separately.
           */
          switch (request.type) {
            /**
             * Respond with a boolean for whether the current subject is authorized to
             * the policy corresponding to the action (on the object if provided).
             */
            case "getIsAuthorized": {
              // const authorizer = new KilpiAuthorizer(Kilpi, { subject });
              // const evaluation = await authorizer.evaluate({
              //   action: request.action as any,
              //   inputs: [request.object] as any,
              // });
              // return createResponse(evaluation.decision);
              return createResponse(null);
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
        };
      },
    };
  });
}
