/**
 * Utility for more readable error messages when jobs fail.
 */
export function getRequestErrorMessage(status: number) {
  const rows = [
    "Kilpi client failed to request authorization checks from the server.",
    `(Responded with status: ${status}).`,
  ];

  if (status === 400) {
    rows.push("Request body was invalid.");
    rows.push("Ensure the request body is an array of valid request objects.");
  }

  if (status === 404) {
    rows.push("Kilpi server was not found.");
    rows.push("Ensure the endpoint is available as a POST endpoint at `kilpiUrl`.");
  }

  if (status === 401) {
    rows.push("Unauthorized to access Kilpi server.");
    rows.push("Ensure you have the correct `kilpiSecret` setup in the client and the server.");
  }

  return rows.join(" ");
}
