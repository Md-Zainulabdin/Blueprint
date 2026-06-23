import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3">
      <Loader className="size-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </main>
  );
}
