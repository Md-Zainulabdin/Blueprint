"use client";

import { useState } from "react";
import type { AgentConfiguration } from "@/lib/blueprint/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface AgentCardProps {
  agent: AgentConfiguration;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="max-w-full overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{agent.name || "Unnamed Agent"}</p>
            <Badge variant="outline" className="shrink-0">{agent.model || "N/A"}</Badge>
          </div>
          <p className="truncate text-muted-foreground">{agent.role || ""}</p>
        </div>
        <svg
          className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="max-w-full border-t px-4 py-3.5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="heading-label mb-1">Tools</p>
              <div className="flex flex-wrap gap-1">
                {agent.tools?.length ? (
                  agent.tools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="max-w-full truncate">
                      {tool}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="heading-label mb-1">Triggers</p>
              <ul className="space-y-0.5">
                {agent.triggers?.length ? (
                  agent.triggers.map((trigger) => (
                    <li key={trigger} className="flex items-start gap-1.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span className="break-words">{trigger}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </ul>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="heading-label mb-1">Inputs</p>
              <ul className="space-y-0.5">
                {agent.inputs?.length ? (
                  agent.inputs.map((input) => (
                    <li key={input} className="flex items-start gap-1.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span className="break-words">{input}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </ul>
            </div>
            <div className="min-w-0">
              <p className="heading-label mb-1">Outputs</p>
              <ul className="space-y-0.5">
                {agent.outputs?.length ? (
                  agent.outputs.map((output) => (
                    <li key={output} className="flex items-start gap-1.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span className="break-words">{output}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </ul>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="min-w-0">
            <p className="heading-label mb-1">System Prompt</p>
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 leading-relaxed font-mono">
              {agent.systemPrompt || "No system prompt provided."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
