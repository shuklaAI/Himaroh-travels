import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Trip", "Travellers", "Accommodation", "Review"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center justify-between">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isDone && "border-gold bg-gold text-navy",
                  isActive && "border-gold text-gold",
                  !isDone && !isActive && "border-navy/15 text-navy/30"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isActive || isDone ? "text-navy" : "text-navy/40"
                )}
              >
                {label}
              </span>
            </div>
            {stepNum !== STEPS.length && (
              <div className={cn("mx-2 h-px flex-1", isDone ? "bg-gold" : "bg-navy/10")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
