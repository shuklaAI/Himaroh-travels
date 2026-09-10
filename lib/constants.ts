export const NAV_LINKS = [
  { label: "Trips", href: "/trips" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: "About Himaroh", href: "/about" },
    { label: "All Trips", href: "/trips" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  policies: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "FAQ", href: "/faq" },
  ],
} as const;

// Fallback values only — the authoritative source is the SiteSetting table,
// editable from /admin/settings without a code change.
export const SITE_DEFAULTS = {
  companyName: "Himaroh Travels",
  phone: "+91 85273 93969",
  email: "info@himarohtravels.com",
  instagram: "https://instagram.com/himaroh.travels",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918527393969",
};

export const TRUST_BAR_ITEMS = [
  "Experienced Trek Leaders",
  "Comfortable Stays",
  "Group Travel",
  "Vegetarian Meals",
  "Delhi Pickup & Drop",
  "Trek Support",
];
