import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateContent } from "@/lib/groq";

const mockFetch = vi.fn();
const originalEnv = process.env;

beforeEach(() => {
  vi.resetAllMocks();
  process.env = { ...originalEnv };
  global.fetch = mockFetch;
});

afterEach(() => {
  process.env = originalEnv;
});

describe("generateContent", () => {
  it("throws when GROQ_API_KEY is not set", async () => {
    delete process.env.GROQ_API_KEY;
    await expect(generateContent({ prompt: "test" })).rejects.toThrow("GROQ_API_KEY is not set");
  });

  it("returns text on success", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello" } }] }),
    });
    const result = await generateContent({ prompt: "Hi" });
    expect(result.text).toBe("Hello");
  });

  it("throws on empty response", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "" } }] }),
    });
    await expect(generateContent({ prompt: "Hi" })).rejects.toThrow("Empty response from AI service");
  });

  it("retries on 429 then succeeds", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "Ok" } }] }),
      });
    const result = await generateContent({ prompt: "Hi" });
    expect(result.text).toBe("Ok");
  });

  it("throws after all models fail with retryable errors", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    mockFetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(generateContent({ prompt: "Hi" })).rejects.toThrow("AI service temporarily unavailable");
  });

  it("uses preferred model first then falls back", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    const fetchedUrls: string[] = [];
    mockFetch.mockImplementation(async (url: string) => {
      fetchedUrls.push(url);
      return { ok: true, json: async () => ({ choices: [{ message: { content: "Ok" } }] }) };
    });
    await generateContent({ prompt: "Hi", model: "llama-3.3-70b-versatile" });
    // first call should succeed on preferred model
    expect(fetchedUrls.length).toBe(1);
  });

  it("uses system instruction when provided", async () => {
    process.env.GROQ_API_KEY = "sk-abc";
    const bodies: unknown[] = [];
    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      bodies.push(JSON.parse(opts.body as string));
      return { ok: true, json: async () => ({ choices: [{ message: { content: "Ok" } }] }) };
    });
    await generateContent({ prompt: "Hi", systemInstruction: "Be nice" });
    const messages = (bodies[0] as Record<string, unknown>).messages as Array<Record<string, string>>;
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toBe("Be nice");
  });
});