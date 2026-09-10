"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Mountain } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@prisma/client";

export function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-navy/10 bg-white">
      <div className="flex items-center gap-2 border-b border-navy/10 px-6 py-5">
        <Mountain className="h-5 w-5 text-gold" strokeWidth={1.5} />
        <span className="font-display text-base font-semibold text-navy">Himaroh Admin</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-navy text-ivory" : "text-navy/60 hover:bg-navy/5 hover:text-navy"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy/10 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy/60 hover:bg-navy/5 hover:text-navy"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
