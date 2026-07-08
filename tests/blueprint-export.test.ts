import { describe, it, expect } from "vitest";
import { exportBlueprint } from "@/lib/blueprint/export";
import type { BlueprintResponse } from "@/lib/blueprint/types";

const mock: BlueprintResponse = {
  critique: {
    validation: "Workflow is clearly defined.",
    currentTrends: "AI agents are trending.",
    recommendations: "Add human-in-the-loop.",
  },
  executiveSummary: {
    title: "Test Blueprint",
    problemStatement: "Problem",
    solutionOverview: "Solution",
    expectedImpact: ["Faster ops"],
    keyStakeholders: ["CTO"],
  },
  architecture: {
    description: "System description",
    components: [
      { name: "API Gateway", role: "Routes", technology: "FastAPI", description: "Handles requests" },
    ],
    dataFlow: [
      { from: "Gateway", to: "Agent", action: "forwards", dataType: "JSON" },
    ],
  },
  agents: [
    {
      id: "agent-1",
      name: "Ingest Agent",
      role: "Ingests data",
      model: "gpt-4",
      systemPrompt: "You are an intake agent.",
      tools: ["search"],
      inputs: ["query"],
      outputs: ["parsed"],
      triggers: ["on message"],
    },
  ],
  generatedAt: "2025-01-01T00:00:00.000Z",
};

describe("exportBlueprint", () => {
  it("exports JSON format", () => {
    const result = exportBlueprint({ blueprint: mock, format: "json" });
    expect(result.filename).toMatch(/\.json$/);
    expect(result.mime).toBe("application/json");
    const parsed = JSON.parse(result.content);
    expect(parsed.executiveSummary.title).toBe("Test Blueprint");
  });

  it("exports markdown format", () => {
    const result = exportBlueprint({ blueprint: mock, format: "markdown" });
    expect(result.filename).toMatch(/\.md$/);
    expect(result.mime).toBe("text/markdown");
    expect(result.content).toContain("# Test Blueprint");
    expect(result.content).toContain("## Critique");
    expect(result.content).toContain("## Agents");
    expect(result.content).toContain("### Ingest Agent");
  });

  it("exports mermaid format", () => {
    const result = exportBlueprint({ blueprint: mock, format: "mermaid" });
    expect(result.filename).toMatch(/\.mmd$/);
    expect(result.mime).toBe("text/plain");
    expect(result.content).toContain("flowchart TD");
    expect(result.content).toContain("API_Gateway");
    expect(result.content).toContain("-->");
  });

  it("slugs the filename from the title", () => {
    const result = exportBlueprint({ blueprint: mock, format: "json" });
    expect(result.filename).toBe("test-blueprint.json");
  });

  it("falls back to blueprint for empty title", () => {
    const noTitle = { ...mock, executiveSummary: { ...mock.executiveSummary, title: "" } };
    const result = exportBlueprint({ blueprint: noTitle, format: "json" });
    expect(result.filename).toBe("blueprint.json");
  });

  it("includes critique in markdown export", () => {
    const result = exportBlueprint({ blueprint: mock, format: "markdown" });
    expect(result.content).toContain(mock.critique.validation);
    expect(result.content).toContain(mock.critique.currentTrends);
    expect(result.content).toContain(mock.critique.recommendations);
  });
});