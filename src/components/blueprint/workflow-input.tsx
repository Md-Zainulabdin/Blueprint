"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldContent, FieldTitle } from "@/components/ui/field";
import { FileUpload } from "@/components/blueprint/file-upload";
import { Separator } from "@/components/ui/separator";

export interface WorkflowInputProps {
  onSubmit: (workflow: string, file?: File) => Promise<void>;
  disabled?: boolean;
}

export function WorkflowInput({ onSubmit, disabled }: WorkflowInputProps) {
  const [workflow, setWorkflow] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileSelect(f: File | null) {
    setFile(f);
    if (f) setWorkflow("");
  }

  function handleWorkflowChange(value: string) {
    setWorkflow(value);
    if (value) setFile(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workflow.trim() && !file) return;
    setSubmitting(true);
    try {
      await onSubmit(workflow.trim(), file ?? undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" noValidate>
      <FieldGroup>
        <FieldTitle className="heading-xl">Describe Your Workflow</FieldTitle>
        <p className="text-muted-foreground -mt-2">
          Tell us about a manual process you want to automate, or upload a document
          containing your business requirements.
        </p>

        <Field>
          <FieldContent className="space-y-4">
            <Textarea
              value={workflow}
              onChange={(e) => handleWorkflowChange(e.target.value)}
              placeholder={`Every morning I manually export reports from Salesforce, paste them into a Google Sheet, reformat the columns, then email the PDF to stakeholders...`}
              rows={6}
              disabled={!!file || disabled || submitting}
            />
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground/60">or</span>
              <Separator className="flex-1" />
            </div>
            <FileUpload
              onFileSelect={handleFileSelect}
              file={file}
              disabled={disabled || submitting}
            />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          disabled={(!workflow.trim() && !file) || disabled || submitting}
          className="w-full"
        >
          {submitting ? "Generating Blueprint..." : "Generate Blueprint"}
        </Button>
      </FieldGroup>
    </form>
  );
}
