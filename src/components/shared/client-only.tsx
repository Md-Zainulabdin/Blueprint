"use client";

import { useMounted } from "@/lib/hooks/use-mounted";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return <>{children}</>;
}
