import { PrismaClient, SharingType, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Himaroh Travels database...");

  // ---------------------------------------------------------------
  // ADMIN USER (development/demo credentials — CHANGE BEFORE PRODUCTION)
  // ---------------------------------------------------------------
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@himarohtravels.dev" },
    update: {},
    create: {
      name: "Himaroh Super Admin",
      email: "admin@himarohtravels.dev",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });
  console.log("Admin created:", admin.email, "(password: ChangeMe123! — DEV ONLY)");

  // Additional dev-only accounts so the OPERATIONS_ADMIN / CONTENT_MANAGER role
  // restrictions in the admin panel are actually testable, not just theoretical.
  const opsAdmin = await prisma.adminUser.upsert({
    where: { email: "ops@himarohtravels.dev" },
    update: {},
    create: {
      name: "Himaroh Ops Admin",
      email: "ops@himarohtravels.dev",
      passwordHash,
      role: AdminRole.OPERATIONS_ADMIN,
    },
  });
  const contentAdmin = await prisma.adminUser.upsert({
    where: { email: "content@himarohtravels.dev" },
    update: {},
    create: {
      name: "Himaroh Content Manager",
      email: "content@himarohtravels.dev",
      passwordHash,
      role: AdminRole.CONTENT_MANAGER,
    },
  });
  console.log("Also seeded:", opsAdmin.email, "and", contentAdmin.email, "— same dev password.");

  // ---------------------------------------------------------------
  // SITE SETTINGS
  // ---------------------------------------------------------------
  const settings: Record<string, string> = {
    company_name: "Himaroh Travels",
    phone: "+91 85273 93969",
    email: "info@himarohtravels.com",
    instagram: "https://instagram.com/himaroh.travels",
    whatsapp_number: "918527393969",
    business_hours: "Mon–Sat, 10:00 AM – 7:00 PM IST",
    cancellation_policy_summary:
      "The advance amount is non-refundable. Refer to the full cancellation policy page for details.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("Site settings seeded.");

  // ---------------------------------------------------------------
  // PACKAGE: Tungnath & Chandrashila
  // ---------------------------------------------------------------
  const pkg = await prisma.package.upsert({
    where: { slug: "tungnath-chandrashila" },
    update: {},
    create: {
      slug: "tungnath-chandrashila",
      title: "Tungnath & Chandrashila",
      subtitle: "World's Highest Shiva Temple + Himalayan Sunrise Trek",
      region: "Garhwal, Uttarakhand",
      country: "India",
      durationNights: 2,
      durationDays: 3,
      difficulty: "Easy to Moderate",
      altitudeFt: 12110,
      distanceKm: 16,
      pickupCity: "Delhi",
      pickupPoint: "Akshardham Metro Station",
      overview:
        "A curated Himalayan journey to Tungnath, the world's highest Shiva temple, continuing to Chandrashila peak for panoramic views, with visits to Deoria Tal, Dhari Devi and Devprayag along the way.",
      highlights: [
        "Tungnath Temple",
        "Chandrashila Summit",
        "Deoria Tal",
        "Dhari Devi Temple",
        "Devprayag Sangam",
        "Omkareshwar Temple",
        "Chopta",
        "Sari Village",
      ],
      isPublished: true,
      isFeatured: true,
      metaTitle: "Tungnath & Chandrashila Trek — 2N/3D from Delhi | Himaroh Travels",
      metaDescription:
        "Join Himaroh Travels for a 2 nights / 3 days Himalayan journey to Tungnath and Chandrashila, with Delhi pickup and drop. Easy to moderate difficulty.",
    },
  });
  console.log("Package created:", pkg.slug);

  // ---------------------------------------------------------------
  // ITINERARY (Day 0 stored as dayNumber 0)
  // ---------------------------------------------------------------
  const itineraryDays = [
    {
      dayNumber: 0,
      title: "Departure from Delhi",
      description:
        "Assemble at Akshardham Metro Station, Delhi by approximately 09:00–10:00 PM. Meet your trip leader and group. Short briefing, then depart in a comfortable Tempo Traveller for an overnight journey toward Devprayag.",
    },
    {
      dayNumber: 1,
      title: "Devprayag & Dhari Devi",
      description:
        "Arrive at Devprayag early morning and visit the Devprayag Sangam. Continue to Dhari Devi Temple, then drive towards accommodation. Check-in, freshen up, relax, dinner, and overnight stay.",
    },
    {
      dayNumber: 2,
      title: "Tungnath & Chandrashila",
      description:
        "Early breakfast, then drive to Chopta. Begin the trek to Tungnath Temple and continue towards Chandrashila Peak for panoramic Himalayan views. Trek back to Chopta before sunset. Overnight stay at Chopta or Sari Village.",
    },
    {
      dayNumber: 3,
      title: "Deoria Tal & Return",
      description:
        "Wake up early, breakfast, and check out. Drive to Sari Village and trek to Deoria Tal, then return to Sari Village. Visit Omkareshwar Temple, Ukhimath, and begin the return journey to Delhi, reaching early morning.",
    },
  ];

  for (const [i, day] of itineraryDays.entries()) {
    await prisma.itineraryDay.upsert({
      where: { packageId_dayNumber: { packageId: pkg.id, dayNumber: day.dayNumber } },
      update: {},
      create: { ...day, packageId: pkg.id, position: i },
    });
  }
  console.log("Itinerary seeded (4 days).");

  // ---------------------------------------------------------------
  // INCLUSIONS / EXCLUSIONS
  // ---------------------------------------------------------------
  const inclusions = [
    "2 nights stay at Chopta Camp or Cottage",
    "Vegetarian meals as per meal plan (2 breakfasts, 2 dinners)",
    "Trek to Tungnath and Chandrashila Peak",
    "Trek completion certificate",
    "Qualified and experienced trek leaders",
    "Transportation from Delhi to Chopta and return",
  ];
  const exclusions = [
    "Any airfare or train fare",
    "Meals other than those mentioned in inclusions",
    "Personal expenses (tips, laundry, liquor, medicines, etc.)",
    "Medical expenses and emergency evacuation",
    "Meals during transit / road journey unless explicitly included",
    "Porter or mules for personal luggage",
    "Tungnath and Deoria Tal trek permit charges and forest entry fees",
    "Personal trekking gear (jackets, shoes, gaiters, poles, rain gear, etc.)",
    "Any item not explicitly mentioned under inclusions",
  ];
  await prisma.inclusion.deleteMany({ where: { packageId: pkg.id } });
  await prisma.exclusion.deleteMany({ where: { packageId: pkg.id } });
  await prisma.inclusion.createMany({
    data: inclusions.map((label, i) => ({ packageId: pkg.id, label, position: i })),
  });
  await prisma.exclusion.createMany({
    data: exclusions.map((label, i) => ({ packageId: pkg.id, label, position: i })),
  });
  console.log("Inclusions/Exclusions seeded.");

  // ---------------------------------------------------------------
  // ACCOMMODATIONS
  // ---------------------------------------------------------------
  const cottage = await prisma.accommodation.create({
    data: {
      name: "Chopta Cottage Stay",
      category: "Cottage",
      description: "Comfortable cottage-style accommodation near Chopta, subject to availability.",
      location: "Chopta / Sari Village",
      images: [],
      amenities: ["Blankets provided", "Common washrooms", "Hot water (bucket)"],
      capacity: 4,
      availableUnits: 10,
      isActive: true,
      priceAdjustment: 0,
    },
  });
  const camp = await prisma.accommodation.create({
    data: {
      name: "Chopta Camp Stay",
      category: "Camp",
      description: "Tented camp accommodation near Chopta, subject to availability.",
      location: "Chopta / Sari Village",
      images: [],
      amenities: ["Sleeping bags/blankets provided", "Shared washrooms", "Bonfire (seasonal)"],
      capacity: 3,
      availableUnits: 10,
      isActive: true,
      priceAdjustment: 0,
    },
  });
  await prisma.packageAccommodation.createMany({
    data: [
      { packageId: pkg.id, accommodationId: cottage.id },
      { packageId: pkg.id, accommodationId: camp.id },
    ],
    skipDuplicates: true,
  });
  console.log("Accommodations seeded.");

  // ---------------------------------------------------------------
  // ADVANCE CONFIG (₹1000/person, non-refundable, per brochure)
  // ---------------------------------------------------------------
  await prisma.advanceConfig.upsert({
    where: { packageId: pkg.id },
    update: {},
    create: {
      packageId: pkg.id,
      advanceType: "FIXED",
      advanceAmount: 1000,
      isRefundable: false,
    },
  });

  // ---------------------------------------------------------------
  // DEPARTURES + PRICING
  // NOTE: brochure did not specify exact rupee amounts — placeholder
  // demo prices below, editable from /admin without touching code.
  // ---------------------------------------------------------------
  const departureDates = [
    new Date("2026-09-15T21:00:00+05:30"),
    new Date("2026-09-22T21:00:00+05:30"),
    new Date("2026-10-05T21:00:00+05:30"),
  ];

  for (const departureDate of departureDates) {
    const departure = await prisma.departure.create({
      data: {
        packageId: pkg.id,
        departureDate,
        totalCapacity: 20,
        bookedSeats: 0,
        status: "OPEN",
      },
    });

    await prisma.pricing.createMany({
      data: [
        { departureId: departure.id, sharingType: SharingType.QUAD, price: 4999 },
        { departureId: departure.id, sharingType: SharingType.TRIPLE, price: 5499 },
        { departureId: departure.id, sharingType: SharingType.DOUBLE, price: 5999 },
      ],
    });
  }
  console.log("3 sample departures with pricing seeded.");

  // ---------------------------------------------------------------
  // FAQs
  // ---------------------------------------------------------------
  const faqs = [
    {
      question: "Is Tungnath suitable for beginners?",
      answer:
        "The trek is graded easy to moderate and is attempted by many first-time trekkers. A reasonable level of fitness is still recommended.",
    },
    {
      question: "What should I carry?",
      answer:
        "Warm layers, comfortable trekking shoes, a rain jacket, a personal water bottle, and any personal medication. A detailed packing list is shared after booking.",
    },
    {
      question: "What happens if weather affects the trek?",
      answer:
        "Mountain weather can be unpredictable. The itinerary may be modified by the trip leader for safety and logistical reasons.",
    },
    {
      question: "What is the cancellation policy?",
      answer:
        "Please refer to our Cancellation Policy page. The advance amount is non-refundable.",
    },
    {
      question: "What identification is required?",
      answer: "A valid government-issued photo ID is required for all travellers.",
    },
    {
      question: "How does seat confirmation work?",
      answer:
        "A seat is confirmed once the advance amount is received and payment is verified on our system.",
    },
  ];
  await prisma.fAQ.createMany({
    data: faqs.map((f, i) => ({ ...f, packageId: pkg.id, position: i })),
  });
  console.log("FAQs seeded.");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
