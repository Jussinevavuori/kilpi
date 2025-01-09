import { KilpiError } from "./error";

/**
 * For usage in functions which may due to their nature be easy to accidentally call in an infinite
 * recursive loop. By tracking the recursive stack size with this protector function, we are able to
 * cut the recursive loop off at a certain point and throw a more readable error message to the
 * user.
 */
export function createCallStackSizeProtector(options: {
  maxStackSize: number;
  errorMessage: string;
}) {
  let size = 0;

  return {
    /**
     * Mark function as started. Errors out if the stack size is exceeded with helpful error message.
     */
    push() {
      size++;

      if (size > options.maxStackSize) {
        throw new KilpiError.Internal(options.errorMessage);
      }
    },

    /**
     * Mark function as handled.
     */
    pop() {
      size--;

      // Underflow alert
      if (size < 0) {
        size = 0;
        console.warn(
          `CallStack size protector negative, resetting to 0. Ensure you are calling pop() only once per push().`
        );
      }
    },
  };
}
