"use client";

import { useState, useRef, useEffect } from "react";
import type { BlueprintResponse } from "@/lib/blueprint/types";
import { StepBar } from "@/components/blueprint/step-bar";
import { ExecutiveSummary } from "@/components/blueprint/executive-summary";
import { SystemArchitecture } from "@/components/blueprint/system-architecture";
import { DataFlow } from "@/components/blueprint/data-flow";
import { AgentCard } from "@/components/blueprint/agent-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Download } from "lucide-react";
import { saveBlueprint, SAVE_LIMIT_MESSAGE } from "@/lib/blueprint/save";
import { downloadBlueprint } from "@/lib/blueprint/export";

const TOTAL_STEPS = 4;

export interface BlueprintResultProps {
  blueprint: BlueprintResponse;
  onBack: () => void;
  readOnly?: boolean;
}

function formatGeneratedAt(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "Just now";
    return date.toLocaleString();
  } catch {
    return "Just now";
  }
}

export function BlueprintResult({ blueprint, onBack, readOnly }: BlueprintResultProps) {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showDownload, setShowDownload] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDownload) return;
    function handleClick(e: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setShowDownload(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDownload]);

  function handleSave() {
    const result = saveBlueprint(blueprint);
    if (result) {
      setSaved(true);
      setSaveError("");
    } else {
      setSaveError(SAVE_LIMIT_MESSAGE);
    }
  }

  return (
    <div className="w-full max-w-4xl space-y-8 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted-foreground">
          Generated {formatGeneratedAt(blueprint.generatedAt)}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="link-muted"
        >
          {readOnly ? "Back to Saved" : "New Blueprint"}
        </button>
      </div>

      <StepBar current={step} />

      <div key={step} className="min-w-0 motion-enter duration-300">
        {step === 1 && <ExecutiveSummary summary={blueprint.executiveSummary} />}

        {step === 2 && (
          <SystemArchitecture architecture={blueprint.architecture} />
        )}

        {step === 3 && (
          <DataFlow dataFlow={blueprint.architecture.dataFlow || []} />
        )}

        {step === 4 && (
          <section className="max-w-full space-y-5">
            <div>
              <h2 className="heading-lg">Agent Configuration</h2>
              <p className="text-muted-foreground mt-1">
                {blueprint.agents.length} autonomous agents make up this automation.
              </p>
            </div>
            <div className="max-w-full space-y-3">
              {blueprint.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={step === 1}
          onClick={() => setStep((s) => s - 1)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {step < TOTAL_STEPS ? (
            <Button type="button" size="lg" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative" ref={downloadRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDownload(!showDownload)}
                >
                  <Download className="mr-2 size-4" />
                  Download
                </Button>
                {showDownload && (
                  <div className="absolute bottom-full right-0 mb-2 flex flex-col rounded-lg border bg-popover p-1 shadow-lg">
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => { downloadBlueprint(blueprint, "json"); setShowDownload(false); }}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => { downloadBlueprint(blueprint, "markdown"); setShowDownload(false); }}
                    >
                      Markdown
                    </button>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => { downloadBlueprint(blueprint, "mermaid"); setShowDownload(false); }}
                    >
                      Mermaid
                    </button>
                  </div>
                )}
              </div>
              {readOnly ? null : (
                <div className="flex flex-col items-end gap-2">
                  {saveError && (
                    <p className="text-xs text-destructive max-w-64 text-right">{saveError}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleSave}
                    disabled={saved}
                  >
                    <Bookmark className={`mr-2 size-4 ${saved ? "fill-primary text-primary" : ""}`} />
                    {saved ? "Saved" : "Save Blueprint"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
