import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function PaymentPendingEmail({ booking }: { booking: BookingEmailContext }) {
  return (
    <EmailLayout preview={`Action needed: complete payment for ${booking.bookingRef}`}>
      <Text style={emailStyles.heading}>Payment Still Pending</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        Your seat for <strong>{booking.packageTitle}</strong> ({formatDate(booking.departureDate)})
        is being held, but we haven't yet received your advance payment.
      </Text>

      <Text style={emailStyles.label}>Amount Due</Text>
      <Text style={emailStyles.value}>{formatINR(Math.max(booking.advanceAmount - booking.amountPaid, 0))}</Text>

      <Text style={emailStyles.text}>
        Please complete payment soon to avoid losing your reserved seat to another traveller.
      </Text>
    </EmailLayout>
  );
}
