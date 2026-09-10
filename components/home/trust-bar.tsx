import { ShieldCheck, Users, UtensilsCrossed, MapPin, LifeBuoy, Tent } from "lucide-react";
import { TRUST_BAR_ITEMS } from "@/lib/constants";

const ICONS = [Users, Tent, Users, UtensilsCrossed, MapPin, LifeBuoy];

export function TrustBar() {
  return (
    <section className="bg-navy py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 sm:grid-cols-3 sm:px-8 lg:grid-cols-6 lg:divide-x lg:divide-ivory/10 lg:px-10">
        {TRUST_BAR_ITEMS.map((item, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <div key={item} className="flex flex-col items-center gap-2 px-2 text-center">
              <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-ivory/90">{item}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
