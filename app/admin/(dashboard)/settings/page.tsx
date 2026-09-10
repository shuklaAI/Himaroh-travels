import { getSiteSettings } from "@/lib/queries/settings";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Editable business information — no code changes required." />
      <SettingsForm
        initial={{
          company_name: settings.companyName,
          phone: settings.phone,
          email: settings.email,
          instagram: settings.instagram,
          whatsapp_number: settings.whatsappNumber,
          business_hours: settings.businessHours,
          cancellation_policy_summary: settings.cancellationPolicySummary,
        }}
      />
    </div>
  );
}
