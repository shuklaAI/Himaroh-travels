export type BookingErrorCode =
  | "DEPARTURE_NOT_FOUND"
  | "DEPARTURE_CLOSED"
  | "SOLD_OUT"
  | "PRICING_NOT_FOUND"
  | "INVALID_COUPON"
  | "COUPON_EXPIRED"
  | "COUPON_LIMIT_REACHED"
  | "COUPON_MIN_AMOUNT_NOT_MET"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "UNKNOWN";

export class BookingError extends Error {
  code: BookingErrorCode;
  constructor(code: BookingErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "BookingError";
  }
}

// Safe, customer-facing copy — never expose raw Prisma/Postgres error text.
export const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  DEPARTURE_NOT_FOUND: "This departure could not be found. Please choose another date.",
  DEPARTURE_CLOSED: "Bookings are currently closed for this departure.",
  SOLD_OUT:
    "Sorry, this departure just sold out while you were booking. Please choose another date.",
  PRICING_NOT_FOUND: "Pricing is not available for the selected sharing type.",
  INVALID_COUPON: "This coupon code is not valid.",
  COUPON_EXPIRED: "This coupon has expired.",
  COUPON_LIMIT_REACHED: "This coupon has reached its usage limit.",
  COUPON_MIN_AMOUNT_NOT_MET: "Your booking total doesn't meet this coupon's minimum amount.",
  VALIDATION_ERROR: "Please check the details you entered and try again.",
  RATE_LIMITED: "Too many booking attempts from this connection. Please wait a few minutes and try again.",
  UNKNOWN: "Something went wrong while creating your booking. Please try again.",
};
