import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatDate } from "./types";

export default function BookingCancelledEmail({
  booking,
  reason,
}: {
  booking: BookingEmailContext;
  reason?: string;
}) {
  return (
    <EmailLayout preview={`Your booking ${booking.bookingRef} has been cancelled`}>
      <Text style={emailStyles.heading}>Booking Cancelled</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        Your booking <strong>{booking.bookingRef}</strong> for <strong>{booking.packageTitle}</strong>{" "}
        ({formatDate(booking.departureDate)}) has been cancelled.
      </Text>
      {reason && (
        <>
          <Text style={emailStyles.label}>Reason</Text>
          <Text style={emailStyles.value}>{reason}</Text>
        </>
      )}
      <Text style={emailStyles.text}>
        Please refer to our Cancellation Policy for details on any applicable refund. If you have
        questions, reply to this email or reach us on WhatsApp.
      </Text>
    </EmailLayout>
  );
}
