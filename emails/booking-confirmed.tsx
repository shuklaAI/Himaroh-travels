import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function BookingConfirmedEmail({ booking }: { booking: BookingEmailContext }) {
  return (
    <EmailLayout preview={`Your seat is confirmed — ${booking.bookingRef}`}>
      <Text style={emailStyles.badge}>Confirmed</Text>
      <Text style={{ ...emailStyles.heading, marginTop: 12 }}>Your Booking is Confirmed</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        Your seat for <strong>{booking.packageTitle}</strong> departing{" "}
        {formatDate(booking.departureDate)} is now confirmed. We're looking forward to having you
        on this journey.
      </Text>

      <Text style={emailStyles.label}>Booking Reference</Text>
      <Text style={emailStyles.value}>{booking.bookingRef}</Text>

      <Text style={emailStyles.label}>Pickup Point</Text>
      <Text style={emailStyles.value}>{booking.pickupPoint ?? "To be confirmed"}</Text>

      <Text style={emailStyles.label}>Balance Due Before Departure</Text>
      <Text style={emailStyles.value}>{formatINR(booking.balanceAmount)}</Text>

      <Text style={emailStyles.text}>
        We'll follow up closer to your departure date with packing tips and final logistics.
      </Text>
    </EmailLayout>
  );
}
