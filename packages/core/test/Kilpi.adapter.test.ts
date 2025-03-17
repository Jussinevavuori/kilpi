import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createKilpi,
  type KilpiAdapterInitializer,
  type KilpiRequestContext,
} from "../src";
import { TestUtils } from "./testUtils";

// Create a vitest mock functions
const defaultFn = vi.fn();

const testAdapter: KilpiAdapterInitializer = ({ defaults }) => {
  const context: KilpiRequestContext = { ...defaults };
  return {
    getContext() {
      return context;
    },
  };
};

const TestKilpiWithAdapter = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  defaults: { onUnauthorized: defaultFn },
  adapter: testAdapter,
});
const TestKilpiWithoutAdapter = createKilpi({
  getSubject: TestUtils.getSubject,
  policies: TestUtils.policies,
  defaults: { onUnauthorized: defaultFn },
});

describe("Kilpi.adapter", () => {
  beforeEach(() => defaultFn.mockReset());

  it("should use default values when no adapter is provided", async () => {
    expect(defaultFn).toHaveBeenCalledTimes(0);

    await expect(
      TestKilpiWithoutAdapter.authorize("never"),
    ).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledTimes(1);
  });
  it("should use default values when adapter is provided without value", async () => {
    expect(defaultFn).toHaveBeenCalledTimes(0);

    await expect(
      TestKilpiWithAdapter.authorize("never"),
    ).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledTimes(1);
  });
  it("should use value from adapter when value provided", async () => {
    const adapterFn = vi.fn();
    TestKilpiWithAdapter.onUnauthorized(adapterFn);

    expect(defaultFn).toHaveBeenCalledTimes(0);
    expect(adapterFn).toHaveBeenCalledTimes(0);

    await expect(
      TestKilpiWithAdapter.authorize("never"),
    ).rejects.toThrowError();

    expect(defaultFn).toHaveBeenCalledTimes(0);
    expect(adapterFn).toHaveBeenCalledTimes(1);
  });
});
