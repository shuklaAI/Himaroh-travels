import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries/settings";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Himaroh Travels — phone, email, WhatsApp, and a contact form.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const waHref = `https://wa.me/${settings.whatsappNumber}`;

  return (
    <div>
      <section
        className="relative flex h-[45vh] min-h-[320px] items-center justify-center bg-cover bg-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-navy/50" />
        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-bold text-ivory sm:text-5xl">Contact Us</h1>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:bg-gold-light">
              Call Now
            </a>
            <a href={waHref} target="_blank" rel="noreferrer" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:bg-gold-light">
              WhatsApp
            </a>
            <a href="#enquiry" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:bg-gold-light">
              Send Enquiry
            </a>
          </div>
        </div>
      </section>

      <section id="enquiry" className="section grid gap-12 lg:grid-cols-2 lg:items-center">
        <div
          className="hidden h-64 w-full rounded-3xl opacity-70 lg:block"
          style={{ backgroundImage: "radial-gradient(circle, rgba(10,10,10,0.5) 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}
          aria-hidden
        />

        <div>
          <h2 className="text-2xl font-bold uppercase text-navy sm:text-3xl">
            Not Sure What To Do? <br />
            We'll Give You a <span className="text-gold">Call Back</span>
          </h2>
          <div className="mt-8">
            <ContactForm />
          </div>
          <div className="mt-8 space-y-1 text-sm text-navy/70">
            <p className="font-bold">Contact Number: {settings.phone}</p>
            <p>{settings.email}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
