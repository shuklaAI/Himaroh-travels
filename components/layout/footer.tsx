import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants";
import { getSiteSettings } from "@/lib/queries/settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const waHref = `https://wa.me/${settings.whatsappNumber}`;

  return (
    <footer>
      <div className="bg-charcoal py-8 text-center text-ivory">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 px-6">
          {FOOTER_LINKS.policies.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold hover:text-gold">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 px-6">
          {FOOTER_LINKS.company.map((l) => (
            <Link key={l.href} href={l.href} className="text-xs font-semibold uppercase tracking-wide text-gold/90 hover:text-gold">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white py-10 text-center">
        <div className="mb-6 flex justify-center gap-3">
          <a
            href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-gold hover:text-navy"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-gold hover:text-navy"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>

        <p className="text-sm text-navy/70">{settings.email}</p>
        <p className="mt-1 text-sm text-navy/70">{settings.phone}</p>
      </div>

      <div className="bg-navy py-4 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
      </div>
    </footer>
  );
}
