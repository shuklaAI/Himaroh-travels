import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const metadata = { robots: { index: false } };

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

  // Belt-and-suspenders: middleware already protects this route, but a server
  // component should never assume a request reached it legitimately.
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex bg-ivory">
      <AdminSidebar role={admin.role} />
      <div className="flex-1">
        <AdminTopbar name={admin.name} role={admin.role} />
        <main id="main-content" className="p-8">{children}</main>
      </div>
    </div>
  );
}
