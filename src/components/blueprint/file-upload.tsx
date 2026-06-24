"use client";

import { useState, useRef, type DragEvent } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIMITS, FILES } from "@/lib/constants";

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, file, disabled }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSelect(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) validateAndSelect(selected);
  }

  function validateAndSelect(f: File) {
    setError("");
    if (!FILES.ALLOWED_MIME.includes(f.type) && !f.name.endsWith(".md")) {
      setError("Unsupported file type. Accepted: PDF, DOCX, TXT, MD");
      return;
    }
    if (f.size > LIMITS.MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB");
      return;
    }
    onFileSelect(f);
  }

  function handleRemove() {
    setError("");
    onFileSelect(null);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <FileText className="size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          disabled={disabled}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive/50"
              : "border-border hover:border-muted-foreground/50"
        )}
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground/60">
          {FILES.ALLOWED_LABELS} up to 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={FILES.ALLOWED_EXTENSIONS.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
