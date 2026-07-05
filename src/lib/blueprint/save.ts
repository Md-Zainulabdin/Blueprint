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

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function writeStorage(value: SavedBlueprint[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function saveBlueprint(blueprint: BlueprintResponse): SavedBlueprint | null {
  try {
    const existing = getSavedBlueprints();
    if (existing.length >= MAX_SAVED) return null;

    const saved: SavedBlueprint = {
      id: generateId(),
      title: blueprint.executiveSummary.title || "Untitled Blueprint",
      blueprint,
      savedAt: new Date().toISOString(),
    };

    existing.unshift(saved);
    return writeStorage(existing) ? saved : null;
  } catch {
    return null;
  }
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
  try {
    const existing = getSavedBlueprints().filter((b) => b.id !== id);
    writeStorage(existing);
  } catch {
    // delete failed silently; state remains unchanged
  }
}
