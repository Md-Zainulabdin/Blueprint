import type { SystemArchitecture } from "@/lib/blueprint/types";

export interface SystemArchitectureProps {
  architecture: SystemArchitecture;
}

export function SystemArchitecture({ architecture }: SystemArchitectureProps) {
  return (
    <section className="max-w-full space-y-5">
      <div>
        <h2 className="heading-lg">System Architecture</h2>
        <p className="text-muted-foreground mt-1 break-words">
          {architecture.description || "No architecture description provided."}
        </p>
      </div>

      <div className="min-w-0">
        <h3 className="heading-label mb-3">Components</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {architecture.components?.map((component) => (
            <div
              key={component.name}
              className="rounded-lg border p-4 space-y-2"
            >
              <p className="font-semibold">{component.name}</p>
              <p className="text-xs font-mono text-muted-foreground/60">{component.technology}</p>
              <p className="text-muted-foreground">{component.role || ""}</p>
              <p className="break-words text-muted-foreground/70">
                {component.description || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
