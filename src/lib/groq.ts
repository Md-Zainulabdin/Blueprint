const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 30_000;

const FREE_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
];

export interface GenerateContentParams {
  prompt: string;
  systemInstruction?: string;
  model?: string;
}

export interface GenerateContentResult {
  text: string;
}

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return key;
}

function userFacingError(status: number): string {
  switch (status) {
    case 429:
      return "AI service is currently busy. Please try again in a minute.";
    case 503:
    case 502:
    case 500:
      return "AI service temporarily unavailable. Please try again.";
    default:
      return "AI service error. Please try again.";
  }
}

function isRetryable(status: number): boolean {
  return [404, 429, 500, 502, 503].includes(status);
}

/**
 * Calls the Groq API with a user prompt and optional system instruction.
 * Automatically retries with fallback models on transient errors (429, 5xx).
 * The request is aborted after TIMEOUT_MS per model attempt.
 *
 * @throws If all models fail or the API key is missing.
 */
export async function generateContent({
  prompt,
  systemInstruction,
  model: preferredModel,
}: GenerateContentParams): Promise<GenerateContentResult> {
  const apiKey = getApiKey();

  const modelsToTry = preferredModel
    ? [preferredModel, ...FREE_MODELS.filter((m) => m !== preferredModel)]
    : FREE_MODELS;

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const messages: { role: string; content: string }[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({ model: modelName, messages }),
      });

      if (!res.ok) {
        if (isRetryable(res.status)) {
          lastError = new Error(userFacingError(res.status));
          continue;
        }
        throw new Error(userFacingError(res.status));
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from AI service");
      }
      return { text };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error("Request timed out after 30 seconds");
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("All AI models are currently unavailable");
}
