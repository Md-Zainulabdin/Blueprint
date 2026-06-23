import { cn } from "@/lib/utils";

const STEPS = ["Summary", "Architecture", "Data Flow", "Agents"] as const;

export interface StepBarProps {
  current: number;
}

export function StepBar({ current }: StepBarProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isComplete = step < current;
          const isCurrent = step === current;
          const notLast = i < STEPS.length - 1;

          return (
            <li key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "border-2 border-primary text-primary",
                    !isComplete && !isCurrent && "border-2 border-muted-foreground/30 text-muted-foreground/50"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium max-sm:sr-only",
                    isCurrent && "text-foreground",
                    isComplete && "text-muted-foreground",
                    !isComplete && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  {label}
                </span>
              </div>
              {notLast && (
                <div
                  className={cn(
                    "mx-4 h-px flex-1 transition-colors",
                    step <= current ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
