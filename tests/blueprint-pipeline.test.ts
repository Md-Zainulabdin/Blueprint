import { describe, it, expect } from "vitest";
import {
  stripCodeFences,
  isNonEmptyString,
  isStringArray,
  buildStage1Prompt,
  buildStage3Prompt,
  validateBlueprintResponse,
} from "@/lib/blueprint/pipeline";

describe("stripCodeFences", () => {
  it("removes triple backtick fences", () => {
    expect(stripCodeFences("```json\n{\"a\":1}\n```")).toBe('{"a":1}');
  });

  it("handles no fences", () => {
    expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
  });

  it("handles uppercase JSON tag", () => {
    expect(stripCodeFences("```JSON\n42\n```")).toBe("42");
  });

  it("handles leading/trailing whitespace", () => {
    expect(stripCodeFences("  \n```json\nabc\n```  ")).toBe("abc");
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty strings", () => {
    expect(isNonEmptyString("hello")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isNonEmptyString(42)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe("isStringArray", () => {
  it("returns true for array of strings", () => {
    expect(isStringArray(["a", "b"])).toBe(true);
  });

  it("returns false for mixed array", () => {
    expect(isStringArray(["a", 42])).toBe(false);
  });

  it("returns false for non-array", () => {
    expect(isStringArray("hello")).toBe(false);
  });
});

describe("buildStage1Prompt", () => {
  it("includes user input in prompt", () => {
    expect(buildStage1Prompt("my workflow")).toContain("my workflow");
  });
});

describe("buildStage3Prompt", () => {
  it("includes user input", () => {
    const result = buildStage3Prompt("user input", []);
    expect(result).toContain("user input");
  });

  it("includes no-web-context fallback when search results empty", () => {
    const result = buildStage3Prompt("test", []);
    expect(result).toContain("(No web context retrieved)");
  });

  it("includes critique instruction", () => {
    const result = buildStage3Prompt("test", []);
    expect(result).toContain("critique.validation");
  });

  it("includes source citations when search results present", () => {
    const result = buildStage3Prompt("test", [
      { title: "Source 1", url: "https://example.com", content: "Content here", score: 0.9 },
    ]);
    expect(result).toContain("Source 1");
    expect(result).toContain("https://example.com");
  });
});

describe("validateBlueprintResponse", () => {
  const validBlueprint = {
    critique: {
      validation: "The workflow is clearly described and technically feasible.",
      currentTrends: "AI agents are increasingly used for data reconciliation tasks.",
      recommendations: "Consider adding a human-in-the-loop step for approvals above $5K.",
    },
    executiveSummary: {
      title: "Test Blueprint",
      problemStatement: "A problem exists",
      solutionOverview: "We solve it",
      expectedImpact: ["Faster processing"],
      keyStakeholders: ["CTO"],
    },
    architecture: {
      description: "System architecture description",
      components: [
        { name: "API Gateway", role: "Routes requests", technology: "FastAPI", description: "Handles all external requests" },
      ],
      dataFlow: [
        { from: "Gateway", to: "Agent", action: "forwards", dataType: "JSON" },
      ],
    },
    agents: [
      {
        id: "intake-agent",
        name: "Intake Agent",
        role: "Ingests data",
        model: "gpt-4",
        systemPrompt: "You are an intake agent...",
        tools: ["search"],
        inputs: ["user query"],
        outputs: ["parsed intent"],
        triggers: ["on message"],
      },
    ],
  };

  it("passes valid blueprint", () => {
    const result = validateBlueprintResponse(validBlueprint);
    expect(result.executiveSummary.title).toBe("Test Blueprint");
    expect(result.architecture.description).toBe("System architecture description");
    expect(result.agents).toHaveLength(1);
  });

  it("throws for non-object", () => {
    expect(() => validateBlueprintResponse(null)).toThrow("must be a JSON object");
  });

  it("throws for missing critique", () => {
    expect(() => validateBlueprintResponse({})).toThrow("critique");
  });

  it("throws for missing executiveSummary", () => {
    expect(() =>
      validateBlueprintResponse({
        critique: validBlueprint.critique,
      })
    ).toThrow("executiveSummary");
  });

  it("throws for missing title", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        executiveSummary: { ...validBlueprint.executiveSummary, title: "" },
      })
    ).toThrow("title");
  });

  it("throws for missing architecture.description", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        architecture: { ...validBlueprint.architecture, description: "" },
      })
    ).toThrow("architecture.description");
  });

  it("throws for missing dataFlow fields", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        architecture: {
          ...validBlueprint.architecture,
          dataFlow: [{ from: "", to: "X", action: "send", dataType: "JSON" }],
        },
      })
    ).toThrow("dataFlow entry");
  });

  it("throws for missing agent role", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        agents: [{
          ...validBlueprint.agents[0],
          role: "",
        }],
      })
    ).toThrow("must have a non-empty role");
  });

  it("throws for missing agent model", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        agents: [{
          ...validBlueprint.agents[0],
          model: "",
        }],
      })
    ).toThrow("must have a non-empty model");
  });

  it("throws for missing agent systemPrompt", () => {
    expect(() =>
      validateBlueprintResponse({
        ...validBlueprint,
        agents: [{
          ...validBlueprint.agents[0],
          systemPrompt: "",
        }],
      })
    ).toThrow("must have a non-empty systemPrompt");
  });
});