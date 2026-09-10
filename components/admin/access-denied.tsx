import { ShieldAlert } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center">
      <ShieldAlert className="mb-4 h-10 w-10 text-navy/30" strokeWidth={1.5} />
      <h2 className="text-lg font-semibold text-navy">Access Restricted</h2>
      <p className="mt-2 max-w-sm text-sm text-navy/60">
        Your admin role doesn't have permission to view this section.
      </p>
    </div>
  );
}
