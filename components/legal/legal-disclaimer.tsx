import { AlertTriangle } from "lucide-react";

export function LegalDisclaimer() {
  return (
    <div className="mb-10 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        This page is a starting template based on common travel-industry practice and should be
        reviewed by a qualified legal advisor before being relied on for a live business. It is
        not legal advice.
      </p>
    </div>
  );
}
