import type { PipelineStage } from "@/lib/blueprint/types";

export const STAGE_NAMES = [
  "Research Extraction",
  "Context Enrichment",
  "Cognitive Analysis",
] as const;

export const EXTRACTION_STAGE_NAME = "Document Extraction" as const;

export function createInitialStages(fileAttached = false): PipelineStage[] {
  if (fileAttached) {
    return [
      { name: EXTRACTION_STAGE_NAME, status: "pending" as const },
      ...STAGE_NAMES.map((name) => ({ name, status: "pending" as const })),
    ];
  }
  return STAGE_NAMES.map((name) => ({ name, status: "pending" as const }));
}
