"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-navy">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0 text-lg font-bold uppercase tracking-wide text-ivory sm:text-xl">
          Himaroh<span className="text-gold">.com</span>
        </Link>

        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="hidden items-center gap-2 text-sm font-medium text-ivory/90 hover:text-gold md:flex"
        >
          <Phone className="h-4 w-4" />
          {phone}
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "text-xs font-semibold uppercase tracking-wide text-ivory/85 transition-colors hover:text-gold",
                pathname === link.href && "text-gold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-ivory lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ivory/10 bg-navy px-6 pb-6 pt-2 lg:hidden">
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 py-3 text-sm font-medium text-ivory/90">
            <Phone className="h-4 w-4" /> {phone}
          </a>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 text-sm font-semibold uppercase tracking-wide text-ivory/90 hover:bg-ivory/5 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
