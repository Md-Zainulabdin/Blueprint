import { describe, it, expect } from "vitest";
import { createInitialStages, STAGE_NAMES, EXTRACTION_STAGE_NAME } from "@/lib/blueprint/constants";

describe("constants", () => {
  it("exports three stages", () => {
    expect(STAGE_NAMES).toHaveLength(3);
    expect(STAGE_NAMES[0]).toBe("Research Extraction");
    expect(STAGE_NAMES[1]).toBe("Context Enrichment");
    expect(STAGE_NAMES[2]).toBe("Cognitive Analysis");
  });

  it("exports extraction stage name", () => {
    expect(EXTRACTION_STAGE_NAME).toBe("Document Extraction");
  });
});

describe("createInitialStages", () => {
  it("returns 3 stages without file", () => {
    const stages = createInitialStages(false);
    expect(stages).toHaveLength(3);
    for (const s of stages) {
      expect(s.status).toBe("pending");
    }
    expect(stages[0].name).toBe("Research Extraction");
  });

  it("returns 4 stages with file (includes Document Extraction)", () => {
    const stages = createInitialStages(true);
    expect(stages).toHaveLength(4);
    expect(stages[0].name).toBe("Document Extraction");
    expect(stages[0].status).toBe("pending");
    expect(stages[1].name).toBe("Research Extraction");
  });

  it("defaults to no file", () => {
    const stages = createInitialStages();
    expect(stages).toHaveLength(3);
  });
});