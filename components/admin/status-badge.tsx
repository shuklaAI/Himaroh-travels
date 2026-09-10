import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-navy/5 text-navy/60",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  PARTIALLY_PAID: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-navy/10 text-navy/70",
  NEW: "bg-amber-50 text-amber-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  RESOLVED: "bg-green-50 text-green-700",
  OPEN: "bg-green-50 text-green-700",
  CLOSED: "bg-navy/5 text-navy/60",
  SOLD_OUT: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-navy/5 text-navy/60"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
