import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractText } from "@/lib/extract";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = mockFetch;
});

describe("extractText", () => {
  it("throws on unsupported extension", async () => {
    await expect(extractText(Buffer.from("x"), "file.xyz")).rejects.toThrow("Unsupported file type: .xyz");
  });

  it("throws on extensionless filename", async () => {
    await expect(extractText(Buffer.from("x"), "README")).rejects.toThrow("Cannot determine file extension");
  });

  it("extracts text from .txt", async () => {
    const result = await extractText(Buffer.from("hello world"), "file.txt");
    expect(result.text).toBe("hello world");
    expect(result.metadata.type).toBe("txt");
    expect(result.metadata.words).toBe(2);
  });

  it("extracts text from .md", async () => {
    const result = await extractText(Buffer.from("# Title\n\nBody text."), "doc.md");
    expect(result.text).toContain("Title");
    expect(result.metadata.type).toBe("md");
  });

  it("wraps errors in a descriptive message", async () => {
    const err = Buffer.from("").buffer;
    // inject invalid input that causes a throw in the try block
    await expect(extractText(Buffer.from("x"), "")).rejects.toThrow("from filename");
  });
});