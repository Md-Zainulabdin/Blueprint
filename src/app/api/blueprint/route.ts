import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/blueprint/pipeline";
import { getErrorMessage, logError } from "@/lib/errors";
import { LIMITS } from "@/lib/constants";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    let body: { workflow?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { workflow } = body;

    if (!workflow || typeof workflow !== "string" || workflow.trim().length === 0) {
      return NextResponse.json(
        { error: "workflow is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (workflow.length > LIMITS.MAX_WORKFLOW_CHARS) {
      return NextResponse.json(
        { error: `workflow must be under ${LIMITS.MAX_WORKFLOW_CHARS.toLocaleString()} characters` },
        { status: 400 }
      );
    }

    const blueprint = await runPipeline(workflow.trim());

    return NextResponse.json(blueprint);
  } catch (err) {
    logError("POST /api/blueprint", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "An unexpected error occurred") },
      { status: 500 }
    );
  }
}
