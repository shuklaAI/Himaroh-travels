/**
 * Verifies the Section 10/59 "two customers book the last seat simultaneously" guarantee
 * against a REAL database (not mocked) — proof, not just reasoning in a comment.
 *
 * This mirrors the transaction pattern in
 * app/(public)/booking/[departureId]/actions.ts (SELECT ... FOR UPDATE, then
 * re-check availability, then increment bookedSeats) rather than importing that
 * file directly, because it imports next/headers (rate limiting from Phase 8),
 * which requires a live Next.js request context and can't run in a standalone
 * script. If you change the locking logic in actions.ts, update this file too.
 *
 * Usage:
 *   npx tsx scripts/verify-concurrent-booking.ts
 *
 * Requires a real DATABASE_URL pointed at a migrated + seeded database.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reserveSeat(departureId: string, travellerCount: number): Promise<"OK" | "SOLD_OUT"> {
  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string; totalCapacity: number; bookedSeats: number }>>`
        SELECT id, "totalCapacity", "bookedSeats" FROM "Departure" WHERE id = ${departureId} FOR UPDATE
      `;
      const departure = locked[0];
      if (!departure) throw new Error("NOT_FOUND");

      const seatsAvailable = departure.totalCapacity - departure.bookedSeats;
      if (seatsAvailable < travellerCount) throw new Error("SOLD_OUT");

      // Simulate the same work the real booking transaction does (customer
      // lookup, pricing read, booking insert) with a small delay, so the two
      // concurrent calls are actually racing rather than serializing trivially.
      await new Promise((r) => setTimeout(r, 150));

      await tx.departure.update({
        where: { id: departureId },
        data: { bookedSeats: { increment: travellerCount } },
      });
    });
    return "OK";
  } catch (err: any) {
    if (err.message === "SOLD_OUT") return "SOLD_OUT";
    throw err;
  }
}

async function main() {
  console.log("Setting up a 1-seat test departure...");

  const pkg = await prisma.package.findUnique({ where: { slug: "tungnath-chandrashila" } });
  if (!pkg) {
    console.error("Seed data not found. Run `npm run db:seed` first.");
    process.exit(1);
  }

  const testDeparture = await prisma.departure.create({
    data: {
      packageId: pkg.id,
      departureDate: new Date(Date.now() + 30 * 86400000),
      totalCapacity: 1,
      bookedSeats: 0,
      status: "OPEN",
    },
  });

  console.log(`Test departure ${testDeparture.id} created with 1 seat. Firing 2 concurrent reservation attempts for 1 seat each...`);

  const [resultA, resultB] = await Promise.all([
    reserveSeat(testDeparture.id, 1),
    reserveSeat(testDeparture.id, 1),
  ]);

  const results = [resultA, resultB];
  const okCount = results.filter((r) => r === "OK").length;
  const soldOutCount = results.filter((r) => r === "SOLD_OUT").length;

  console.log(`Result A: ${resultA}`);
  console.log(`Result B: ${resultB}`);

  const finalDeparture = await prisma.departure.findUnique({ where: { id: testDeparture.id } });
  console.log(`Final bookedSeats: ${finalDeparture?.bookedSeats} / totalCapacity: ${finalDeparture?.totalCapacity}`);

  // Cleanup
  await prisma.departure.delete({ where: { id: testDeparture.id } });

  if (okCount === 1 && soldOutCount === 1 && finalDeparture?.bookedSeats === 1) {
    console.log("\n✅ PASS — exactly one request won the seat, the other was correctly rejected as SOLD_OUT. No overbooking occurred.");
    process.exit(0);
  } else {
    console.error("\n❌ FAIL — race condition guard did not behave as expected. Do not deploy until this is fixed.");
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
