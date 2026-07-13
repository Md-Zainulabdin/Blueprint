import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/groq";
import { LIMITS } from "@/lib/constants";
import { getErrorMessage, logError } from "@/lib/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining, resetAt } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${Math.ceil((resetAt - Date.now()) / 1000)} seconds.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      );
    }
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > LIMITS.MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    let body: { prompt?: string; systemInstruction?: string; model?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { prompt, systemInstruction, model } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (systemInstruction !== undefined && typeof systemInstruction !== "string") {
      return NextResponse.json(
        { error: "systemInstruction must be a string if provided" },
        { status: 400 }
      );
    }

    if (model !== undefined && typeof model !== "string") {
      return NextResponse.json(
        { error: "model must be a string if provided" },
        { status: 400 }
      );
    }

    const result = await generateContent({ prompt, systemInstruction, model });
    return NextResponse.json({ text: result.text });
  } catch (err) {
    logError("generate POST", err);
    const message = getErrorMessage(err, "An unexpected error occurred");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
