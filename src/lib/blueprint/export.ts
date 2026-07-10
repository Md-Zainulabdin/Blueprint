import type { BlueprintResponse } from "@/lib/blueprint/types";

function mermaidDiagram(blueprint: BlueprintResponse): string {
  const lines: string[] = ["flowchart TD"];
  for (const comp of blueprint.architecture.components) {
    const id = comp.name.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${id}["${comp.name}"]`);
  }
  for (const flow of blueprint.architecture.dataFlow) {
    const from = flow.from.replace(/[^a-zA-Z0-9]/g, "_");
    const to = flow.to.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${from} -->|"${flow.action}"| ${to}`);
  }
  return lines.join("\n");
}

function markdownReport(blueprint: BlueprintResponse): string {
  const lines: string[] = [];

  lines.push(`# ${blueprint.executiveSummary.title}`);
  lines.push("");
  lines.push(`> Generated ${new Date(blueprint.generatedAt).toLocaleString()}`);
  lines.push("");

  lines.push("## Critique");
  lines.push("");
  lines.push(`**Validation:** ${blueprint.critique.validation}`);
  lines.push("");
  lines.push(`**Current Trends:** ${blueprint.critique.currentTrends}`);
  lines.push("");
  lines.push(`**Recommendations:** ${blueprint.critique.recommendations}`);
  lines.push("");

  lines.push("## Executive Summary");
  lines.push("");
  lines.push("### Problem");
  lines.push(blueprint.executiveSummary.problemStatement);
  lines.push("");
  lines.push("### Solution");
  lines.push(blueprint.executiveSummary.solutionOverview);
  lines.push("");
  lines.push("### Expected Impact");
  for (const item of blueprint.executiveSummary.expectedImpact) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("### Key Stakeholders");
  for (const s of blueprint.executiveSummary.keyStakeholders) {
    lines.push(`- ${s}`);
  }
  lines.push("");

  lines.push("## Architecture");
  lines.push("");
  lines.push(blueprint.architecture.description);
  lines.push("");
  lines.push("### Components");
  for (const comp of blueprint.architecture.components) {
    lines.push(`- **${comp.name}** (${comp.technology}): ${comp.role}`);
    if (comp.description) lines.push(`  - ${comp.description}`);
  }
  lines.push("");
  lines.push("### Data Flow");
  for (const flow of blueprint.architecture.dataFlow) {
    lines.push(`- ${flow.from} → ${flow.to}: ${flow.action} (${flow.dataType})`);
  }
  lines.push("");

  lines.push("## Agents");
  for (const agent of blueprint.agents) {
    lines.push(`### ${agent.name} (\`${agent.id}\`)`);
    lines.push(`- **Role:** ${agent.role}`);
    lines.push(`- **Model:** ${agent.model}`);
    lines.push(`- **Tools:** ${agent.tools.join(", ") || "None"}`);
    lines.push(`- **Triggers:** ${agent.triggers.join(", ") || "None"}`);
    lines.push(`- **Inputs:** ${agent.inputs.join(", ") || "None"}`);
    lines.push(`- **Outputs:** ${agent.outputs.join(", ") || "None"}`);
    lines.push("");
    lines.push("#### System Prompt");
    lines.push("```");
    lines.push(agent.systemPrompt);
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

export interface ExportOptions {
  blueprint: BlueprintResponse;
  format: "json" | "markdown" | "mermaid";
}

export function exportBlueprint({ blueprint, format }: ExportOptions): { content: string; filename: string; mime: string } {
  const slug = blueprint.executiveSummary.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase() || "blueprint";

  switch (format) {
    case "json":
      return {
        content: JSON.stringify(blueprint, null, 2),
        filename: `${slug}.json`,
        mime: "application/json",
      };
    case "markdown":
      return {
        content: markdownReport(blueprint),
        filename: `${slug}.md`,
        mime: "text/markdown",
      };
    case "mermaid":
      return {
        content: mermaidDiagram(blueprint),
        filename: `${slug}-architecture.mmd`,
        mime: "text/plain",
      };
  }
}

export function downloadBlueprint(blueprint: BlueprintResponse, format: "json" | "markdown" | "mermaid"): void {
  const { content, filename, mime } = exportBlueprint({ blueprint, format });
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}