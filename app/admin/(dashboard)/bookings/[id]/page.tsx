import { notFound } from "next/navigation";
import { getAdminBookingById } from "@/lib/queries/admin-bookings";
import { StatusBadge } from "@/components/admin/status-badge";
import { BookingManagementPanel } from "@/components/admin/booking-management-panel";
import { formatDate, formatINR } from "@/lib/utils";

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getAdminBookingById(params.id);
  if (!booking) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-navy/40">Booking</p>
          <h1 className="font-display text-2xl font-semibold text-navy">{booking.bookingRef}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Trip & Customer</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="Trip" value={booking.departure.package.title} />
              <Row label="Departure" value={formatDate(booking.departure.departureDate)} />
              <Row label="Customer" value={booking.customer.fullName} />
              <Row label="Phone" value={booking.customer.phone} />
              <Row label="Email" value={booking.customer.email ?? "—"} />
              <Row label="Pickup Point" value={booking.pickupPoint ?? "—"} />
              <Row label="Travellers" value={String(booking.travellerCount)} />
              <Row label="Accommodation" value={booking.accommodation?.name ?? "No preference"} />
              <Row label="Coupon" value={booking.coupon?.code ?? "—"} />
            </dl>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Pricing</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="Base Price" value={formatINR(booking.basePriceTotal)} />
              <Row label="Discount" value={formatINR(booking.discountAmount)} />
              <Row label="Add-ons" value={formatINR(booking.addOnsTotal)} />
              <Row label="Total" value={formatINR(booking.finalTotal)} bold />
              <Row label="Advance" value={formatINR(booking.advanceAmount)} />
              <Row label="Balance" value={formatINR(booking.balanceAmount)} />
              <Row label="Amount Paid" value={formatINR(booking.amountPaid)} bold />
            </dl>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="mb-3 font-display text-base font-semibold text-navy">
              Travellers ({booking.travellers.length})
            </h3>
            <div className="space-y-3">
              {booking.travellers.map((t) => (
                <div key={t.id} className="rounded-lg border border-navy/10 p-4 text-sm">
                  <p className="font-medium text-navy">{t.fullName}</p>
                  <p className="text-navy/50">
                    {t.phone ?? "—"} · {t.email ?? "—"} · {t.govtIdType ?? "No ID on file"} {t.govtIdNumber ?? ""}
                  </p>
                  {t.medicalNotes && <p className="mt-1 text-xs text-navy/50">Medical: {t.medicalNotes}</p>}
                  {t.specialRequirements && (
                    <p className="mt-1 text-xs text-navy/50">Requirements: {t.specialRequirements}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Payment History</h3>
            {booking.payments.length === 0 ? (
              <p className="text-sm text-navy/50">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-navy/5 py-2 text-sm last:border-0">
                    <div>
                      <span className="font-medium text-navy">{formatINR(p.amount)}</span>{" "}
                      <span className="text-navy/40">via {p.method.replace(/_/g, " ")}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Internal Notes</h3>
            {booking.internalNotes.length === 0 ? (
              <p className="text-sm text-navy/50">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {booking.internalNotes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-ivory p-3 text-sm">
                    <p className="text-navy/80">{n.note}</p>
                    <p className="mt-1 text-xs text-navy/40">
                      {n.adminUser?.name ?? "System"} · {formatDate(n.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <BookingManagementPanel bookingId={booking.id} currentStatus={booking.status} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <>
      <dt className="text-navy/50">{label}</dt>
      <dd className={bold ? "font-semibold text-navy" : "text-navy/80"}>{value}</dd>
    </>
  );
}
