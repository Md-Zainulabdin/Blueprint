import type { ExecutiveSummary } from "@/lib/blueprint/types";
import { Badge } from "@/components/ui/badge";

export interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <section className="max-w-full space-y-5">
      <h2 className="heading-xl">{summary.title || "Executive Summary"}</h2>

      <div className="space-y-4">
        <div>
          <h3 className="heading-label">Problem</h3>
          <p className="mt-1 break-words">{summary.problemStatement || "No problem statement provided."}</p>
        </div>

        <div>
          <h3 className="heading-label">Solution</h3>
          <p className="mt-1 break-words">{summary.solutionOverview || "No solution overview provided."}</p>
        </div>

        <div>
          <h3 className="heading-label">Expected Impact</h3>
          <ul className="mt-1.5 space-y-1">
            {summary.expectedImpact?.length ? (
              summary.expectedImpact.map((item, i) => (
                <li key={`impact-${i}`} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="break-words">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No impacts listed.</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="heading-label">Key Stakeholders</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {summary.keyStakeholders?.length ? (
              summary.keyStakeholders.map((stakeholder, i) => (
                <Badge key={`stakeholder-${i}`} variant="outline" className="max-w-full truncate">
                  {stakeholder}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No stakeholders listed.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
