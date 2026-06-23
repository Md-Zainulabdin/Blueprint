import type { PipelineStage } from "@/lib/blueprint/types";

/** Ordered list of pipeline stage names. Single source of truth. */
export const STAGE_NAMES = [
  "Research Extraction",
  "Context Enrichment",
  "Cognitive FDE Analysis",
] as const;

/** Creates the initial pending stage list for a fresh pipeline run. */
export function createInitialStages(): PipelineStage[] {
  return STAGE_NAMES.map((name) => ({ name, status: "pending" }));
}
