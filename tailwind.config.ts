import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Kept the "navy" key so every existing text-navy/bg-navy/border-navy
        // class across the app automatically re-skins to the new black/charcoal
        // palette without touching every file individually.
        navy: {
          DEFAULT: "#0A0A0A",
          light: "#262626",
        },
        gold: {
          DEFAULT: "#F5A623",
          light: "#FFC94D",
          band: "#FCD667",
        },
        charcoal: "#262626",
        ivory: "#FFFFFF",
        ink: "#111827",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 1.6s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
