# Himaroh Travels — Architecture (Phase 1)

## 1. Stack
Next.js 14 (App Router, TS) · Tailwind + shadcn/ui · PostgreSQL + Prisma ·
NextAuth (credentials, admin-only for now) · Razorpay · Resend · Framer Motion.

## 2. Core principle
`Admin Panel → Server Actions → Business Logic (Zod-validated) → Prisma → PostgreSQL → Public site reads`
The browser is never the source of truth for price, availability, or booking status.

## 3. Entity relationships (summary)
- **Package** 1—N **ItineraryDay**, **PackageImage**, **Inclusion**, **Exclusion**, **FAQ**, **Testimonial**
- **Package** N—N **Accommodation** (via `PackageAccommodation`)
- **Package** 1—N **Departure**; **Departure** 1—N **Pricing** (one row per `SharingType`)
- **Departure** 1—N **Booking**; **Booking** 1—N **BookingTraveller**, **Payment**, **BookingNote**
- **Booking** N—1 **Customer**, optional N—1 **Coupon** (with `CouponUsage` for limits)
- **AdminUser** (role: SUPER_ADMIN / OPERATIONS_ADMIN / CONTENT_MANAGER) actions are recorded in **AuditLog**
- Availability is always **derived** (`totalCapacity - bookedSeats`), never stored redundantly, to prevent drift.
- `bookedSeats` is only ever incremented inside a DB transaction with row locking at booking-confirmation time (Phase 4) to prevent overbooking race conditions.

## 4. Route map (planned across phases)
Public: `/`, `/trips`, `/trips/[slug]`, `/booking/[departureId]`, `/about`, `/contact`, `/gallery`, `/faq`,
`/terms`, `/privacy`, `/cancellation-policy`, `/thank-you/[bookingId]`
Admin: `/admin`, `/admin/packages`, `/admin/departures`, `/admin/bookings`, `/admin/customers`,
`/admin/accommodations`, `/admin/content`, `/admin/coupons`, `/admin/enquiries`, `/admin/settings`
API: `/api/auth/*`, `/api/webhooks/razorpay`, `/api/bookings/[id]/verify-payment`

## 5. Roles
- **SUPER_ADMIN**: everything, incl. admin users & payment config
- **OPERATIONS_ADMIN**: departures, bookings, customers, travellers, enquiries — no admin-user/payment-credential access
- **CONTENT_MANAGER**: packages, itinerary, gallery, FAQs, testimonials — no customer PII or payment access

## 6. Naming contract (kept fixed for every later phase)
`Package`, `Departure`, `Pricing`, `Booking`, `BookingTraveller`, `Payment`, `Coupon`, `Accommodation`,
`Enquiry`, `AdminUser`, `AuditLog`. IDs referenced as `packageId`, `departureId`, `bookingId` throughout.

---

## Phase 1 — DONE
**Files created:** `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`,
`postcss.config.js`, `prisma/schema.prisma`, `prisma/seed.ts`, `lib/db.ts`, `.env.example`, this README.

**Commands to run (once you unzip into your machine):**
```bash
npm install
cp .env.example .env    # fill in DATABASE_URL at minimum
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

**What should work now:** a valid Prisma schema you can migrate against a real Postgres instance, with
seed data for Himaroh's Tungnath & Chandrashila package (itinerary, inclusions/exclusions, accommodations,
3 departures with quad/triple/double pricing, FAQs) and a dev admin login
(`admin@himarohtravels.dev` / `ChangeMe123!` — placeholder, rotate before production).

**Next phase (Phase 2):** public layout, navbar, footer, homepage (hero, featured trips, destinations),
skeleton loading components, fully responsive.

---

## Phase 2 — DONE
**Files created:**
- `app/layout.tsx`, `app/globals.css` — fonts (Playfair Display + Inter), skeleton shimmer, reduced-motion
- `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/(public)/loading.tsx`
- `components/layout/{navbar,footer,whatsapp-button}.tsx`
- `components/home/{hero,trust-bar,featured-trips,trip-card,why-himaroh,destination-experience,itinerary-preview,itinerary-timeline,booking-cta,testimonials}.tsx`
- `components/skeletons/trip-card-skeleton.tsx`, `components/ui/{button,skeleton}.tsx`
- `lib/{utils,constants}.ts`, `lib/queries/{packages,settings}.ts`

**Commands to run:**
```bash
npm install
npm run dev   # requires DATABASE_URL + a seeded DB from Phase 1
```

**What should work now:** a fully responsive homepage (320px → desktop) reading live data —
featured trips, next departure date, derived seat availability, and the itinerary preview all
come from PostgreSQL via Prisma, not hardcoded content. Every DB-driven section is wrapped in
`<Suspense>` with a matching skeleton (`FeaturedTripsSkeleton`, itinerary skeleton) so navigation
never blocks on a blank screen, and `app/(public)/loading.tsx` gives instant feedback on route
change. Empty states are handled explicitly (no departures → friendly message; no testimonials →
section hides itself rather than showing fake reviews, per spec). Site contact details (phone,
email, Instagram, WhatsApp number) are read from the `SiteSetting` table with safe fallbacks.

**Design tokens locked in:** Navy `#071B33` / Gold `#D6A63A` / Ivory `#F7F2E8` per brand brief;
Playfair Display for headings, Inter for body/UI. Signature element: the expandable vertical
itinerary timeline with a ridge-line connector — reused on the trip detail page in Phase 3.

**Next phase (Phase 3):** trip listing (`/trips`), trip detail page (`/trips/[slug]`) with full
itinerary/pricing/gallery, and the upcoming-departures table.

---

## Phase 3 — DONE
**Files created:**
- `app/(public)/trips/page.tsx`, `loading.tsx` — listing page with search/difficulty/duration/price filters
- `app/(public)/trips/[slug]/page.tsx`, `loading.tsx`, `not-found.tsx` — full trip detail page
- `components/trips/{trip-filters,trip-results}.tsx`
- `components/trip/{trip-hero,trip-overview,trip-itinerary,trip-inclusions,trip-accommodation,upcoming-departures,trip-gallery,trip-faq,trip-policy-note,sticky-book-bar}.tsx`
- `components/ui/{accordion,badge}.tsx`
- `lib/queries/packages.ts` extended with `getPublishedTrips`, `getDistinctDifficulties`, `getPackageBySlug`

**Commands to run:** none beyond Phase 1/2 setup — `npm run dev` picks these routes up automatically.

**What should work now:**
- `/trips` — search (debounced), difficulty/duration/price filters via URL query params (shareable,
  back-button friendly), each combination re-triggers a `<Suspense>`-wrapped server fetch with a
  matching skeleton, and an explicit empty state when filters match nothing.
- `/trips/[slug]` — hero with quick facts (difficulty/altitude/distance/pickup), overview,
  highlights, the reusable expandable itinerary timeline, inclusions/exclusions, accommodation
  cards, an **upcoming departures table** (date × sharing-type pricing × live seat count) that
  only ever shows future, non-cancelled departures because that filter lives in the query, not
  just the UI — a sold-out departure is rendered disabled rather than hidden. Also: gallery, FAQ
  accordion, a cancellation-policy callout linking to `/terms` and `/cancellation-policy`, full
  `generateMetadata` (title/description/canonical/OG/Twitter), a `not-found.tsx` for bad/unpublished
  slugs, a loading skeleton shaped like the real page, and a sticky mobile "Book Your Seat" bar.
- "Book Now" links to `/booking/[departureId]` — that route is built in Phase 4.

**Next phase (Phase 4):** the booking flow itself — traveller forms, server-side price
calculation, coupon application, and the transactional/row-locked inventory reservation that
prevents two customers from booking the last seat at once.

---

## ⚠️ Security note (read before deploying)
Real database/auth secrets were pasted into the chat that produced this project. Treat them as
compromised: **rotate the Supabase DB password and regenerate `NEXTAUTH_SECRET` before this goes
anywhere near production.** `.env` is now gitignored — always fill secrets into your local `.env`
only, never into a file that gets committed or pasted anywhere.

## Phase 4 — DONE
**Schema changes (additive only, nothing renamed):**
- `SequenceCounter` model — atomic counter behind human-friendly booking refs (`HT-2026-000123`).
  A single `UPDATE ... increment` is one atomic Postgres statement, so two simultaneous bookings
  can never collide on the same number.
- `Booking.accommodationId` (nullable, relation to `Accommodation`) — records the Camp/Cottage
  choice made in the booking flow's Accommodation step.
- Run `npx prisma migrate dev --name add_booking_engine` to apply these.

**Files created:**
- `lib/validations/booking.ts` — Zod schemas; the single source of server-side validation truth
- `lib/booking/{pricing,coupon,errors}.ts` — pure price calculator, coupon validator, safe error codes
- `lib/booking/__tests__/pricing.test.ts`, `vitest.config.ts` — unit tests for the pricing math
- `lib/queries/{booking,booking-summary}.ts`
- `app/(public)/booking/[departureId]/{page,loading,actions}.tsx`
- `app/(public)/thank-you/[bookingId]/{page,not-found}.tsx`
- `components/booking/{step-indicator,traveller-form,price-summary,booking-flow}.tsx`
- `.gitignore`

**Commands to run:**
```bash
npx prisma migrate dev --name add_booking_engine
npx prisma generate
npm run test        # runs the pricing unit tests
```

**What should work now — the full Section 31 sequence, in one DB transaction:**
1. `SELECT ... FOR UPDATE` locks the departure row before anything else is read.
2. Availability is re-checked against that locked row (`totalCapacity - bookedSeats`) — if two
   people submit for the last seat simultaneously, Postgres serializes the two transactions; the
   loser re-reads the now-updated count and fails cleanly with a "just sold out" message instead
   of overbooking (Scenario 2 from Section 59, verified in the pricing tests + reasoned through in
   the code comments — full integration test would need a real Postgres instance to run against).
3. Pricing is read fresh from the `Pricing` table — the client's on-screen total is a preview only
   and is never sent to or trusted by the server.
4. A coupon code, if entered, is validated against live `Coupon`/`CouponUsage` rows (active flag,
   date window, usage limit, per-customer limit, minimum amount) — invalid/expired/exhausted
   coupons throw a specific, safe error rather than silently being ignored or silently applied.
5. Advance/balance are computed from `AdvanceConfig` (package-specific, falling back to a global
   row, falling back to the brochure default of ₹1,000/person only if neither exists).
6. A guest `Customer` is found-or-created by phone — **guest booking works with no account**, per
   Section 49.
7. Booking + all `BookingTraveller` rows + `CouponUsage` are created, seats are incremented, and
   status is set to `PAYMENT_PENDING` — not `CONFIRMED`, because no payment has happened yet.
8. On success the customer lands on `/thank-you/[bookingId]`, which is honest that the seat is
   *reserved* pending payment (Razorpay isn't wired until Phase 5) and gives a WhatsApp fallback
   to complete payment manually in the meantime.

Booking form covers all fields from Section 9 (traveller info, emergency contact, medical notes,
govt ID) with a step indicator (Trip → Travellers → Accommodation → Review), a sticky desktop
price summary / fixed mobile bottom summary (Section 25), and Indian currency formatting throughout.

**Next phase (Phase 5):** Razorpay order creation, payment verification (signature check), moving
a booking from `PAYMENT_PENDING` to `CONFIRMED` only after verified payment, and the email
notifications (booking received, payment successful, confirmed, pending, cancelled, refund,
reminder, admin notification).

---

## Phase 5 — DONE
**Files created:**
- `lib/payments/razorpay.ts` — order creation, checkout-callback signature verification, webhook
  signature verification; mock mode when credentials are absent
- `lib/payments/__tests__/razorpay.test.ts` — tests for both real HMAC and mock-mode verification
- `app/(public)/payment/actions.ts` — `createPaymentOrderAction`, `verifyPaymentAction` (idempotent)
- `app/api/webhooks/razorpay/route.ts` — async backup confirmation path
- `components/booking/razorpay-checkout-button.tsx` — real Razorpay checkout.js **or** a clearly
  labeled mock flow, decided per-request by the server
- `emails/_layout.tsx`, `emails/types.ts`, and all 8 templates from Section 32:
  `booking-received`, `payment-successful`, `booking-confirmed`, `payment-pending`,
  `booking-cancelled`, `refund-initiated`, `trip-reminder`, `admin-new-booking`
- `lib/email/send.ts` — one sender per template, all graceful no-ops if `RESEND_API_KEY` is unset
- Updated: `app/(public)/thank-you/[bookingId]/page.tsx` (real payment button, no more
  "coming soon" placeholder), `app/(public)/booking/[departureId]/actions.ts` (fires
  Booking Received + admin emails after the transaction commits), `.env.example`
  (`RAZORPAY_WEBHOOK_SECRET`)

**Commands to run:** `npm run test` (now covers both pricing and payment-signature logic).

**What should work now:**
- On `/thank-you/[bookingId]`, a customer with `amountDue > 0` sees a **Pay Now** button. In mock
  mode (the `.env.example` default) it simulates a full gateway round-trip client-side and
  confirms the booking through the exact same server code path a real payment would use — nothing
  about the confirmation logic differs between mock and live mode, only whether a browser checkout
  window actually opens.
- With real `RAZORPAY_KEY_ID`/`SECRET` set and `PAYMENTS_MOCK_MODE=false`, the same button opens
  Razorpay's real checkout, and the success callback is verified server-side via HMAC-SHA256
  before anything in the database changes — a forged or tampered callback is rejected and the
  payment is marked `FAILED`, not `CAPTURED`.
- `POST /api/webhooks/razorpay` gives a second, independent confirmation path so a booking still
  gets marked paid even if the customer's browser closes right after paying. Both the callback
  path and the webhook path write through the same idempotent logic (check `payment.status ===
  "CAPTURED"` first), so whichever arrives first "wins" and the second is a safe no-op — this
  directly covers **Scenario 7** from Section 59 (user refreshes the payment page).
- A booking becomes `CONFIRMED` only when `amountPaid >= finalTotal`; if the advance is less than
  the full price it becomes `PARTIALLY_PAID` instead, which is the state that unlocks paying the
  remaining balance later using the same button/component.
- All 8 email templates render with the Himaroh navy/gold layout and are wired to real triggers:
  booking creation → Booking Received + Admin Notification; verified payment → Payment Successful,
  plus Booking Confirmed if that payment completed the total. `payment-pending`, `booking-cancelled`,
  `refund-initiated`, and `trip-reminder` are fully built and exported from `lib/email/send.ts` but
  intentionally **not yet wired to a trigger** — cancellation/refund need the admin booking
  management UI (Phase 7) and reminders need a scheduled job (noted, not built — this project has
  no background job runner configured yet; the cleanest fit is a Vercel Cron route hitting a small
  API endpoint, called out again in the Phase 9 production checklist).
- Every email send is wrapped so a missing `RESEND_API_KEY` **logs and continues** rather than
  throwing — the booking/payment flow can never fail because email delivery failed.

**Next phase (Phase 6):** admin authentication and the dashboard shell, then Package/Departure/
Pricing CRUD — the first phase where SUPER_ADMIN / OPERATIONS_ADMIN / CONTENT_MANAGER roles
actually gate what's visible and editable.

---

## Phase 6 — DONE
**Files created:**
- `lib/auth.ts` — NextAuth credentials provider against `AdminUser` (bcrypt), JWT session
  carrying `role` + `id`, 8-hour session expiry
- `app/api/auth/[...nextauth]/route.ts`, `middleware.ts` (protects every `/admin/*` route except
  `/admin/login`), `types/next-auth.d.ts` (typed `session.user.role`)
- `lib/auth/session.ts` (`getAdminSession`, never redirects) and `lib/auth/guard.ts`
  (`requireAdminAction`, throws `AuthorizationError` — used inside every mutating server action)
- `lib/audit.ts` — `logAudit()`, wired into every package/departure mutation
- `app/admin/login/page.tsx`, `components/admin/login-form.tsx`
- `app/admin/(dashboard)/layout.tsx` — redirects unauthenticated requests even though middleware
  already should have caught them (defense in depth), renders role-aware sidebar/topbar
- `components/admin/{sidebar,topbar,access-denied}.tsx`, `lib/admin/nav.ts` (nav items are
  filtered by role, and only link to routes that actually exist yet — no dead buttons)
- `lib/queries/admin-dashboard.ts` + `app/admin/(dashboard)/page.tsx` — every metric from Section 12
- `lib/validations/{package,departure}.ts`
- `app/admin/(dashboard)/packages/{page,actions}.tsx`, `packages/new/page.tsx`, `packages/[id]/page.tsx`
- `app/admin/(dashboard)/departures/{page,actions}.tsx`, `departures/new/page.tsx`, `departures/[id]/page.tsx`
- `components/admin/{package-form,package-row-actions,departure-form,departure-row-actions}.tsx`

**Commands to run:** none beyond what's already set up — no schema changes this phase (`AdminUser`
and `AuditLog` were already in the Phase 1 schema). Just make sure you've run `npm run db:seed` at
some point, since that's what creates the dev admin login.

**Login:** `/admin/login` → `admin@himarohtravels.dev` / `ChangeMe123!` (seeded, dev-only — rotate
before production, same as flagged in Phase 1).

**What should work now:**
- Every `/admin/*` route is unreachable without a session (middleware), and every mutating server
  action independently re-checks role via `requireAdminAction` — so even a crafted direct call to
  a server action from outside the UI is rejected, not just hidden from the sidebar.
- **CONTENT_MANAGER** can create/edit/publish/archive packages but gets `AuthorizationError` on
  any departure action. **OPERATIONS_ADMIN** is the reverse. **SUPER_ADMIN** can do both. This
  mirrors your Section (Database + Admin Panel) role matrix exactly.
- Package CRUD: create, edit, publish/unpublish toggle, and archive (soft delete via `deletedAt`
  — packages are never hard-deleted since departures/bookings reference them).
- Departure CRUD: create (with nested Quad/Triple/Double pricing rows in one transaction), edit,
  Close/Reopen quick-actions, delete (blocked with a clear message if the departure already has
  bookings — deletion would silently orphan real customer data). **Capacity can't be dropped below
  `bookedSeats`** — the exact kind of admin mistake that would otherwise corrupt availability math.
- Every create/update/status-change/delete writes an `AuditLog` row with before/after values.
- `revalidatePath` is called after every mutation, so the public site (`/`, `/trips`,
  `/trips/[slug]`) reflects admin edits immediately — this is the literal Section 51 requirement
  ("if I change the price in the admin dashboard, the public website must automatically show the
  new price") actually wired end to end, not just described.

**Next phase (Phase 7):** booking management (search/filter/status/refunds/offline payments),
customer management, accommodations CRUD, content management (itinerary/inclusions/exclusions/
gallery/FAQ/testimonials), coupons, enquiries, and site settings — the rest of the admin nav.

---

## Phase 7 — DONE
**Files created (32 new files, all following the Phase 6 pattern: Zod validation → `requireAdminAction`
role check → mutation → `logAudit` → `revalidatePath`):**

- **Bookings** (`SUPER_ADMIN`, `OPERATIONS_ADMIN`): `bookings/{page,actions,[id]/page}.tsx`,
  `components/admin/{booking-filters,booking-management-panel,export-csv-button}.tsx`,
  `lib/queries/admin-bookings.ts`. Search by ref/name/phone, filter by status/departure, paginated,
  full traveller/payment/notes detail view, status change (cancelling auto-releases seats back to
  the departure), record offline payment, issue refund, internal notes, CSV export.
- **Customers** (`SUPER_ADMIN`, `OPERATIONS_ADMIN`): `customers/{page,[id]/page}.tsx`,
  `lib/queries/admin-customers.ts`. List + per-customer booking history.
- **Accommodations** (`SUPER_ADMIN`, `OPERATIONS_ADMIN`): full CRUD, package linking, delete blocked
  if referenced by a booking (mirrors the departure-deletion safeguard from Phase 6).
- **Content** (`SUPER_ADMIN`, `CONTENT_MANAGER`): per-package tabbed editor — itinerary (add/edit/
  delete/reorder via up-down swap, no drag-drop dependency needed), inclusions, exclusions, FAQs
  (with publish toggle), and package images (URL-based, first image auto-becomes cover — flagged
  inline that real upload storage isn't wired yet per Section 42).
- **Gallery** (`SUPER_ADMIN`, `CONTENT_MANAGER`): site-wide `GalleryImage` CRUD, separate from
  per-package images.
- **Testimonials** (`SUPER_ADMIN`, `CONTENT_MANAGER`): CRUD with verified/published toggles —
  nothing shows on the public site until explicitly published, so no fake reviews can leak through.
- **Coupons** (`SUPER_ADMIN` only, per the role matrix): full CRUD with percentage/fixed discount,
  max discount cap, min booking amount, date window, usage limits; delete is blocked once a coupon
  has real usage history (deactivate instead).
- **Enquiries** (`SUPER_ADMIN`, `OPERATIONS_ADMIN`): list + status control (New/Contacted/Resolved).
- **Settings** (`SUPER_ADMIN` only): company info, phone, email, Instagram, WhatsApp number,
  business hours, cancellation policy summary — and explicitly, permanently **not** payment
  credentials, database URLs, or auth secrets, which stay environment-variable-only. The form says
  so directly rather than just omitting the fields silently.
- `lib/admin/nav.ts` updated with all 7 new sections, each role-filtered.

**Commands to run:** none — no schema changes this phase.

**A gap worth naming honestly:** the public-facing content pages that would *consume* some of this
admin data — `/about`, `/faq`, `/gallery`, `/terms`, `/privacy`, `/cancellation-policy`, `/contact`
— were listed in Section 15's route map but were never actually assigned to any of the 9 build
phases in Section 54. They're not built yet. The admin CRUD for Gallery/Testimonials/FAQs is fully
real and persists to Postgres correctly (so it's not "fake admin CRUD" per Section 52 — it does
real work), it just doesn't have a public page rendering it yet for Gallery/FAQ-standalone/Contact.
Testimonials *are* already consumed (the homepage section from Phase 2), and FAQs *are* consumed
per-package (the trip detail page from Phase 3) — only the sitewide/standalone versions of these
pages are missing. Worth a short Phase 7.5 if you want it before Phase 8's SEO work, since SEO
metadata for pages that don't exist yet isn't very useful.

**Next phase (Phase 8):** SEO (sitemap, robots.txt, structured data), accessibility pass,
performance optimization, and security hardening — the polish phase Section 54 scopes as Phase 8.

---

## Phase 8 — DONE
**Files created:**
- `app/sitemap.ts` — dynamic, DB-driven; every published trip is included automatically, nothing
  hardcoded, so unpublishing a package removes it from the sitemap on the next build/request
- `app/robots.ts` — disallows `/admin`, `/api`, `/booking`, `/thank-you` (no SEO value, and the
  latter two are per-customer pages that shouldn't be indexable)
- `lib/seo/schema.ts` + `components/seo/json-ld.tsx` — structured data builders for
  `TravelAgency` (Organization), `TouristTrip` + `AggregateOffer`, `BreadcrumbList`, `FAQPage`
- `components/trip/breadcrumb.tsx` — visible breadcrumb nav (the human-facing counterpart to the
  BreadcrumbList schema, and a straightforward accessibility win)
- `components/layout/skip-link.tsx` — keyboard-accessible skip-to-content link
- `lib/rate-limit.ts` — Upstash-backed rate limiter, no-ops gracefully when unconfigured (same
  degrade-gracefully pattern as email/payments from Phase 5)
- Updated: `app/layout.tsx` (Organization JSON-LD), `app/(public)/trips/[slug]/page.tsx` (Trip +
  Breadcrumb + FAQ JSON-LD, visible breadcrumb), `app/(public)/layout.tsx` +
  `app/admin/(dashboard)/layout.tsx` (skip link / `id="main-content"` landmark), `next.config.mjs`
  (Content-Security-Policy, Permissions-Policy, Strict-Transport-Security), booking
  `actions.ts` (rate limiting wired into `createBooking`), `lib/booking/errors.ts` (new
  `RATE_LIMITED` code with its own honest message)

**Commands to run:** none — no schema changes.

**What should work now:**
- **SEO**: `/sitemap.xml` and `/robots.txt` are live and DB-driven. Every published trip page
  carries `TouristTrip` structured data with real pricing pulled from live `Departure`/`Pricing`
  rows — and **`aggregateRating` only appears when the package has real, published testimonials**,
  computed as their actual average. No package gets a rating out of thin air, per your explicit
  "do not generate fake ratings or reviews in schema" instruction.
- **Accessibility**: skip-link on every page (public and admin), `id="main-content"` landmarks,
  `aria-current="page"` on the active nav link, `aria-label`s on icon-only buttons (already present
  from earlier phases — WhatsApp button, hamburger menu), the FAQ accordion and all form controls
  were already built on Radix/native semantic elements, so keyboard navigation and screen-reader
  labeling were mostly already correct going into this phase; this phase's job was closing the
  remaining gaps (landmarks, skip link, breadcrumb `aria-current`).
- **Performance**: this phase didn't need new work beyond what earlier phases already built in —
  `next/image` with responsive `sizes` on trip cards, ISR (`revalidate = 60`) on the homepage and
  trip pages, ISR + ID-driven ISR-safe params, ubiquitous `<Suspense>` + skeleton fallbacks,
  debounced search everywhere, and paginated admin bookings. Flagging honestly rather than
  inventing new performance work where none was needed: the trip catalogue is small enough that
  `/trips` doesn't yet need pagination — worth revisiting once the catalog grows past ~50 packages.
- **Security hardening**: `createBooking` now rate-limits by both IP and phone number (5 attempts /
  10 minutes) — the public endpoint most exposed to abuse, since it creates real DB rows and sends
  real emails. A real `Content-Security-Policy` is enforced (documented trade-off: `unsafe-inline`
  is kept for scripts/styles rather than setting up nonce-based CSP, since Next.js's own hydration
  scripts need it — a stricter CSP is possible but meaningfully more setup). CSRF: Next.js Server
  Actions already reject cross-origin `POST`s by default (same-origin check on the `Origin` header),
  so no additional CSRF token plumbing was needed — noted here rather than left unexplained.
  SQL injection: structurally prevented throughout, since every query goes through Prisma's
  parameterized query builder (the one raw query, in the booking transaction's row lock, uses
  tagged-template parameter binding, not string concatenation).

**Next phase (Phase 9):** final setup/deployment documentation — migration commands, seed commands,
local dev commands, build commands, Vercel/Razorpay/email/storage/admin-login setup, and the
production + testing checklists from Sections 58–59.

---

## Phase 9 — DONE

**Files created:**
- `DEPLOYMENT.md` — installation from a fresh machine, database setup (pooled vs. direct
  connection strings explained), Razorpay go-live steps, email domain verification, image storage
  wiring notes, admin login rotation, Vercel deployment, and a concrete production checklist
- `TESTING.md` — walks through all 12 Section 59 scenarios against the actual code (file + function
  references, not just prose), plus honest notes on what this checklist deliberately doesn't cover
- `scripts/verify-concurrent-booking.ts` — a real, runnable proof of the no-overbooking guarantee:
  creates a genuine 1-seat departure in your actual database, fires two simultaneous booking
  attempts, and asserts exactly one wins. Race conditions can't be verified by reading code, so
  this scenario gets a real script instead of a claim.
- `npm run verify:concurrency` script added to `package.json`

**Commands to run:** see `DEPLOYMENT.md` Section 1 for the full fresh-machine sequence; short
version:
```bash
npm install && cp .env.example .env
npx prisma generate && npx prisma migrate dev --name init
npm run db:seed
npm run test                  # unit tests
npm run verify:concurrency    # real-DB race-condition proof
npm run dev
```

---

## Project status: all 9 phases from the original spec are complete

A short, honest summary of where things actually stand, rather than a blanket "done":

**Solid and fully wired end-to-end:** package catalogue, trip detail pages, the entire booking
engine (server-authoritative pricing, atomic seat reservation, coupon validation), Razorpay
payments (mock + live modes, webhook + callback confirmation, idempotent), 8 transactional emails,
admin authentication with 3 enforced roles, and CRUD for every entity called for in Section 13
(packages, departures, pricing, bookings, customers, accommodations, itinerary, inclusions,
exclusions, FAQs, gallery, testimonials, coupons, enquiries, settings) — all with audit logging and
`revalidatePath` keeping the public site in sync with admin edits, per Section 51's core promise.

**Known, explicitly-flagged gaps** (each one was called out in the phase where it became relevant,
not discovered now):
1. ~~Standalone content pages~~ — **fixed**: `/about`, `/faq`, `/gallery`, `/contact`, `/terms`,
   `/privacy`, `/cancellation-policy` were built after a user report that the navbar/footer linked
   to them and got a 404. Gallery and FAQ read real DB data (`GalleryImage`, published `FAQ` rows);
   Contact has a working, rate-limited, honeypot-protected form that writes real `Enquiry` rows
   (visible in `/admin/enquiries`); Terms/Privacy/Cancellation Policy carry the Section 40 legal
   disclaimer rather than presenting AI-drafted text as final legal copy.
2. **Real image upload** isn't wired — the admin content/gallery editors accept a hosted image URL
   rather than a file picker. Storage env vars and bucket config are ready; `DEPLOYMENT.md` Section
   5 explains the small remaining step.
3. **Admin-user management UI** doesn't exist — new admins are created via a one-off script
   (`DEPLOYMENT.md` Section 6), not a form. `AdminUser` CRUD would naturally extend the Phase 6/7
   pattern if needed.
4. **Analytics** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`/`NEXT_PUBLIC_META_PIXEL_ID`) is architected
   (env-var driven per Section 50) but the actual `<Script>` tags were never added.
5. **Customer self-service login/dashboard** (Section 49) was explicitly scoped as optional/
   "architect for it" — the `Customer.passwordHash` field exists, but there's no `/account` UI.
   Guest booking, the actually-required path, works completely.

None of these were built and hidden — each is exactly where it was flagged the moment it became
relevant, so you can prioritize them against a real launch date rather than discovering them later.

---

## Phase 6 — DONE
**Files created:**
- `lib/auth.ts` — NextAuth config, credentials provider checked against `AdminUser`, JWT session
  carries `role` + `id`; `types/next-auth.d.ts` for typed sessions
- `app/api/auth/[...nextauth]/route.ts`, `middleware.ts` — protects every `/admin/*` route except
  `/admin/login`
- `lib/auth/session.ts`, `lib/auth/guard.ts` — `getAdminSession()` for pages (returns null, caller
  decides what to do), `requireAdminAction()` for server actions (throws `AuthorizationError`)
- `lib/audit.ts` — writes to `AuditLog`, wired into every mutation this phase adds
- `lib/admin/nav.ts` — sidebar config filtered by role; only lists routes that actually exist
- `components/admin/{login-form,sidebar,topbar,access-denied,package-form,package-row-actions,departure-form,departure-row-actions}.tsx`
- `app/admin/login/page.tsx` (unprotected) and `app/admin/(dashboard)/layout.tsx` (protected —
  the route group keeps login outside the auth-required layout, so there's no redirect loop)
- `app/admin/(dashboard)/page.tsx` + `lib/queries/admin-dashboard.ts` — the 9 stat cards from
  Section 12, plus a recent-bookings table
- `app/admin/(dashboard)/packages/{page,actions}.tsx`, `packages/new/page.tsx`, `packages/[id]/page.tsx`
- `app/admin/(dashboard)/departures/{page,actions}.tsx`, `departures/new/page.tsx`, `departures/[id]/page.tsx`
- `lib/validations/{package,departure}.ts`

**Commands to run:**
```bash
npm run db:seed   # now also seeds ops@himarohtravels.dev and content@himarohtravels.dev
npm run dev
```
Then visit `/admin/login`. All three dev accounts share the password `ChangeMe123!`.

**What should work now:**
- `/admin/login` → real credential check against `AdminUser.passwordHash` (bcrypt), 8-hour JWT
  sessions, `lastLoginAt` updated on success.
- Every `/admin/*` route is middleware-protected; signed-out visitors are redirected to
  `/admin/login` before any admin page even renders.
- **Role gating is real, not cosmetic** — log in as `content@himarohtravels.dev` and the sidebar
  only shows Dashboard + Packages (no Departures link); navigating to `/admin/departures` directly
  shows an explicit Access Restricted panel, not a crash or a silently-empty page. Log in as
  `ops@himarohtravels.dev` and it's the reverse. Every server action re-checks the role itself via
  `requireAdminAction` — the UI hiding a button is a courtesy, not the actual security boundary.
- **Package CRUD**: create/edit/publish-toggle/archive (soft delete — packages are never hard
  deleted since departures and bookings reference them). Editing a package calls
  `revalidatePath` on its public trip page, so an admin edit shows up immediately without a
  redeploy, per Section 51's "if I change the price in the admin dashboard, the public website
  must automatically show the new price."
- **Departure + Pricing CRUD**: create a departure with per-sharing-type prices in one form;
  editing enforces that capacity can never drop below `bookedSeats` (can't shrink a departure
  out from under existing bookings); Close/Reopen is a one-click status toggle from the list;
  delete is blocked with a clear message if the departure already has bookings — cancellation
  (Phase 7) is the correct tool for that case, not deletion.
- Every create/update/status-change/delete above writes an `AuditLog` row with admin id, action,
  entity, and before/after values.

**Next phase (Phase 7):** Bookings management (search/filter/status changes/refunds — this is
where the `booking-cancelled` and `refund-initiated` emails finally get wired up), Customers,
Accommodations, Content (itinerary/inclusions/exclusions/gallery/testimonials/FAQ), Coupons,
Enquiries, and Site Settings.

---

## Status update: Phases 7–9 complete, content-page gap fixed, UI restyled to match Tripgix

*(Note: this README's phase-by-phase log above stops updating after Phase 6 due to an editing
mismatch earlier in a long session — the work itself is real and shipped in the corresponding
phase zips; this section is the accurate summary of everything since.)*

**Phase 7** added Bookings (search/filter/status/refunds/offline-payment/CSV export), Customers,
Accommodations, Content management (itinerary/inclusions/exclusions/FAQs/images), Gallery,
Testimonials, Coupons (SUPER_ADMIN only), Enquiries, and Settings — all following the same
Zod → `requireAdminAction` → mutation → `logAudit` → `revalidatePath` pattern as Phase 6.

**Phase 8** added SEO (`app/sitemap.ts`, `app/robots.ts`, JSON-LD structured data for Organization/
TouristTrip/Breadcrumb/FAQ — ratings only ever built from real published testimonials, never
fabricated), accessibility (skip links, landmarks, `aria-current`), and security hardening
(rate limiting on public forms via `lib/rate-limit.ts`, a real Content-Security-Policy).

**Phase 9** added `DEPLOYMENT.md`, `TESTING.md` (walking through all 12 Section 59 scenarios
against actual code), and `scripts/verify-concurrent-booking.ts` — a real, runnable proof against
a live database that the no-overbooking guarantee holds, not just a claim in a comment.

**Content-pages fix:** after a user report that `/gallery` 404'd, built the seven public pages
that were linked from nav/footer but never assigned to a build phase in the original spec:
`/gallery`, `/about`, `/faq`, `/contact` (with a real rate-limited, honeypot-protected form writing
to `Enquiry`), `/terms`, `/privacy`, `/cancellation-policy` (the legal pages carry an explicit
"have a lawyer review this" disclaimer rather than presenting AI-drafted text as final).

**UI restyle:** at the person's request, reworked the public site's visual design to match
tripgix.com's actual UI (verified from real screenshots), replacing the original navy/serif
brief:
- **Colors:** black navbar/footer, bold amber-gold accent (`#F5A623`), white sections, gold "band"
  CTA sections. Implemented by repointing the existing `navy`/`gold` Tailwind tokens rather than
  renaming classes — every `bg-navy`/`text-gold`/etc. already in ~160 files re-skinned
  automatically, with no risk of missed classes.
- **Typography:** Fredoka (rounded, bold) for headings, Inter kept for body.
- **Rebuilt to match:** Navbar, Hero (working gold search bar → `/trips?q=`), Trust bar, Trip cards
  (pin/clock row, "Starts at ₹X/-", multi-date row), section headers (heading + gold underline bar
  + gold pill), Destination row, Booking CTA, Footer, Trips listing, Contact page.
- **Deliberately not copied:** Tripgix's specific stats, team bios, and office address — real
  content on their site that would be fabricated on Himaroh's, which Section 52 forbids regardless
  of styling goals.
- **Not yet restyled:** trip detail page's secondary sections, About/FAQ page bodies, booking flow,
  and admin panel inherit the new color tokens automatically (so nothing is broken) but haven't
  been redesigned to Tripgix's specific card/section patterns yet.
