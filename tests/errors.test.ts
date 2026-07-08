import { describe, it, expect } from "vitest";
import { getErrorMessage, logError } from "@/lib/errors";

describe("getErrorMessage", () => {
  it("returns message from Error instance", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns string directly", () => {
    expect(getErrorMessage("plain string")).toBe("plain string");
  });

  it("returns fallback for undefined", () => {
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("JSON stringifies numbers and objects", () => {
    expect(getErrorMessage(42)).toBe("42");
  });

  it("JSON stringifies objects that can be serialized", () => {
    const obj = { code: 500 };
    const result = getErrorMessage(obj, "fallback");
    expect(result).toBe('{"code":500}');
  });

  it("returns fallback when JSON.stringify fails", () => {
    const cyclical: Record<string, unknown> = {};
    cyclical.self = cyclical;
    expect(getErrorMessage(cyclical, "fallback")).toBe("fallback");
  });

  it("uses default fallback when not provided", () => {
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
  });
});

describe("logError", () => {
  it("does not throw when called with an Error", () => {
    expect(() => logError("test", new Error("test"))).not.toThrow();
  });

  it("does not throw when called with a string", () => {
    expect(() => logError("test", "string error")).not.toThrow();
  });

  it("does not throw when called with null", () => {
    expect(() => logError("test", null)).not.toThrow();
  });
});