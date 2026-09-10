import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import { type BookingEmailContext, formatINR, formatDate } from "./types";

export default function BookingReceivedEmail({ booking }: { booking: BookingEmailContext }) {
  return (
    <EmailLayout preview={`We've received your booking request — ${booking.bookingRef}`}>
      <Text style={emailStyles.heading}>Booking Received</Text>
      <Text style={emailStyles.text}>Hi {booking.customerName},</Text>
      <Text style={emailStyles.text}>
        Thank you for choosing Himaroh Travels. We've received your request for{" "}
        <strong>{booking.packageTitle}</strong> and your seat is temporarily held while payment is
        completed.
      </Text>

      <Text style={emailStyles.label}>Booking Reference</Text>
      <Text style={emailStyles.value}>{booking.bookingRef}</Text>

      <Text style={emailStyles.label}>Departure</Text>
      <Text style={emailStyles.value}>{formatDate(booking.departureDate)}</Text>

      <Text style={emailStyles.label}>Travellers</Text>
      <Text style={emailStyles.value}>{booking.travellerCount}</Text>

      <Text style={emailStyles.label}>Advance Due to Confirm Your Seat</Text>
      <Text style={emailStyles.value}>{formatINR(booking.advanceAmount)}</Text>

      <Text style={emailStyles.text}>
        Complete your advance payment to confirm your booking. This amount is non-refundable.
      </Text>
    </EmailLayout>
  );
}
