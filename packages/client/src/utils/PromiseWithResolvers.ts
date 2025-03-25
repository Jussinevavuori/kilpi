/**
 * Until Promise.withResolvers is available, this is a workaround to create a promise with
 * a `resolve` and `reject` function.
 */
export function PromiseWithResolvers<T>() {
  let resolve: (value: T) => void;
  let reject: (error: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { resolve: resolve!, reject: reject!, promise };
}
