import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/groq";

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
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
