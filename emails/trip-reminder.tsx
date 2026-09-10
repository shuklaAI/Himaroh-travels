import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function TripReminderEmail({ booking }: { booking: BookingEmailContext }) {
  const balanceDue = Math.max(booking.finalTotal - booking.amountPaid, 0);
  return (
    <EmailLayout preview={`Your trip is coming up — ${booking.packageTitle}`}>
      <Text style={emailStyles.heading}>Your Trip is Coming Up</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        Just a reminder that your departure for <strong>{booking.packageTitle}</strong> is on{" "}
        {formatDate(booking.departureDate)}.
      </Text>

      <Text style={emailStyles.label}>Pickup Point</Text>
      <Text style={emailStyles.value}>{booking.pickupPoint ?? "To be confirmed"}</Text>

      {balanceDue > 0 && (
        <>
          <Text style={emailStyles.label}>Balance Due</Text>
          <Text style={emailStyles.value}>{formatINR(balanceDue)}</Text>
        </>
      )}

      <Text style={emailStyles.text}>
        Please carry a valid government-issued photo ID and any personal trekking gear mentioned
        in your inclusions/exclusions. We'll see you soon!
      </Text>
    </EmailLayout>
  );
}
