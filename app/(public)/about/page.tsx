import type { Metadata } from "next";
import { Compass, Users2, ShieldCheck, Mountain } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "About Us",
  description: "Himaroh Travels is a Himalayan adventure and spiritual travel company based out of Delhi, focused on curated small-group journeys.",
};

const VALUES = [
  { icon: Mountain, title: "Himalayan Focus", desc: "Every journey is built around the Garhwal Himalayas — its temples, treks, and villages." },
  { icon: Users2, title: "Small Groups", desc: "Group sizes are kept manageable so every traveller gets attention on the trail." },
  { icon: ShieldCheck, title: "Safety First", desc: "Itineraries are led by experienced trip leaders and adjusted when weather or terrain requires it." },
  { icon: Compass, title: "Thoughtful Planning", desc: "From Delhi pickup to the final drop, each day is paced rather than rushed." },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <section className="bg-navy py-20 text-center text-ivory">
        <div className="mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3">About Us</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">{settings.companyName}</h1>
          <p className="mt-4 text-ivory/70">
            A Himalayan adventure and spiritual travel company, organizing curated group journeys
            through Uttarakhand's Garhwal region — with pickup and drop from Delhi.
          </p>
        </div>
      </section>

      <section className="section max-w-3xl">
        <h2 className="mb-4 text-2xl font-semibold text-navy">What We Do</h2>
        <p className="leading-relaxed text-navy/70">
          Himaroh Travels organizes small-group treks and spiritual journeys centered on the
          Garhwal Himalayas — including Tungnath, the world's highest Shiva temple, Chandrashila
          peak, Deoria Tal, Dhari Devi, Devprayag and Omkareshwar. Trips include Delhi pickup and
          drop, trek leadership, and accommodation for the duration of the journey.
        </p>
      </section>

      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold text-navy">What We Value</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-navy/10 bg-white p-6 text-center">
                <Icon className="mx-auto h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="mt-4 text-sm font-semibold text-navy">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-navy/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section max-w-3xl text-center">
        <h2 className="mb-3 text-2xl font-semibold text-navy">Get in Touch</h2>
        <p className="text-navy/60">
          {settings.phone} · {settings.email}
        </p>
      </section>
    </div>
  );
}
