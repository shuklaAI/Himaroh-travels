# Himaroh Travels — Deployment Guide

This covers everything in Section 58: installation from a fresh machine, database, Razorpay,
email, image storage, admin login, Vercel deployment, and a production go-live checklist.

---

## 1. Installation (fresh machine)

```bash
git clone <your-repo-url> himaroh-travels
cd himaroh-travels
npm install
cp .env.example .env
# → open .env and fill in at least DATABASE_URL / DIRECT_URL (see Section 2 below)
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the
admin panel (`admin@himarohtravels.dev` / `ChangeMe123!` — **rotate this before production**, it's
a seeded development credential, not a real one).

Run the test suite any time with `npm run test` (pricing math + payment signature verification).

---

## 2. Database Setup (PostgreSQL + Prisma)

Any managed Postgres works (Supabase, Neon, Railway, RDS). You need two connection strings:

- `DATABASE_URL` — a **pooled** connection (via PgBouncer/Supabase pooler/etc.), used at runtime
  by the app itself, since serverless functions open many short-lived connections.
- `DIRECT_URL` — a **direct** (non-pooled) connection, used only by `prisma migrate`, which needs
  a session-level connection that pooling connections often don't support well.

```bash
npx prisma migrate deploy   # applies all migrations, production-safe (no interactive prompts)
npm run db:seed             # optional — only for a fresh demo/staging environment
```

**Do not run `db:seed` against a live production database with real customer data** — it's meant
for a clean environment and creates a hardcoded dev admin account.

---

## 3. Razorpay Setup

The app runs in **mock payment mode** by default (`PAYMENTS_MOCK_MODE="true"` in `.env.example`),
which fully exercises the booking → payment → confirmation flow with a simulated gateway — useful
for demos and development without a Razorpay account.

To go live:
1. Create a Razorpay account and complete KYC (required before you can accept real payments).
2. From the Razorpay Dashboard → Settings → API Keys, generate a **Key ID** and **Key Secret**.
3. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `PAYMENTS_MOCK_MODE="false"` in your
   production environment variables.
4. Under Settings → Webhooks, add a webhook pointing to
   `https://yourdomain.com/api/webhooks/razorpay`, subscribed to at least `payment.captured` and
   `payment.failed`. Copy the generated webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
5. Never put these values in any client-side code or a `NEXT_PUBLIC_*` variable — the checkout
   component only ever receives the publishable Key ID at request time, fetched server-side.

---

## 4. Email Setup (Resend)

1. Create a Resend account and verify a sending domain (e.g. `himarohtravels.com`) — DNS records
   (SPF/DKIM) are provided in their dashboard.
2. Generate an API key and set `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on your verified domain, e.g.
   `"Himaroh Travels <bookings@himarohtravels.com>"`.

If `RESEND_API_KEY` is unset, every email function in `lib/email/send.ts` logs and no-ops instead
of throwing — the booking/payment flow is never blocked by email delivery being unconfigured or
temporarily down.

---

## 5. Image Storage Setup

Package/gallery images in the admin panel currently accept a **hosted image URL** rather than a
direct file upload (flagged inline in the Content admin UI from Phase 7). To wire up real uploads:

1. Create a Supabase Storage bucket (or any S3-compatible bucket).
2. Set `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`,
   `STORAGE_ENDPOINT`, and `NEXT_PUBLIC_STORAGE_PUBLIC_URL`.
3. Add an upload route (e.g. `app/api/upload/route.ts`) that accepts a file, uploads it
   server-side, and returns the public URL — then swap the "Image URL" text input in
   `components/admin/{package-image-editor,gallery-manager}.tsx` for a real file picker calling
   that route. This wasn't built as part of the 9 phases since none of them explicitly scoped it;
   the environment variables and bucket architecture are ready for it.

Until then, admins can paste any publicly-hosted image URL (their own CDN, Unsplash, etc.) and it
works immediately — `next.config.mjs` already whitelists Supabase, S3, and Unsplash as allowed
image domains.

---

## 6. Admin Login Setup

1. Generate a real `NEXTAUTH_SECRET`: `openssl rand -base64 32`.
2. Set `NEXTAUTH_URL` to your production URL (`https://yourdomain.com`).
3. **Rotate the seeded dev admin immediately.** Either update its password directly:
   ```bash
   npx tsx -e "
   import bcrypt from 'bcryptjs';
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   const hash = await bcrypt.hash('YOUR-NEW-STRONG-PASSWORD', 10);
   await prisma.adminUser.update({ where: { email: 'admin@himarohtravels.dev' }, data: { passwordHash: hash } });
   console.log('Password rotated.');
   "
   ```
   or create a new `SUPER_ADMIN` the same way and deactivate (`isActive: false`) the seeded one.
4. Additional admins (`OPERATIONS_ADMIN`, `CONTENT_MANAGER`) can be created the same way — there's
   no admin-user-management UI yet (it wasn't in the original 9-phase scope; `AdminUser` CRUD would
   be a natural next addition, restricted to `SUPER_ADMIN`).

---

## 7. Vercel Deployment

1. Push the repo to GitHub/GitLab/Bitbucket, then import it in Vercel.
2. Framework preset: Next.js (auto-detected).
3. Add every variable from `.env.example` under Project Settings → Environment Variables — set
   real production values, and set `NEXT_PUBLIC_SITE_URL` to your actual domain (this feeds
   `metadataBase`, the sitemap, canonical URLs, and OpenGraph tags).
4. Build command: `next build` (default). Vercel does **not** automatically run
   `prisma migrate deploy` — either:
   - add `"postinstall": "prisma generate"` (already implied by the `prisma generate` step, but
     add it explicitly to `package.json` if your Postgres provider needs the client regenerated
     on every deploy), and run `npx prisma migrate deploy` manually/via CI before each deploy, or
   - use a Vercel deploy hook / GitHub Action step that runs migrations before the build.
5. After first deploy, run the admin login rotation from Section 6 above against production.
6. Verify `/sitemap.xml`, `/robots.txt`, and a trip page's structured data
   (via Google's Rich Results Test) are all working against the live domain.

---

## 8. Production Checklist

- [ ] Rotated the Supabase DB password and `NEXTAUTH_SECRET` that were pasted in plaintext during
      development (flagged in this README after Phase 4 — **do this even if you think you already
      did**, it's easy to forget).
- [ ] Seeded dev admin password rotated or account deactivated.
- [ ] `PAYMENTS_MOCK_MODE="false"` with real Razorpay keys + webhook secret set.
- [ ] Razorpay webhook URL added and verified receiving events (check Razorpay Dashboard → Webhooks
      → recent deliveries after a test payment).
- [ ] Resend domain verified, `EMAIL_FROM` uses that domain (unverified domains get emails
      silently dropped or spam-filtered by receiving servers).
- [ ] `DATABASE_URL` uses a pooled connection string; `DIRECT_URL` is direct — mixing these up
      causes intermittent "too many connections" errors under load.
- [ ] Ran `npm run verify:concurrency` against the production (or a staging clone of the
      production) database at least once — confirms the no-overbooking guarantee actually holds
      against your specific Postgres provider's transaction isolation behavior, not just in theory.
- [ ] Reviewed and replaced placeholder demo pricing (₹4,999/5,499/5,999 from the seed script) with
      real numbers via `/admin/departures`.
- [ ] Legal pages reviewed by an actual lawyer/business advisor before launch — the Terms &
      Cancellation Policy content described in Section 40 carries an explicit disclaimer that it's
      a starting point, not final legal copy (and note: the standalone `/terms`,
      `/cancellation-policy`, `/privacy` pages themselves aren't built yet — see the Phase 7 README
      note on the content-pages gap).
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real production domain (affects sitemap, canonical URLs,
      OpenGraph images, and the WhatsApp deep link's `wa.me` text).
- [ ] Confirmed `/admin` is unreachable from a fresh incognito session without logging in, and that
      a non-`SUPER_ADMIN` account genuinely can't reach `/admin/settings` or `/admin/coupons`
      (both via the sidebar being hidden AND via directly typing the URL).
- [ ] Analytics IDs (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`) set if wanted —
      architecture is ready (env-var driven, Section 50) but the actual `<Script>` tags loading GA/
      Meta Pixel weren't added in any of the 9 phases and would need a small follow-up.
