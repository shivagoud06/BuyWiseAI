import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompareProvider } from "@/context/CompareContext";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://buywise.ai"),
  title: {
    default: "BuyWise AI — AI-Powered Laptop Buying Assistant",
    template: "%s | BuyWise AI",
  },
  description:
    "Don't just buy. BuyWise. Get intelligent, unbiased laptop recommendations, spec comparisons, and clear Buy/Wait/Skip verdicts in Indian Rupees (INR).",
  keywords: [
    "laptop buying guide india",
    "best laptop for programming under 60000",
    "laptop comparison tool india",
    "gaming laptop inr",
    "BuyWise AI",
    "AI laptop recommendations",
  ],
  authors: [{ name: "BuyWise AI Team" }],
  openGraph: {
    title: "BuyWise AI — Intelligent Laptop Buying Assistant",
    description:
      "Find the perfect laptop for your budget and workload with INR pricing and unbiased comparisons.",
    type: "website",
    locale: "en_IN",
    siteName: "BuyWise AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyWise AI — Intelligent Laptop Buying Assistant",
    description:
      "Find the perfect laptop for your budget and workload with INR pricing and unbiased comparisons.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#060b13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F5F7FA] text-[#111827] flex flex-col font-sans selection:bg-brand-500/20 selection:text-brand-800">
        <CompareProvider>
          <NotificationPermissionBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}
