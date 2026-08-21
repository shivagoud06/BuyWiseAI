"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface RetailerBrand {
  id: string;
  name: string;
  badgeBg?: string;
  renderLogo: () => React.ReactNode;
}

const RETAILER_BRANDS: RetailerBrand[] = [
  {
    id: "amazon",
    name: "Amazon",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="800" fill="#111827" letterSpacing="-0.5">
          amazon
        </text>
        <path d="M12 26C35 32 75 32 98 25" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
        <path d="M93 22L100 25L94 28" fill="#FF9900" stroke="#FF9900" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "flipkart",
    name: "Flipkart",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="24" height="24" rx="6" fill="#2874F0" />
        <path d="M9 10H19V22H15V15H12V22H9V10Z" fill="#FFE500" />
        <text x="32" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" fontStyle="italic" fill="#2874F0" letterSpacing="-0.2">
          Flipkart
        </text>
      </svg>
    ),
  },
  {
    id: "croma",
    name: "Croma",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="16" r="11" fill="#00B5B8" />
        <circle cx="15" cy="16" r="6" fill="#FFFFFF" />
        <text x="32" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="800" fill="#0EA5A4" letterSpacing="0.5">
          croma
        </text>
      </svg>
    ),
  },
  {
    id: "reliance-digital",
    name: "Reliance Digital",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 155 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="24" height="24" rx="5" fill="#E42529" />
        <path d="M14 8L16.5 13L22 13.8L18 17.7L19 23L14 20.4L9 23L10 17.7L6 13.8L11.5 13L14 8Z" fill="#FFFFFF" />
        <text x="32" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="900" fill="#E42529" letterSpacing="0.2">
          RELIANCE
        </text>
        <text x="32" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="700" fill="#0B5C9E" letterSpacing="1">
          DIGITAL
        </text>
      </svg>
    ),
  },
  {
    id: "vijay-sales",
    name: "Vijay Sales",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 135 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="130" height="22" rx="4" fill="#C8102E" />
        <text x="67" y="20" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="900" fill="#FFFFFF" letterSpacing="0.5">
          VIJAY SALES
        </text>
      </svg>
    ),
  },
  {
    id: "tata-cliq",
    name: "Tata CLiQ",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="24" height="24" rx="6" fill="#111827" />
        <circle cx="14" cy="16" r="6" stroke="#D11242" strokeWidth="2.5" />
        <circle cx="17" cy="13" r="2" fill="#D11242" />
        <text x="32" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="800" fill="#111827" letterSpacing="-0.2">
          TATA <tspan fill="#D11242">CLiQ</tspan>
        </text>
      </svg>
    ),
  },
  {
    id: "ebay",
    name: "eBay",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 85 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800" letterSpacing="-1">
          <tspan fill="#E53238">e</tspan>
          <tspan fill="#0064D2">b</tspan>
          <tspan fill="#F5AF02">a</tspan>
          <tspan fill="#86B817">y</tspan>
        </text>
      </svg>
    ),
  },
  {
    id: "myntra",
    name: "Myntra",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 22L11 10L16 18L21 10L28 22H22L18.5 15.5L16 19.5L13.5 15.5L10 22H4Z" fill="#F15B24" />
        <path d="M8 22L13.5 13L16 17.5L18.5 13L24 22H19.5L17 17.5L16 19L15 17.5L12.5 22H8Z" fill="#FF3F6C" />
        <text x="33" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="800" fill="#282C3F" letterSpacing="-0.2">
          Myntra
        </text>
      </svg>
    ),
  },
  {
    id: "ajio",
    name: "AJIO",
    renderLogo: () => (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="76" height="24" rx="6" fill="#1C2228" />
        <text x="40" y="21" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="#FFFFFF" letterSpacing="1.5">
          AJIO
        </text>
      </svg>
    ),
  },
];

interface RetailerLogoMarqueeProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function RetailerLogoMarquee({
  className = "",
  title = "Shop & Compare Across India's Top Retailers",
  subtitle = "BuyWise continuously monitors prices, verified discounts, and live availability across authorized sellers",
}: RetailerLogoMarqueeProps) {
  return (
    <section
      className={`relative w-full max-w-full overflow-hidden py-7 sm:py-9 bg-white border-y border-[#E2E8F0] shadow-2xs ${className}`}
      aria-label="Supported and monitored retailer partners"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6FFFE] text-[#0EA5A4] border border-[#99F6F3] text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Authorized Stores We Monitor</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#111827] font-sans tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl mx-auto mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Marquee Viewport with Left/Right Soft Edge Fades */}
      <div className="relative w-full max-w-full overflow-hidden flex items-center">
        {/* Left Fade Gradient */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 z-10 bg-gradient-to-r from-white via-white/80 to-transparent"
          aria-hidden="true"
        />

        {/* Right Fade Gradient */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 z-10 bg-gradient-to-l from-white via-white/80 to-transparent"
          aria-hidden="true"
        />

        {/* Continuous GPU-Animated Marquee Track */}
        <div className="animate-marquee flex items-center py-2">
          {/* TRACK 1: Accessible for screen readers */}
          <div className="flex items-center gap-8 sm:gap-14 pr-8 sm:pr-14 shrink-0">
            {RETAILER_BRANDS.map((brand) => (
              <div
                key={`track1-${brand.id}`}
                className="flex items-center justify-center px-4 py-2 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#0EA5A4]/40 hover:bg-[#E6FFFE]/30 hover:shadow-xs transition-all duration-200 cursor-default shrink-0"
                title={`${brand.name} — Monitored retailer on BuyWise`}
              >
                <span className="sr-only">{brand.name}</span>
                <div className="flex items-center justify-center">
                  {brand.renderLogo()}
                </div>
              </div>
            ))}
          </div>

          {/* TRACK 2: Duplicate for seamless infinite loop (Hidden from screen readers to prevent noise) */}
          <div
            className="flex items-center gap-8 sm:gap-14 pr-8 sm:pr-14 shrink-0"
            aria-hidden="true"
          >
            {RETAILER_BRANDS.map((brand) => (
              <div
                key={`track2-${brand.id}`}
                className="flex items-center justify-center px-4 py-2 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#0EA5A4]/40 hover:bg-[#E6FFFE]/30 hover:shadow-xs transition-all duration-200 cursor-default shrink-0"
              >
                <div className="flex items-center justify-center">
                  {brand.renderLogo()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
