import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR } from "./types";

export default function RefundInitiatedEmail({
  booking,
  refundAmount,
}: {
  booking: BookingEmailContext;
  refundAmount: number;
}) {
  return (
    <EmailLayout preview={`Refund initiated for ${booking.bookingRef}`}>
      <Text style={emailStyles.heading}>Refund Initiated</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        A refund has been initiated for your booking <strong>{booking.bookingRef}</strong>.
      </Text>
      <Text style={emailStyles.label}>Refund Amount</Text>
      <Text style={emailStyles.value}>{formatINR(refundAmount)}</Text>
      <Text style={emailStyles.text}>
        Refunds are typically credited to your original payment method within 5–7 business days,
        depending on your bank.
      </Text>
    </EmailLayout>
  );
}
