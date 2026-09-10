import { MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/settings";

export async function WhatsAppButton({
  packageName,
  date,
}: {
  packageName?: string;
  date?: string;
}) {
  const settings = await getSiteSettings();
  const text = packageName
    ? `Hi Himaroh Travels, I am interested in ${packageName}${date ? ` for ${date}` : ""}.`
    : "Hi Himaroh Travels, I'd like to know more about your upcoming trips.";

  const href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Himaroh Travels on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 md:bottom-8 md:right-8"
    >
      <MessageCircle className="h-7 w-7" fill="white" strokeWidth={0} />
    </a>
  );
}
