import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { PackageForm } from "@/components/admin/package-form";

export const metadata = { title: "New Package" };

export default async function NewPackagePage() {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "CONTENT_MANAGER"])) return <AccessDenied />;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New Package</h1>
      <PackageForm mode="create" />
    </div>
  );
}
