import { createCallStackSizeProtector } from "src/utils/callStackSizeProtector";
import { describe, expect, it } from "vitest";

function init() {
  const stack = createCallStackSizeProtector({
    maxStackSize: 3,
    errorMessage: "Stack size exceeded",
  });

  async function recurseTimes(n: number): Promise<void> {
    if (n <= 0) return;
    await stack.run(async () => {
      await recurseTimes(n - 1);
    });
  }

  return { stack, recurseTimes };
}

describe("callStackSizeProtector", () => {
  it("should throw error when stack size exceeded", async () => {
    const { recurseTimes } = init();
    await expect(recurseTimes(4)).rejects.toThrowError();
  });

  it("should not throw error when stack size not exceeded", async () => {
    const { recurseTimes } = init();
    await expect(recurseTimes(2)).resolves.toBe(undefined);
  });

  it("should throw when calling push() too many times", async () => {
    const { stack } = init();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).toThrowError();
  });

  it("pop() should reduce pushed", async () => {
    const { stack } = init();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();

    expect(() => stack.pop()).not.toThrowError();
    expect(() => stack.pop()).not.toThrowError();
    expect(() => stack.pop()).not.toThrowError();

    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).not.toThrowError();
    expect(() => stack.push()).toThrowError();
  });
});
