import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy/60">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Button asChild size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
