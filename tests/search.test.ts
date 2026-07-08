import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchWeb, searchWebBatch } from "@/lib/search";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  process.env.TAVILY_API_KEY = "tvly-abc";
  global.fetch = mockFetch;
});

afterEach(() => {
  delete process.env.TAVILY_API_KEY;
});

describe("searchWeb", () => {
  it("returns empty array and warns when TAVILY_API_KEY is missing", async () => {
    delete process.env.TAVILY_API_KEY;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const results = await searchWeb("test query");
    expect(results).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("TAVILY_API_KEY"));
    warn.mockRestore();
  });

  it("returns results on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { title: "Result 1", url: "https://example.com/1", content: "Content 1", score: 0.9 },
        ],
      }),
    });
    const results = await searchWeb("test query");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Result 1");
  });

  it("returns empty array when results are missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const results = await searchWeb("test query");
    expect(results).toEqual([]);
  });

  it("throws on fetch error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(searchWeb("test query")).rejects.toThrow("Tavily search failed (500)");
  });
});

describe("searchWebBatch", () => {
  it("merges and deduplicates results from multiple queries", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { title: "A", url: "https://a.com", content: "A", score: 0.5 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { title: "A", url: "https://a.com", content: "A", score: 0.5 },
            { title: "B", url: "https://b.com", content: "B", score: 0.8 },
          ],
        }),
      });
    const results = await searchWebBatch(["q1", "q2"]);
    expect(results).toHaveLength(2);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });
});