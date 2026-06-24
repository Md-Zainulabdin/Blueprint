import type { DataFlowStep } from "@/lib/blueprint/types";
import { Badge } from "@/components/ui/badge";

export interface DataFlowProps {
  dataFlow: DataFlowStep[];
}

export function DataFlow({ dataFlow }: DataFlowProps) {
  return (
    <section className="max-w-full space-y-5">
      <div>
        <h2 className="heading-lg">Data Flow</h2>
        <p className="text-muted-foreground mt-1">
          How data moves between the system components.
        </p>
      </div>

      {dataFlow?.length ? (
        <div className="space-y-4">
          {dataFlow.map((step, i) => (
            <div
              key={`${step.from}-${step.to}-${i}`}
              className="flex flex-wrap items-center gap-3 rounded-lg border px-5 py-3"
            >
              <span className="font-semibold text-foreground">{step.from || ""}</span>
              <svg className="size-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-semibold text-foreground">{step.to || ""}</span>
              <span className="mx-1 hidden shrink-0 text-muted-foreground/50 sm:inline">·</span>
              <span className="text-muted-foreground">{step.action || ""}</span>
              <Badge variant="outline" className="ml-auto shrink-0">{step.dataType || ""}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No data flow steps provided.</p>
      )}
    </section>
  );
}
