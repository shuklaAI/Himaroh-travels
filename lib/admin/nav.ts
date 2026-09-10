import type { AdminRole } from "@prisma/client";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  ClipboardList,
  Users,
  BedDouble,
  FileText,
  Images,
  Quote,
  Ticket,
  MessageSquareText,
  Settings,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: AdminRole[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN", "CONTENT_MANAGER"],
  },
  { label: "Packages", href: "/admin/packages", icon: Package, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Departures", href: "/admin/departures", icon: CalendarDays, roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"] },
  { label: "Bookings", href: "/admin/bookings", icon: ClipboardList, roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"] },
  { label: "Customers", href: "/admin/customers", icon: Users, roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"] },
  {
    label: "Accommodations",
    href: "/admin/accommodations",
    icon: BedDouble,
    roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"],
  },
  { label: "Content", href: "/admin/content", icon: FileText, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Gallery", href: "/admin/gallery", icon: Images, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, roles: ["SUPER_ADMIN"] },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquareText,
    roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"],
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];
