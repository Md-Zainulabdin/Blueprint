"use client";

import { useState, useEffect } from "react";
import type { BlueprintResponse } from "@/lib/blueprint/types";
import { getSavedBlueprints, deleteSavedBlueprint, MAX_SAVED } from "@/lib/blueprint/save";
import type { SavedBlueprint } from "@/lib/blueprint/save";
import { BlueprintResult } from "@/components/blueprint/blueprint-result";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function SavedPage() {
  const [items, setItems] = useState<SavedBlueprint[]>([]);
  const [viewing, setViewing] = useState<BlueprintResponse | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setItems(getSavedBlueprints());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(id: string) {
    deleteSavedBlueprint(id);
    refresh();
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (viewing) {
    return (
      <main className="flex flex-1 flex-col items-center p-6 sm:p-8">
        <BlueprintResult
          blueprint={viewing}
          readOnly
          onBack={() => setViewing(null)}
        />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h1 className="heading-xl">No saved blueprints</h1>
          <p className="text-muted-foreground">
            Generate a blueprint in the workspace and save it here. You can save up to {MAX_SAVED}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center p-6 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="heading-xl">Saved Blueprints</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} / {MAX_SAVED} saved
            </p>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1.5">Max {MAX_SAVED} blueprints</p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card px-5 py-4 space-y-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  Saved {formatDate(item.savedAt)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground/70 line-clamp-2">
                {item.blueprint.executiveSummary.problemStatement}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewing(item.blueprint)}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
