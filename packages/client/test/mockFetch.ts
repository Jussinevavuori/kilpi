/**
 * Given a web standard request-response handler, returns a mock fetch function which always
 * runs that handler function. Used for testing.
 */
export function mockFetch(handler: (req: Request) => Promise<Response>): typeof fetch {
  return function mockedFetch(url, opts): Promise<Response> {
    const req = new Request(url, opts);
    return handler(req);
  };
}
