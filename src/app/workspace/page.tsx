"use client";

import { useState, useRef, useCallback } from "react";
import { WorkflowInput } from "@/components/blueprint/workflow-input";
import { PipelineStages } from "@/components/blueprint/pipeline-stages";
import { BlueprintResult } from "@/components/blueprint/blueprint-result";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { createInitialStages } from "@/lib/blueprint/constants";
import type { PipelineStage, BlueprintResponse } from "@/lib/blueprint/types";

type Phase = "input" | "generating" | "done" | "error";

export default function WorkspacePage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const simulateStage = useCallback((index: number) => {
    setStages((prev) => {
      const next = [...prev];
      if (index > 0 && next[index - 1]) {
        next[index - 1] = { ...next[index - 1], status: "done" };
      }
      if (index < next.length && next[index]) {
        next[index] = { ...next[index], status: "running" };
      }
      return next;
    });
  }, []);

  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = new Set();
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

  function startTimers(fromIndex: number, stageCount: number) {
    const remaining = stageCount - fromIndex;
    const set = new Set<ReturnType<typeof setTimeout>>();
    for (let i = 0; i < remaining; i++) {
      const id = setTimeout(() => simulateStage(fromIndex + i), (i + 1) * 2000);
      set.add(id);
    }
    clearAllTimers();
    timersRef.current = set;
  }

  async function handleSubmit(workflow: string, file?: File) {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      setError("");
      setBlueprint(null);
      const hasFile = !!file;
      const initialStages = createInitialStages(hasFile);
      setStages(initialStages);
      setPhase("generating");

      const controller = new AbortController();
      abortRef.current = controller;

      let finalWorkflow = workflow;

      if (hasFile) {
        simulateStage(0);

        const formData = new FormData();
        formData.append("file", file);

        const extractRes = await fetch("/api/extract", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!extractRes.ok) {
          const data = await extractRes.json();
          throw new Error(data.error || "Document extraction failed");
        }

        const extracted = await extractRes.json();
        if (!extracted.text || typeof extracted.text !== "string") {
          throw new Error("Extraction returned no text content");
        }
        finalWorkflow = extracted.text;

        simulateStage(1);
        startTimers(2, initialStages.length);
      } else {
        simulateStage(0);
        startTimers(1, initialStages.length);
      }

      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: finalWorkflow }),
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
        <div className="motion-enter duration-500 flex flex-1 flex-col items-center justify-center w-full">
          <WorkflowInput onSubmit={handleSubmit} />
        </div>
      )}

      {phase === "generating" && (
        <div className="motion-enter duration-500 flex flex-1 flex-col items-center justify-center gap-8 w-full">
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
        <div className="motion-enter duration-500 flex flex-1 flex-col items-center justify-center gap-6 w-full">
          <div className="max-w-md overflow-hidden rounded-lg border border-destructive/50 bg-destructive/5 px-6 py-4 text-center space-y-2">
            <p className="font-medium text-destructive">Pipeline Failed</p>
            <p className="break-words text-muted-foreground">{error}</p>
          </div>
          <Button type="button" variant="link" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      )}

      {phase === "done" && blueprint && (
        <div className="motion-enter duration-500 flex flex-col items-center gap-8 w-full py-8">
          <BlueprintResult blueprint={blueprint} onBack={handleReset} />
        </div>
      )}
    </main>
  );
}
