export type BookingEmailContext = {
  bookingRef: string;
  customerName: string;
  packageTitle: string;
  departureDate: Date;
  travellerCount: number;
  pickupPoint: string | null;
  finalTotal: number;
  advanceAmount: number;
  balanceAmount: number;
  amountPaid: number;
};

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
