import Link from "next/link";
import {
  Receipt,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  MailQuestion,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries/admin-dashboard";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic"; // always show fresh operational numbers

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PAYMENT_PENDING: "Payment Pending",
  PARTIALLY_PAID: "Partially Paid",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  COMPLETED: "Completed",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Bookings", value: stats.totalBookings, icon: Receipt },
    { label: "Today's Bookings", value: stats.todayBookings, icon: CalendarClock },
    { label: "Upcoming Departures", value: stats.upcomingDepartures, icon: CalendarDays },
    { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: Receipt },
    { label: "Pending Payments", value: stats.pendingPayments, icon: Clock },
    { label: "Confirmed Bookings", value: stats.confirmedBookings, icon: CheckCircle2 },
    { label: "Cancelled Bookings", value: stats.cancelledBookings, icon: XCircle },
    { label: "Available Seats", value: stats.availableSeats, icon: Users },
    { label: "New Enquiries", value: stats.newEnquiries, icon: MailQuestion },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy/50">{c.label}</span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-navy">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-navy/10 bg-white">
        <div className="flex items-center justify-between border-b border-navy/10 px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-navy">Recent Bookings</h2>
          <Link href="/admin/departures" className="text-sm font-medium text-gold hover:underline">
            View departures →
          </Link>
        </div>

        {stats.recentBookings.length === 0 ? (
          <p className="p-6 text-sm text-navy/50">No bookings yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-navy/40">
              <tr>
                <th className="px-6 py-3 font-medium">Ref</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Trip</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {stats.recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-3 font-medium text-navy">{b.bookingRef}</td>
                  <td className="px-6 py-3 text-navy/70">{b.customerName}</td>
                  <td className="px-6 py-3 text-navy/70">{b.packageTitle}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-navy/5 px-2.5 py-1 text-xs text-navy/70">
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-navy/70">{formatINR(b.finalTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
