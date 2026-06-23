"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldContent, FieldTitle } from "@/components/ui/field";

export interface WorkflowInputProps {
  onSubmit: (workflow: string) => Promise<void>;
  disabled?: boolean;
}

export function WorkflowInput({ onSubmit, disabled }: WorkflowInputProps) {
  const [workflow, setWorkflow] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workflow.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(workflow.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" noValidate>
      <FieldGroup>
        <FieldTitle className="heading-xl">Describe Your Workflow</FieldTitle>
        <p className="text-muted-foreground -mt-2">
          Tell us about a manual, repetitive, or messy process you want to automate.
          Be specific about the tools, steps, and pain points.
        </p>

        <Field>
          <FieldContent>
            <Textarea
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value)}
              placeholder={`Every morning I manually export reports from Salesforce, paste them into a Google Sheet, reformat the columns, then email the PDF to stakeholders...`}
              rows={8}
              disabled={disabled || submitting}
            />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          disabled={!workflow.trim() || disabled || submitting}
          className="w-full"
        >
          {submitting ? "Generating Blueprint..." : "Generate Blueprint"}
        </Button>
      </FieldGroup>
    </form>
  );
}
