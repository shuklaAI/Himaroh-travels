import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-6 py-4 sm:px-8 lg:px-10">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-navy/50">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="hover:text-gold">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-navy/70">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
