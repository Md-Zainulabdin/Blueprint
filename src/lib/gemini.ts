import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

const TIMEOUT_MS = 30_000;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export interface GenerateContentParams {
  prompt: string;
  systemInstruction?: string;
  model?: string;
}

export interface GenerateContentResult {
  text: string;
}

export async function generateContent({
  prompt,
  systemInstruction,
  model = "gemini-3.1-flash-lite",
}: GenerateContentParams): Promise<GenerateContentResult> {
  const genAI = getClient();
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result.response.text();
    return { text };
  } finally {
    clearTimeout(timer);
  }
}
