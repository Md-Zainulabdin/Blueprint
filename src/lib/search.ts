import type { SearchResult } from "@/lib/blueprint/types";
import { API, TIMEOUT } from "@/lib/constants";

export interface SearchOptions {
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
}

export async function searchWeb(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return [];
  }

  const { maxResults = 5, searchDepth = "basic" } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT.TAVILY_MS);

  try {
    const res = await fetch(API.TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: searchDepth,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tavily search failed (${res.status})`);
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map(
      (r: { title?: string; url?: string; content?: string; score?: number }) => ({
        title: r.title || "",
        url: r.url || "",
        content: r.content || "",
        score: r.score ?? 0,
      })
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Tavily search timed out for query: "${query}"`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchWebBatch(
  queries: string[],
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const results = await Promise.all(
    queries.map((q) => searchWeb(q, options))
  );
  const seen = new Set<string>();
  const merged: SearchResult[] = [];

  for (const batch of results) {
    for (const result of batch) {
      if (!seen.has(result.url)) {
        seen.add(result.url);
        merged.push(result);
      }
    }
  }

  merged.sort((a, b) => b.score - a.score);

  return merged;
}
