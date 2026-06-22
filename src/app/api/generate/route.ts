import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAIError,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { generateContent } from "@/lib/gemini";

const MAX_BODY_SIZE = 100_000;

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();

    if (text.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 },
      );
    }

    const body = JSON.parse(text);
    const { prompt, systemInstruction, model } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 },
      );
    }

    const result = await generateContent({ prompt, systemInstruction, model });
    return NextResponse.json({ text: result.text });
  } catch (err) {
    if (err instanceof GoogleGenerativeAIFetchError) {
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait before retrying." },
          { status: 429 },
        );
      }
      if (err.status === 403 || err.status === 401) {
        return NextResponse.json(
          {
            error:
              "Authentication or quota error. Check your API key and usage limits.",
          },
          { status: err.status },
        );
      }
    }

    if (err instanceof GoogleGenerativeAIError) {
      return NextResponse.json(
        { error: "The AI service encountered an error" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
