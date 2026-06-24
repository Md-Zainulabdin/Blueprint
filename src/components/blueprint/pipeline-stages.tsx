"use client";

import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/lib/blueprint/types";

export interface PipelineStagesProps {
  stages: PipelineStage[];
}

export function PipelineStages({ stages }: PipelineStagesProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
              stage.status === "running" && "border-primary bg-primary/5",
              stage.status === "done" && "border-border",
              stage.status === "failed" && "border-destructive bg-destructive/5",
              stage.status === "pending" && "border-input opacity-50"
            )}
          >
            <div className="flex size-6 shrink-0 items-center justify-center">
              {stage.status === "running" && (
                <div className="size-2.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {stage.status === "done" && (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {stage.status === "failed" && (
                <svg className="size-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {stage.status === "pending" && (
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  stage.status === "running" && "text-primary",
                  stage.status === "done" && "text-foreground",
                  stage.status === "failed" && "text-destructive",
                  stage.status === "pending" && "text-muted-foreground/50"
                )}
              >
                {stage.name}
              </p>
              {stage.error && (
                <p className="mt-0.5 text-xs text-destructive">{stage.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
