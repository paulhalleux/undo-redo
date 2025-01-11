import { describe, expect, it } from "vitest";

import { getErrorWithFallback } from "../../src/utils/error";

describe("getErrorWithFallback", () => {
  it("should return the same error if it is an instance of Error", () => {
    const error = new Error("Test error");
    const result = getErrorWithFallback(error);
    expect(result).toBe(error); // Same reference
    expect(result.message).toBe("Test error");
  });

  it("should create a new Error with a fallback message if input is not an Error", () => {
    const result = getErrorWithFallback("not an error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should create a new Error with a fallback message if input is null", () => {
    const result = getErrorWithFallback(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should create a new Error with a fallback message if input is undefined", () => {
    const result = getErrorWithFallback(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should handle objects that are not Errors", () => {
    const result = getErrorWithFallback({ some: "object" });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should handle numbers as input", () => {
    const result = getErrorWithFallback(404);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should handle symbols as input", () => {
    const result = getErrorWithFallback(Symbol("error"));
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });

  it("should handle functions as input", () => {
    const result = getErrorWithFallback(() => {});
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("An error occurred");
  });
});
