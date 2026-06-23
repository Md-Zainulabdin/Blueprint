"use client";

import { useState, useRef, useCallback } from "react";
import { WorkflowInput } from "@/components/blueprint/workflow-input";
import { PipelineStages } from "@/components/blueprint/pipeline-stages";
import { BlueprintResult } from "@/components/blueprint/blueprint-result";
import { getErrorMessage } from "@/lib/errors";
import { STAGE_NAMES, createInitialStages } from "@/lib/blueprint/constants";
import type { PipelineStage, BlueprintResponse } from "@/lib/blueprint/types";

type Phase = "input" | "generating" | "done" | "error";

export default function WorkspacePage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const simulateStage = useCallback((index: number) => {
    setStages((prev) => {
      const next = [...prev];
      if (index > 0 && next[index - 1]) {
        next[index - 1] = { ...next[index - 1], status: "done" };
      }
      if (index < STAGE_NAMES.length && next[index]) {
        next[index] = { name: STAGE_NAMES[index], status: "running" };
      }
      return next;
    });
  }, []);

  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function markStageFailed(message: string) {
    setStages((prev) => {
      const runningIdx = prev.findIndex((s) => s.status === "running");
      if (runningIdx !== -1) {
        const next = [...prev];
        next[runningIdx] = { ...next[runningIdx], status: "failed", error: message };
        return next;
      }
      return prev.map((s) =>
        s.status === "running" ? { ...s, status: "failed", error: message } : s
      );
    });
  }

  async function handleSubmit(workflow: string) {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      setError("");
      setBlueprint(null);
      const initialStages = createInitialStages();
      setStages(initialStages);
      setPhase("generating");

      const controller = new AbortController();
      abortRef.current = controller;

      simulateStage(0);

      // Advance stages visually at paced intervals while the API runs
      timersRef.current = STAGE_NAMES.slice(1).map((_, i) =>
        setTimeout(() => simulateStage(i + 1), (i + 1) * 2000)
      );

      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
        signal: controller.signal,
      });

      clearAllTimers();

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Blueprint generation failed");
      }

      const data: BlueprintResponse = await res.json();
      setBlueprint(data);
      setStages((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      setPhase("done");
    } catch (err) {
      clearAllTimers();
      if (err instanceof Error && err.name === "AbortError") return;
      const message = getErrorMessage(err, "Unknown error");
      setError(message);
      markStageFailed(message);
      setPhase("error");
    } finally {
      submittingRef.current = false;
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    clearAllTimers();
    submittingRef.current = false;
    setPhase("input");
    setStages([]);
    setBlueprint(null);
    setError("");
  }

  return (
    <main className="flex flex-1 flex-col items-center p-6 sm:p-8">
      {phase === "input" && (
        <div className="flex flex-1 flex-col items-center justify-center w-full">
          <WorkflowInput onSubmit={handleSubmit} />
        </div>
      )}

      {phase === "generating" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 w-full">
          <div className="text-center space-y-1">
            <h2 className="heading-lg">Analyzing Your Workflow</h2>
            <p className="text-muted-foreground">
              Running cognitive analysis pipeline...
            </p>
          </div>
          <PipelineStages stages={stages} />
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 w-full">
          <div className="max-w-md overflow-hidden rounded-lg border border-destructive/50 bg-destructive/5 px-6 py-4 text-center space-y-2">
            <p className="font-medium text-destructive">Pipeline Failed</p>
            <p className="break-words text-muted-foreground">{error}</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Try Again
          </button>
        </div>
      )}

      {phase === "done" && blueprint && (
        <div className="flex flex-col items-center gap-8 w-full py-8">
          <BlueprintResult blueprint={blueprint} onReset={handleReset} />
        </div>
      )}
    </main>
  );
}
