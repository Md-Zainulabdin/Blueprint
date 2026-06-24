import type { BlueprintResponse } from "@/lib/blueprint/types";

export interface SavedBlueprint {
  id: string;
  title: string;
  blueprint: BlueprintResponse;
  savedAt: string;
}

const STORAGE_KEY = "blueprint-saved";
export const MAX_SAVED = 3;
export const SAVE_LIMIT_MESSAGE = `You can only save up to ${MAX_SAVED} blueprints. Delete an existing one to save this.`;

export function saveBlueprint(blueprint: BlueprintResponse): SavedBlueprint | null {
  const existing = getSavedBlueprints();
  if (existing.length >= MAX_SAVED) return null;

  const saved: SavedBlueprint = {
    id: crypto.randomUUID(),
    title: blueprint.executiveSummary.title || "Untitled Blueprint",
    blueprint,
    savedAt: new Date().toISOString(),
  };

  existing.unshift(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  return saved;
}

export function getSavedBlueprints(): SavedBlueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBlueprint[];
  } catch {
    return [];
  }
}

export function deleteSavedBlueprint(id: string): void {
  const existing = getSavedBlueprints().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
