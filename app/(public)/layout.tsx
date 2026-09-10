import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { SkipLink } from "@/components/layout/skip-link";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <SkipLink />
      <Navbar phone={settings.phone} />
      <main id="main-content" className="min-h-screen pt-[76px]">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
