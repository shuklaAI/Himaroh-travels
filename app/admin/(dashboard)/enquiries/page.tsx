import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EnquiryStatusSelect } from "@/components/admin/enquiry-status-select";
import { formatDate } from "@/lib/utils";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <AdminPageHeader title="Enquiries" description={`${enquiries.length} enquirie(s)`} />

      {enquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center text-navy/50">
          No enquiries yet. Once the public contact form is live, submissions will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-navy/10 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-navy">
                    {e.name} · {e.phone}
                  </p>
                  {e.email && <p className="text-xs text-navy/40">{e.email}</p>}
                  {e.packageInterest && <p className="mt-1 text-xs text-gold">Interested in: {e.packageInterest}</p>}
                  <p className="mt-2 text-sm text-navy/70">{e.message}</p>
                  <p className="mt-2 text-xs text-navy/40">{formatDate(e.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={e.status} />
                  <EnquiryStatusSelect id={e.id} status={e.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
