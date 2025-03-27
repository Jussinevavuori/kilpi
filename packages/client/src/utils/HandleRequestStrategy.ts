import { stringify as superJsonStringify } from "superjson";

type RequestOptions = {
  signal?: AbortSignal | null | undefined;
};

export interface HandleRequestStrategy {
  request(body: unknown, options?: RequestOptions): Promise<Response>;
}

/**
 * Type of options that the `createHandleRequestStrategy` function accepts.
 */
export type AnyRequestStrategyOptions =
  | HandleRequestCallbackStrategyOptions
  | SendRequestToServerEndpointStrategyOptions;

/**
 * Create a handle request strategy based on the options provided.
 */
export function createHandleRequestStrategy(options: AnyRequestStrategyOptions) {
  if ("handleRequest" in options) {
    return new HandleRequestCallbackStrategy(options);
  }
  return new SendRequestToServerEndpointStrategy(options);
}

/**
 * Default strategy options
 */
export type SendRequestToServerEndpointStrategyOptions = {
  /**
   * URL of the Kilpi server endpoint.
   */
  endpointUrl: string;

  /**
   * Public key to authenticate with the Kilpi server.
   */
  secret: string;
};

/**
 * Default strategy: Request from server
 */
export class SendRequestToServerEndpointStrategy implements HandleRequestStrategy {
  /**
   * URL of the Kilpi server endpoint.
   */
  private endpointUrl: string;

  /**
   * Public key to authenticate with the Kilpi server.
   */
  private secret: string;

  /**
   * Method to use. Default is POST.
   */
  private method: string = "POST";

  constructor(options: SendRequestToServerEndpointStrategyOptions) {
    this.endpointUrl = options.endpointUrl;
    this.secret = options.secret;
  }

  /**
   * Implement the request method.
   */
  async request(body: unknown, options: RequestOptions = {}): Promise<Response> {
    return fetch(this.endpointUrl, {
      method: this.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.secret}`,
      },
      body: superJsonStringify(body),
      signal: options?.signal,
    });
  }
}

/**
 * Type of options that the `HandleRequestCallbackStrategy` class accepts.
 */
export type HandleRequestCallbackStrategyOptions = {
  /**
   * Provide direct request handler instead of fetching from `endpointUrl`
   */
  handleRequest: (request: Request) => Promise<Response>;

  /**
   * Public key to authenticate with the Kilpi server.
   */
  secret: string;
};

/**
 * Enable using a `handler` callback function to handle requests.
 */
export class HandleRequestCallbackStrategy implements HandleRequestStrategy {
  /**
   * Handler callback function
   */
  private handleRequest: (request: Request) => Promise<Response>;

  /**
   * Public key to authenticate with the Kilpi server.
   */
  private secret: string;

  constructor(options: HandleRequestCallbackStrategyOptions) {
    this.handleRequest = options.handleRequest;
    this.secret = options.secret;
  }

  /**
   * Implement the request method.
   */
  async request(body: unknown, options: RequestOptions = {}): Promise<Response> {
    // Construct SuperJSON stringified request from body
    const request = new Request(
      "https://127.0.0.1:3000/", // Doesn't do anything
      {
        body: superJsonStringify(body),
        method: "POST", // Otherwise body not allowed
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.secret}`,
        },
        signal: options?.signal,
      },
    );

    // Pass request directly to handler
    return this.handleRequest(request);
  }
}
