import { Star } from "lucide-react";
import { getPublishedTestimonials } from "@/lib/queries/packages";

export async function Testimonials() {
  const testimonials = await getPublishedTestimonials(6);

  // Section 21: if there are no real testimonials, hide the section entirely
  // rather than showing an empty shell or inventing content.
  if (testimonials.length === 0) return null;

  return (
    <section className="section">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-navy/50">Testimonial &amp; Reviews</p>
        <h2 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">What Travellers Say</h2>
        <div className="heading-bar-center" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-2xl border border-navy/10 bg-white p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy/70">{t.content}</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy">{t.customerName}</p>
                {t.location && <p className="text-xs text-navy/50">{t.location}</p>}
              </div>
              {t.isVerified && (
                <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-gold-DEFAULT">
                  Verified booking
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
