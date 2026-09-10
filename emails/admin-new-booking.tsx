import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function AdminNewBookingEmail({
  booking,
  customerPhone,
}: {
  booking: BookingEmailContext;
  customerPhone: string;
}) {
  return (
    <EmailLayout preview={`New booking: ${booking.bookingRef}`}>
      <Text style={emailStyles.heading}>New Booking Notification</Text>
      <Text style={emailStyles.text}>
        A new booking has been created and is visible in the admin dashboard.
      </Text>

      <Text style={emailStyles.label}>Booking Reference</Text>
      <Text style={emailStyles.value}>{booking.bookingRef}</Text>

      <Text style={emailStyles.label}>Customer</Text>
      <Text style={emailStyles.value}>
        {booking.customerName} · {customerPhone}
      </Text>

      <Text style={emailStyles.label}>Trip</Text>
      <Text style={emailStyles.value}>
        {booking.packageTitle} — {formatDate(booking.departureDate)}
      </Text>

      <Text style={emailStyles.label}>Travellers</Text>
      <Text style={emailStyles.value}>{booking.travellerCount}</Text>

      <Text style={emailStyles.label}>Amount Paid / Total</Text>
      <Text style={emailStyles.value}>
        {formatINR(booking.amountPaid)} / {formatINR(booking.finalTotal)}
      </Text>
    </EmailLayout>
  );
}
