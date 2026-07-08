/**
 * Safely extracts a human-readable message from an unknown error value.
 * Returns the fallback string if no message can be determined.
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err === undefined || err === null) return fallback;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

/**
 * Logs an error with context to the server console.
 * In production this could be replaced with a structured logger or error tracking service.
 */
export function logError(context: string, err: unknown): void {
  const message = getErrorMessage(err, "Unknown error");
  console.error(`[${context}] ${message}`);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
}
