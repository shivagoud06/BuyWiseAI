import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // BuyWise Centralized Design Token Color System (Phase 43)
        buywise: {
          teal: "#0EA5A4",
          "teal-dark": "#087F7E",
          "teal-light": "#E6FFFE",
          bg: "#F5F7FA",
          card: "#FFFFFF",
          "section-alt": "#F8FAFC",
          "text-primary": "#111827",
          "text-secondary": "#64748B",
          "text-muted": "#94A3B8",
          border: "#E2E8F0",
          "border-hover": "#CBD5E1",
          success: "#16A34A",
          "success-light": "#DCFCE7",
          warning: "#F59E0B",
          "warning-light": "#FEF3C7",
          error: "#DC2626",
          "error-light": "#FEE2E2",
          info: "#2563EB",
          "info-light": "#DBEAFE",
          rating: "#F59E0B",
          discount: "#16A34A",
        },
        brand: {
          50: "#E6FFFE",
          100: "#CCFBF9",
          200: "#99F6F3",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#0EA5A4", // Primary BuyWise Teal
          600: "#087F7E", // Darker Primary Teal
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          950: "#042F2E",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        shop: {
          bg: "#F5F7FA",
          card: "#FFFFFF",
          text: "#111827",
          muted: "#64748B",
          border: "#E2E8F0",
          "border-focus": "#0EA5A4",
          "price-main": "#111827",
          "discount-badge": "#DCFCE7",
          "discount-text": "#16A34A",
          "rating-star": "#F59E0B",
        },
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 164, 0.12), rgba(255, 255, 255, 0))",
      },
      boxShadow: {
        "subtle-card": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-light": "0 1px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
        "modal-soft": "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
