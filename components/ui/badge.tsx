import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy/70",
        className
      )}
    >
      {children}
    </span>
  );
}
