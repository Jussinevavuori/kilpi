export async function tryCatch<T>(promise: Promise<T>): Promise<
  | {
      value: T;
      error: null;
    }
  | {
      value: null;
      error: Error;
    }
> {
  try {
    return { value: await promise, error: null };
  } catch (error) {
    return { value: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
