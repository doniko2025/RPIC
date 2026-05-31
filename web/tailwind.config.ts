import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette rouge RPIC
        brand: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // Palette neutre
        surface: {
          50:  "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        "slide-in":    "slideIn .4s cubic-bezier(.22,1,.36,1)",
        "fade-in":     "fadeIn .3s ease",
        "slide-up":    "slideUp .4s cubic-bezier(.22,1,.36,1)",
      },
      keyframes: {
        slideIn:  { from:{ transform:"translateX(-16px)", opacity:"0" }, to:{ transform:"translateX(0)", opacity:"1" } },
        fadeIn:   { from:{ opacity:"0" }, to:{ opacity:"1" } },
        slideUp:  { from:{ transform:"translateY(16px)", opacity:"0" }, to:{ transform:"translateY(0)", opacity:"1" } },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
        "card-glass":     "linear-gradient(135deg, rgba(255,255,255,.8) 0%, rgba(255,255,255,.4) 100%)",
      },
      boxShadow: {
        "card":    "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)",
        "card-md": "0 4px 24px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.06)",
        "brand":   "0 4px 16px rgba(220,38,38,.24)",
      },
    },
  },
  plugins: [],
};
export default config;
