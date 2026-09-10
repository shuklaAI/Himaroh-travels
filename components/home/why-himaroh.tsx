import { Compass, ShieldCheck, BedDouble, Bus, Users2, HeartHandshake } from "lucide-react";

const REASONS = [
  { icon: Compass, title: "Experienced Leaders", desc: "Trips are led by trek leaders familiar with the Garhwal region and its trails." },
  { icon: HeartHandshake, title: "Carefully Planned Itineraries", desc: "Each day is paced to balance travel, rest, and the experience itself." },
  { icon: BedDouble, title: "Comfortable Accommodation", desc: "Cottage and camp stays selected for comfort at altitude, subject to availability." },
  { icon: Bus, title: "Reliable Transportation", desc: "Delhi pickup and drop in a comfortable Tempo Traveller for the full journey." },
  { icon: Users2, title: "Small, Managed Groups", desc: "Group sizes are kept manageable so every traveller gets attention on the trail." },
  { icon: ShieldCheck, title: "Safety-First Approach", desc: "Itineraries may be adjusted by trip leaders when weather or terrain requires it." },
];

export function WhyHimaroh() {
  return (
    <section className="bg-[#F7F7F7] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-navy sm:text-4xl">Why Himaroh?</h2>
          <div className="heading-bar-center" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <Icon className="mx-auto h-8 w-8 text-gold" strokeWidth={1.5} />
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
