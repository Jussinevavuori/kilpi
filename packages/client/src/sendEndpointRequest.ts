import { KilpiEndpointRequestBody, KilpiError } from "@kilpi/core";

export type SendEndpointRequestOptions = {
  secret: string;
  endpoint: string;
};

/**
 * Sends an endpoint request. Does not parse / guarantee types on output. Errors on non-200 status.
 * Returns null on error. If provided `TData`, will return `TData` on success -- not a validated
 * guarantee.
 */
export async function sendEndpointRequest<TData>(
  body: KilpiEndpointRequestBody,
  options: SendEndpointRequestOptions
): Promise<TData> {
  try {
    // POST query to endpoint with authorization
    const response = await fetch(options.endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${options.secret}` },
    });

    // Error
    if (response.status !== 200) {
      throw new KilpiError.FetchSubjectFailed(
        `Failed to get subject (${response.status} ${
          response.statusText
        }): ${await response.text()}`
      );
    }

    // Parse response
    return (await response.json()) as TData;
  } catch (error) {
    // Any failure
    throw new KilpiError.Internal(`Failed to fetch from endpoint`, { cause: error });
  }
}
