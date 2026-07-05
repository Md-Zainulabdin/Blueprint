import { generateContent } from "@/lib/groq";
import { searchWebBatch } from "@/lib/search";
import { getErrorMessage } from "@/lib/errors";
import { STAGE_NAMES } from "@/lib/blueprint/constants";
import { MODELS, LIMITS } from "@/lib/constants";
import type {
  BlueprintResponse,
  PipelineStage,
  ResearchQuery,
  SearchResult,
  AgentConfiguration,
  StageCallback,
} from "@/lib/blueprint/types";

const STAGE1_SYSTEM = `You are a research extraction specialist. Your sole task is to analyze a user's workflow description and produce 1-2 precise web search queries that will surface relevant documentation, API references, or technical limitations of the tools the user mentions.

Rules:
- Each query must be specific enough to return useful technical context.
- Include the tool name and the aspect that needs investigation.
- Return ONLY valid JSON in this exact shape:
{
  "queries": [
    { "query": "string", "rationale": "string" }
  ]
}
- Output no more than 2 queries.`;

const STAGE3_SYSTEM = `You are an enterprise architect. You are given a user's workflow description and live web research context about their tools. Your job is to design a complete, production-grade AI-agent automation plan.

Think step by step:
1. Understand the user's current manual workflow and its bottlenecks.
2. Use the web research to understand the technical constraints and capabilities of their existing tools.
3. Architect an AI-driven solution that replaces their manual process with autonomous agents.
4. Define each agent's exact system prompt, tools, inputs, outputs, and triggers.

Writing style guidelines:
- Write in a natural, human tone — like a senior consultant explaining their recommendation.
- Problem and solution descriptions should be narrative and specific, not generic bullet lists.
- Avoid jargon-heavy language; make it accessible to a business audience while remaining technically precise.
- Expected impact items should feel like real outcomes a stakeholder would care about.

Each agent's systemPrompt must follow this structured format:

**Persona**: Who the agent is (role, expertise, tone).
**Task**: The core responsibility this agent carries out.
**Context**: Background information, constraints, and relevant business rules.
**Output format**: What the agent produces and how it structures its response.

Example:
Persona: You are a Sales Reconciliation Agent, a meticulous data analyst skilled in CRM data extraction and variance detection. You communicate clearly and flag discrepancies immediately.
Task: Cross-reference Salesforce opportunities with NetSuite invoices daily, identify mismatches in amounts or statuses, and escalate discrepancies exceeding $500 to the Finance Review Queue.
Context: The company runs month-end close on the 5th of each month. Invoices under $5K can be auto-approved; anything above requires a manager's sign-off. Opportunity stages in Salesforce must match "Closed Won" before an invoice is considered valid.
Output format: For each reconciliation run, produce a JSON report containing: matched_pairs (array of {opportunity_id, invoice_id, amount, status}), discrepancies (array of {opportunity_id, invoice_id, difference, reason}), and a summary line with total matched, total discrepancies, and total dollar variance.

Return ONLY valid JSON matching this exact TypeScript shape — no markdown, no code fences:

{
  "executiveSummary": {
    "title": "string — short, punchy project name",
    "problemStatement": "string — narrative description of the current pain and its business impact",
    "solutionOverview": "string — how AI agents transform the workflow (human style, not robotic)",
    "expectedImpact": ["string — tangible, specific outcome stakeholders would care about"],
    "keyStakeholders": ["string — role or title"]
  },
  "architecture": {
    "description": "string — high-level data flow narrative",
    "components": [
      {
        "name": "string — component name",
        "role": "string — what it does in the system",
        "technology": "string — chosen tech (be specific)",
        "description": "string — detailed responsibility"
      }
    ],
    "dataFlow": [
      {
        "from": "string",
        "to": "string",
        "action": "string — verb describing the data movement",
        "dataType": "string — what shape of data"
      }
    ]
  },
  "agents": [
    {
      "id": "string — unique slug like 'intake-agent'",
      "name": "string — human-readable name",
      "role": "string — one-line job title",
      "model": "string — recommended model ID",
      "systemPrompt": "string — structured prompt following Persona / Task / Context / Output format",
      "tools": ["string — tool names this agent uses"],
      "inputs": ["string — what this agent receives"],
      "outputs": ["string — what this agent produces"],
      "triggers": ["string — event or schedule that starts this agent"]
    }
  ]
}

Constraints:
- Be specific with technology choices (e.g. "OpenAI GPT-4o", "LangChain", "PostgreSQL", "Redis", "n8n", "Make.com").
- Each systemPrompt must include all four sections: Persona, Task, Context, Output format.
- Write in natural, consultant-level prose — not robotic or template-like.
- Design at least 3 agents but no more than 6.
- The architecture should include 4-8 components.`;

function buildStage1Prompt(userInput: string): string {
  return [
    `Extract search queries from the following workflow description:\n`,
    userInput,
  ].join("\n");
}

function buildStage3Prompt(
  userInput: string,
  searchContext: SearchResult[]
): string {
  const contextBlock = searchContext
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.title}](${r.url})\n${r.content.slice(0, LIMITS.MAX_SEARCH_SNIPPET)}`
    )
    .join("\n\n");

  return [
    `## User Workflow Description`,
    userInput,
    ``,
    `## Live Web Research Context`,
    contextBlock || "(No web context retrieved)",
    ``,
    `Based on the above, generate a complete blueprint following the specified JSON schema.`,
  ].join("\n");
}

function stripCodeFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function validateBlueprintResponse(value: unknown): BlueprintResponse {
  if (!value || typeof value !== "object") {
    throw new Error("Blueprint response must be a JSON object");
  }

  const obj = value as Record<string, unknown>;

  if (!obj.executiveSummary || typeof obj.executiveSummary !== "object") {
    throw new Error("executiveSummary is required and must be an object");
  }
  const es = obj.executiveSummary as Record<string, unknown>;

  if (!isNonEmptyString(es.title)) {
    throw new Error("executiveSummary.title is required and must be a non-empty string");
  }
  if (!isNonEmptyString(es.problemStatement)) {
    throw new Error("executiveSummary.problemStatement is required");
  }
  if (!isNonEmptyString(es.solutionOverview)) {
    throw new Error("executiveSummary.solutionOverview is required");
  }
  if (!isStringArray(es.expectedImpact)) {
    throw new Error("executiveSummary.expectedImpact must be a string array");
  }
  if (!isStringArray(es.keyStakeholders)) {
    throw new Error("executiveSummary.keyStakeholders must be a string array");
  }

  if (!obj.architecture || typeof obj.architecture !== "object") {
    throw new Error("architecture is required and must be an object");
  }
  const arch = obj.architecture as Record<string, unknown>;

  if (!Array.isArray(arch.components)) {
    throw new Error("architecture.components must be an array");
  }
  for (const comp of arch.components) {
    if (!comp || typeof comp !== "object") {
      throw new Error("Each architecture component must be an object");
    }
    const c = comp as Record<string, unknown>;
    if (!isNonEmptyString(c.name)) {
      throw new Error("Each architecture component must have a non-empty name");
    }
    if (!isNonEmptyString(c.technology)) {
      throw new Error(`Component "${c.name}" must have a non-empty technology`);
    }
    if (!isNonEmptyString(c.role)) {
      throw new Error(`Component "${c.name}" must have a non-empty role`);
    }
  }

  if (!isNonEmptyString(arch.description)) {
    throw new Error("architecture.description is required and must be a non-empty string");
  }

  if (!Array.isArray(arch.dataFlow)) {
    throw new Error("architecture.dataFlow must be an array");
  }
  for (const flow of arch.dataFlow) {
    if (!flow || typeof flow !== "object") {
      throw new Error("Each dataFlow entry must be an object");
    }
    const f = flow as Record<string, unknown>;
    if (!isNonEmptyString(f.from) || !isNonEmptyString(f.to) || !isNonEmptyString(f.action)) {
      throw new Error("Each dataFlow entry must have non-empty from, to, and action");
    }
  }

  if (!Array.isArray(obj.agents)) {
    throw new Error("agents must be an array");
  }
  for (const agent of obj.agents) {
    if (!agent || typeof agent !== "object") {
      throw new Error("Each agent must be an object");
    }
    const a = agent as Record<string, unknown>;
    if (!isNonEmptyString(a.id)) {
      throw new Error("Each agent must have a non-empty id");
    }
    if (!isNonEmptyString(a.name)) {
      throw new Error(`Agent "${a.id}" must have a non-empty name`);
    }
    if (!isNonEmptyString(a.role)) {
      throw new Error(`Agent "${a.id}" must have a non-empty role`);
    }
    if (!isNonEmptyString(a.model)) {
      throw new Error(`Agent "${a.id}" must have a non-empty model`);
    }
    if (!isNonEmptyString(a.systemPrompt)) {
      throw new Error(`Agent "${a.id}" must have a non-empty systemPrompt`);
    }
    if (!isStringArray(a.tools)) {
      throw new Error(`Agent "${a.id}" tools must be a string array`);
    }
    if (!isStringArray(a.inputs)) {
      throw new Error(`Agent "${a.id}" inputs must be a string array`);
    }
    if (!isStringArray(a.outputs)) {
      throw new Error(`Agent "${a.id}" outputs must be a string array`);
    }
    if (!isStringArray(a.triggers)) {
      throw new Error(`Agent "${a.id}" triggers must be a string array`);
    }
  }

  const blueprint: BlueprintResponse = {
    executiveSummary: {
      title: es.title as string,
      problemStatement: es.problemStatement as string,
      solutionOverview: es.solutionOverview as string,
      expectedImpact: es.expectedImpact as string[],
      keyStakeholders: es.keyStakeholders as string[],
    },
    architecture: {
      description: arch.description as string,
      components: arch.components as BlueprintResponse["architecture"]["components"],
      dataFlow: arch.dataFlow as BlueprintResponse["architecture"]["dataFlow"],
    },
    agents: obj.agents as AgentConfiguration[],
    generatedAt: "",
  };

  return blueprint;
}

/**
 * Runs the full 3-stage cognitive pipeline:
 *
 * 1. Research Extraction — LLM extracts 1-2 search queries from user input.
 * 2. Context Enrichment — Web search (Tavily) against those queries.
 * 3. Cognitive Analysis — Final LLM call produces structured BlueprintResponse.
 *
 * Each stage emits its status via the optional `onStage` callback.
 *
 * @throws If any stage fails, with a descriptive error message.
 */
export async function runPipeline(
  userInput: string,
  onStage?: StageCallback
): Promise<BlueprintResponse> {
  const emit = (name: string, status: PipelineStage["status"], error?: string) => {
    try {
      onStage?.({ name, status, error });
    } catch {
      // consumer's callback must not break the pipeline
    }
  };

  // ── Stage 1: Research Extraction ──────────────────────────────────
  emit(STAGE_NAMES[0], "running");

  let queries: ResearchQuery[];
  try {
    const stage1 = await generateContent({
      prompt: buildStage1Prompt(userInput),
      systemInstruction: STAGE1_SYSTEM,
    });
    const cleaned = stripCodeFences(stage1.text);
    const parsed = JSON.parse(cleaned);
    queries = parsed.queries;
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error("No queries extracted");
    }
    for (const q of queries) {
      if (!q || typeof q.query !== "string" || !q.query.trim()) {
        throw new Error("Each research query must have a non-empty query string");
      }
    }
  } catch (err) {
    const message = getErrorMessage(err, "Stage 1 failed");
    emit(STAGE_NAMES[0], "failed", message);
    throw new Error(`Stage 1 (Research Extraction) failed: ${message}`);
  }

  emit(STAGE_NAMES[0], "done");

  // ── Stage 2: Context Enrichment ───────────────────────────────────
  emit(STAGE_NAMES[1], "running");

  let searchResults: SearchResult[];
  try {
    const queryStrings = queries.map((q) => q.query);
    searchResults = await searchWebBatch(queryStrings, {
      maxResults: 5,
      searchDepth: "advanced",
    });
  } catch (err) {
    const message = getErrorMessage(err, "Stage 2 failed");
    emit(STAGE_NAMES[1], "failed", message);
    throw new Error(`Stage 2 (Context Enrichment) failed: ${message}`);
  }

  emit(STAGE_NAMES[1], "done");

  // ── Stage 3: Cognitive Analysis ───────────────────────────────
  emit(STAGE_NAMES[2], "running");

  try {
    const stage3 = await generateContent({
      prompt: buildStage3Prompt(userInput, searchResults),
      systemInstruction: STAGE3_SYSTEM,
      model: MODELS.STAGE3,
    });

    const cleaned = stripCodeFences(stage3.text);
    const parsed = JSON.parse(cleaned);
    const blueprint = validateBlueprintResponse(parsed);
    blueprint.generatedAt = new Date().toISOString();

    emit(STAGE_NAMES[2], "done");
    return blueprint;
  } catch (err) {
    const message = getErrorMessage(err, "Stage 3 failed");
    emit(STAGE_NAMES[2], "failed", message);
    throw new Error(`Stage 3 (Cognitive Analysis) failed: ${message}`);
  }
}
