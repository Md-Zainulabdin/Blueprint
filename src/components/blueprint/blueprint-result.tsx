"use client";

import { useState } from "react";
import type { BlueprintResponse } from "@/lib/blueprint/types";
import { StepBar } from "@/components/blueprint/step-bar";
import { ExecutiveSummary } from "@/components/blueprint/executive-summary";
import { SystemArchitecture } from "@/components/blueprint/system-architecture";
import { DataFlow } from "@/components/blueprint/data-flow";
import { AgentCard } from "@/components/blueprint/agent-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 4;

export interface BlueprintResultProps {
  blueprint: BlueprintResponse;
  onReset: () => void;
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

export function BlueprintResult({ blueprint, onReset }: BlueprintResultProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="w-full max-w-4xl space-y-8 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted-foreground">
          Generated {formatGeneratedAt(blueprint.generatedAt)}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          New Blueprint
        </button>
      </div>

      <StepBar current={step} />

      <div className="min-w-0">
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
        {step < TOTAL_STEPS ? (
          <Button type="button" size="lg" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" variant="outline" size="lg" onClick={onReset}>
            Start Over
          </Button>
        )}
      </div>
    </div>
  );
}
