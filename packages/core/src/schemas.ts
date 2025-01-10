import { z } from "zod";

// Schema for request data
export const endpointRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("fetchSubject"),
  }),
  z.object({
    action: z.literal("fetchPermissions"),
    rules: z.object({ key: z.string(), resource: z.any().optional() }).array(),
  }),
]);

// Export types for utility
export type KilpiEndpointRequestBody = z.infer<typeof endpointRequestSchema>;
export type KilpiEndpointRequestAction = KilpiEndpointRequestBody["action"];
