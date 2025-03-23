import { KilpiError } from "../error";

/**
 * Utility for making debugging of infinite loops easier.
 *
 * Wrap blocks which may be called recursively infinitively with `.run(fn)` (or manually with
 * `.push()` and `.pop()`). If the stack size exceeds the limit, an error is thrown with the provided
 * error message. This is meant to be thrown before a stack overflow error occurs, to provide a more
 * helpful error message to the user.
 */
export function createCallStackSizeProtector(options: {
  maxStackSize: number;
  errorMessage: string;
}) {
  // Current call stack size counter.
  let size = 0;

  /**
   * Mark function as started. Errors out if the stack size is exceeded with helpful error message.
   */
  function push() {
    size++;

    // Overflow alert. Max call stack size exceeded.
    if (size > options.maxStackSize) {
      throw new KilpiError.Internal(options.errorMessage);
    }
  }

  /**
   * Mark function as handled.
   */
  function pop() {
    size--;

    // Underflow alert. If this case is logged, you are calling pop() more times than push().
    if (size < 0) {
      size = 0;
      console.warn(
        `CallStack size protector negative, resetting to 0. Ensure you are calling pop() only once per push().`,
      );
    }
  }

  return {
    /**
     * Run function inside a call stack security guard, instead of manually calling push and pop
     *
     * Pass `disabled` as `true` to disable the call stack size protector for this call.
     */
    async run<T>(fn: () => Promise<T>, options: { disabled?: boolean } = {}): Promise<T> {
      if (!options?.disabled) push();
      try {
        const result = await fn();
        if (!options?.disabled) pop();
        return result;
      } catch (error) {
        if (!options?.disabled) pop();
        throw error;
      }
    },

    push,
    pop,
  };
}
