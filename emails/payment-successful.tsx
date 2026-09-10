import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function PaymentSuccessfulEmail({
  booking,
  amountPaidNow,
}: {
  booking: BookingEmailContext;
  amountPaidNow: number;
}) {
  return (
    <EmailLayout preview={`Payment received for ${booking.bookingRef}`}>
      <Text style={emailStyles.heading}>Payment Successful</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        We've received your payment of <strong>{formatINR(amountPaidNow)}</strong> for booking{" "}
        <strong>{booking.bookingRef}</strong> ({booking.packageTitle}, departing{" "}
        {formatDate(booking.departureDate)}).
      </Text>

      <Text style={emailStyles.label}>Total Paid So Far</Text>
      <Text style={emailStyles.value}>{formatINR(booking.amountPaid)}</Text>

      <Text style={emailStyles.label}>Balance Remaining</Text>
      <Text style={emailStyles.value}>{formatINR(Math.max(booking.finalTotal - booking.amountPaid, 0))}</Text>
    </EmailLayout>
  );
}
