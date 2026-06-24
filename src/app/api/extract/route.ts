import { NextResponse } from "next/server";
import { extractText } from "@/lib/extract";
import { LIMITS, FILES } from "@/lib/constants";
import { logError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!FILES.ALLOWED_MIME.includes(file.type) && !file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 400 }
      );
    }

    if (file.size > LIMITS.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await extractText(buffer, file.name);

    return NextResponse.json(result);
  } catch (err) {
    logError("POST /api/extract", err);
    const message = err instanceof Error ? err.message : "Document extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
