# Himaroh Travels — Testing Checklist

Covers Section 59: the 12 scenarios the build was required to mentally (and, where practical,
actually) test before being called complete. For each one: what the code does, where to look, and
how to verify it yourself.

## Automated tests

```bash
npm run test                  # pricing math (lib/booking/pricing.ts) + Razorpay signature verification
npm run verify:concurrency    # real-database proof of the no-overbooking guarantee (see Scenario 2)
```

---

### Scenario 1 — User books 2 seats
**Covered by:** the full booking flow (Phase 4), `lib/booking/pricing.ts` (base price × 2), and
`app/(public)/booking/[departureId]/actions.ts`.
**Verify manually:** go to any trip's departure table → Book Now → set travellers to 2 → complete
the form → confirm the price summary shows `unitPrice × 2`, and that `bookedSeats` on the
departure increments by exactly 2 after submission (check `/admin/departures/[id]`).

### Scenario 2 — Only 1 seat remains, two users try booking simultaneously
**Covered by:** `SELECT ... FOR UPDATE` row locking in the booking transaction (Section 31).
**Verify with proof, not just reasoning:** `npm run verify:concurrency` — creates a real 1-seat
test departure, fires two concurrent reservation attempts, and asserts exactly one succeeds while
the other is cleanly rejected. This is the one scenario in this list that genuinely can't be
verified by reasoning alone (race conditions don't show up by inspection), so it gets a real script
against a real Postgres instance rather than a unit test with mocked timing.

### Scenario 3 — Departure is sold out
**Covered by:** `getPackageBySlug`/`getDepartureForBooking` mark `isSoldOut` from
`totalCapacity - bookedSeats`; the trip page renders a disabled "Sold Out" button
(`components/trip/upcoming-departures.tsx`), and `/booking/[departureId]` itself refuses to render
the booking form for a non-bookable departure (`app/(public)/booking/[departureId]/page.tsx`).
**Verify manually:** in `/admin/departures`, set a departure's capacity equal to its booked seats
(or create one with 0 capacity), then visit its trip page and its direct `/booking/[id]` URL —
both should show "Sold Out" rather than a working form.

### Scenario 4 — User applies an invalid coupon
**Covered by:** `lib/booking/coupon.ts` (`validateCoupon`) — checks active flag, date window,
usage limits, per-customer limit, minimum amount, and throws a specific `BookingError` code for
each failure mode (`INVALID_COUPON`, `COUPON_EXPIRED`, `COUPON_LIMIT_REACHED`,
`COUPON_MIN_AMOUNT_NOT_MET`).
**Verify manually:** enter a nonsense code, an expired coupon (create one in `/admin/coupons` with
a past expiry date), and a coupon below its minimum booking amount — each should produce a
specific, honest error on the review step rather than silently ignoring the code or crashing.

### Scenario 5 — Payment succeeds
**Covered by:** `app/(public)/payment/actions.ts` (`verifyPaymentAction`) — in mock mode, the
`RazorpayCheckoutButton` simulates a full round-trip and the booking moves to `CONFIRMED` (if fully
paid) or `PARTIALLY_PAID`. In live mode, the same code path runs after real HMAC signature
verification.
**Verify manually:** complete a booking, click Pay Now on the thank-you page, confirm the status
badge updates and a Payment Successful (+ Booking Confirmed, if applicable) email is logged/sent.

### Scenario 6 — Payment fails
**Covered by:** `verifyRazorpaySignature` rejects a bad/tampered signature and the payment is
marked `FAILED`, not `CAPTURED` (`lib/payments/razorpay.ts`, tested in
`lib/payments/__tests__/razorpay.test.ts`). In real mode, Razorpay's own `payment.failed` checkout
event is also handled (`razorpay-checkout-button.tsx`'s `rzp.on("payment.failed", ...)`).
**Verify manually (real mode only):** use one of Razorpay's documented test failure cards, confirm
the booking stays `PAYMENT_PENDING` and the customer sees a clear error rather than a false success.

### Scenario 7 — User refreshes the payment page
**Covered by:** dual confirmation paths — the checkout callback (`verifyPaymentAction`) and the
webhook (`app/api/webhooks/razorpay/route.ts`) both write through the same idempotent logic
(check `payment.status === "CAPTURED"` first, no-op if already processed). Whichever arrives first
wins; the second is a safe no-op, not a double-credit.
**Verify manually (real mode):** start a payment, close the browser tab immediately after paying
but before the page would normally update, then reopen `/thank-you/[bookingId]` — the webhook
should have already confirmed it independently.

### Scenario 8 — Admin changes price
**Covered by:** `app/admin/(dashboard)/departures/actions.ts` (`updateDepartureAction` upserts
`Pricing` rows) + `revalidatePath` on the affected trip page.
**Verify manually:** change a departure's Double Sharing price in `/admin/departures/[id]`, then
immediately reload the public trip page — the new price should appear without a deploy or cache
clear, and a fresh booking should charge the new amount server-side (never the old cached one,
since the server always re-reads `Pricing` at booking time — see Phase 4's `actions.ts`).

### Scenario 9 — Admin creates a new departure
**Covered by:** `createDepartureAction` — creates the `Departure` + nested `Pricing` rows in one
transaction, then `revalidatePath("/trips/[slug]")`.
**Verify manually:** add a departure in `/admin/departures/new`, confirm it appears in the trip
page's Upcoming Departures table immediately, with correct pricing and full seat availability.

### Scenario 10 — Admin cancels a booking
**Covered by:** `updateBookingStatusAction` — setting status to `CANCELLED` runs inside a
transaction that also decrements `bookedSeats` on the departure and reopens it if it had been
`SOLD_OUT`, and fires the Booking Cancelled email.
**Verify manually:** cancel a confirmed booking in `/admin/bookings/[id]`, confirm the departure's
available seat count in `/admin/departures` increases by that booking's traveller count.

### Scenario 11 — Customer books without creating an account
**Covered by:** the booking transaction does `customer.upsert({ where: { phone }, ... })` — no
password, no login, no account creation step anywhere in the flow (Section 49's guest-booking
requirement). Optional customer login/dashboard was explicitly scoped as "architect for it, don't
require it" and wasn't built as a public-facing feature in any of the 9 phases — the `Customer`
model and `passwordHash` field exist and are ready for it, but there's no `/account` UI yet.
**Verify manually:** complete a full booking start-to-finish without ever being asked to sign up or
log in.

### Scenario 12 — Mobile user completes booking
**Covered by:** mobile-first responsive design throughout (320px–430px breakpoints tested via
Tailwind's default scale), sticky bottom price summary + "Book Your Seat" bar
(`components/booking/booking-flow.tsx`, `components/trip/sticky-book-bar.tsx`), hamburger nav,
and the Razorpay checkout itself is mobile-responsive by default (it's Razorpay's own UI).
**Verify manually:** run through the entire booking flow in Chrome DevTools' mobile emulation (or a
real phone) at 375px width — every step, the price summary, and the payment button should remain
usable without horizontal scrolling or overlapping elements.

---

## What isn't covered by this checklist

Section 59's scenarios are all about the booking/payment engine, which is why this document is
scoped there. It does **not** cover:
- The standalone content pages gap flagged after Phase 7 (`/about`, `/faq`, `/gallery`, `/terms`,
  `/privacy`, `/cancellation-policy`, `/contact`) — there's nothing to test there yet because
  nothing was built.
- Load testing beyond the 2-concurrent-request proof in Scenario 2 — genuine load testing (100s of
  concurrent bookings) would need a tool like k6 or Artillery against a staging environment, which
  is a deployment-environment activity rather than something this codebase can self-verify.
- Cross-browser testing (Safari/Firefox quirks) — the stack (Tailwind, standard CSS, no
  browser-specific APIs) shouldn't have major issues, but wasn't explicitly verified across engines.
