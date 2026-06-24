import { useState, useEffect } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Prevents hydration mismatches by rendering a placeholder until mounted.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
