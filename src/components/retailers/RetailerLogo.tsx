"use client";

import React from "react";
import { RetailerId } from "@/types";
import { Store } from "lucide-react";

export interface RetailerLogoProps {
  retailerId: RetailerId | string;
  retailerName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders verified, crisp vector brand logos for supported commerce platforms.
 * Maintains consistent aspect ratio and container dimensions to prevent layout shifts.
 */
export function RetailerLogo({
  retailerId,
  retailerName,
  size = "md",
  className = "",
}: RetailerLogoProps) {
  const normalizedId = (retailerId || "").toLowerCase().replace(/[^a-z0-9-]/g, "");

  const sizeClasses = {
    sm: "h-7 w-7 min-w-[1.75rem] rounded-lg p-1 text-[10px]",
    md: "h-11 w-11 min-w-[2.75rem] rounded-xl p-1.5 text-xs",
    lg: "h-14 w-14 min-w-[3.5rem] rounded-2xl p-2 text-sm",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // 1. Amazon (India / US / UK)
  if (normalizedId.includes("amazon")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#131921] border border-[#232f3e] shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 'a' glyph */}
          <path
            d="M8.2 13.5c-1.5 0-2.4-.8-2.4-2.1 0-1.8 1.4-2.5 3.8-2.5v.7c0 1.2-.5 3.9-1.4 3.9zm3.8 1.4v-5c0-2.3-1.6-3.2-4.1-3.2-2.3 0-4.1.9-4.7 2.1l1.8 1c.3-.6 1.3-1.2 2.7-1.2 1.5 0 2.2.6 2.2 1.8v.5c-3.4.1-5.7 1.1-5.7 3.5 0 2.1 1.4 3.3 3.4 3.3 1.8 0 3.2-.8 3.8-2v1.8h2.6c-.1-.7-.2-1.7-.2-2.6z"
            fill="#FFFFFF"
          />
          {/* Orange Smile Arrow */}
          <path
            d="M21.5 17.5C18.2 19.8 13.5 21 8.5 20.3c-3.7-.5-7-2.1-9.5-4.4-.3-.3-.1-.6.3-.4 2.8 1.7 6.4 2.7 10.3 2.7 4.3 0 8.4-1.2 11.4-3.3.4-.3.8.1.5.6z"
            fill="#FF9900"
          />
          <path
            d="M22.8 15.8c-.3-.4-2-.2-3-.1-.3 0-.3-.3-.1-.5 1.5-1.1 3.5-.8 3.8-.4.3.4-.3 2.4-1.6 3.7-.2.2-.4.1-.3-.2.3-.9 1.5-2.1 1.2-2.5z"
            fill="#FF9900"
          />
        </svg>
      </div>
    );
  }

  // 2. Flipkart
  if (normalizedId.includes("flipkart")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#2874F0] border border-[#1e5bc6] shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yellow Shopping Bag Handle & Body */}
          <path
            d="M6 7.5V6a6 6 0 0 1 12 0v1.5h1.5a1.5 1.5 0 0 1 1.5 1.5l-1.2 11.5a2 2 0 0 1-2 1.5H6.2a2 2 0 0 1-2-1.5L3 9a1.5 1.5 0 0 1 1.5-1.5H6zm2 0h8V6a4 4 0 0 0-8 0v1.5z"
            fill="#FFE500"
          />
          {/* Flipkart 'f' cut */}
          <path
            d="M14.2 9.5h-2.5c-.8 0-1.2.4-1.2 1.2v1.5h3.2l-.4 2.2h-2.8v5.5H8v-5.5H6.5v-2.2H8v-1.8C8 8.4 9.1 7.2 11.2 7.2h3v2.3z"
            fill="#2874F0"
          />
        </svg>
      </div>
    );
  }

  // 3. Croma
  if (normalizedId.includes("croma")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#001E2B] border border-[#00B5B8]/30 shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Croma Teal Aperture / Circle Logo */}
          <circle cx="12" cy="12" r="8.5" stroke="#00B5B8" strokeWidth="2.8" strokeDasharray="38 12" />
          <circle cx="12" cy="12" r="3.2" fill="#00B5B8" />
        </svg>
      </div>
    );
  }

  // 4. Reliance Digital
  if (normalizedId.includes("reliance") || normalizedId.includes("reliancedigital")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#E42529] border border-[#c41b1f] shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Reliance Digital 'd' geometry */}
          <rect x="4" y="5" width="4" height="14" rx="1" fill="#FFFFFF" />
          <path
            d="M10 5h4.5a7 7 0 0 1 7 7v0a7 7 0 0 1-7 7H10V5zm4 10.5a3.5 3.5 0 0 0 3.5-3.5v0a3.5 3.5 0 0 0-3.5-3.5H14v7z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  // 5. Vijay Sales
  if (normalizedId.includes("vijay") || normalizedId.includes("vijaysales")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#D61F26] border border-[#b2151b] shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* VS Stylized Monogram */}
          <path
            d="M4 6h3.5l3 8.5 3-8.5H17l-4.8 12h-3.4L4 6z"
            fill="#FFFFFF"
          />
          <path
            d="M16 11.5c1.2-.5 2.5-.2 3.2.4.6.6.8 1.4.8 2.2 0 2.2-1.8 3.9-4 3.9h-1.5v-2h1.5c1.1 0 2-.8 2-1.9 0-.8-.6-1.4-1.4-1.5-.9-.1-1.8.3-2.1.9h-2c.3-1.2 1.8-2 3.5-2z"
            fill="#FFE500"
          />
        </svg>
      </div>
    );
  }

  // 6. eBay (Global / US / UK / DE)
  if (normalizedId.includes("ebay")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#FFFFFF] border border-surface-700 shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg
          viewBox="0 0 36 16"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* e - Red */}
          <path
            d="M5.5 8.2c0-1.8 1.1-2.9 2.7-2.9 1.5 0 2.5 1 2.5 2.6v.7H4.2c.1 1.6 1.2 2.6 2.8 2.6 1 0 1.9-.4 2.3-1.1h1.8C10.4 11.6 8.8 13 6.9 13 4.1 13 2.3 11 2.3 8.2zm2.6-1.5c-.8 0-1.4.5-1.6 1.3h3.1c-.1-.8-.7-1.3-1.5-1.3z"
            fill="#E53238"
          />
          {/* b - Blue */}
          <path
            d="M12.4 2.5h1.9v3.8c.6-.8 1.5-1.3 2.6-1.3 2.3 0 4 1.8 4 4.1 0 2.4-1.7 4.1-4 4.1-1.1 0-2-.5-2.6-1.3v1.1h-1.9V2.5zm4.2 4.2c-1.4 0-2.4 1-2.4 2.4s1 2.4 2.4 2.4 2.4-1 2.4-2.4-1-2.4-2.4-2.4z"
            fill="#0064D2"
          />
          {/* a - Yellow */}
          <path
            d="M24.8 7.3c-1.8 0-2.8.8-2.8 2 0 1.1.9 1.8 2.2 1.8 1.4 0 2.4-.9 2.4-2.1v-.6c-.6-.7-1.1-1.1-1.8-1.1zm3.8 2.4v3.1h-1.8v-1.1c-.6.8-1.6 1.3-2.7 1.3-2.1 0-3.6-1.2-3.6-3 0-2.1 1.7-3.2 4.4-3.2h1.9v-.4c0-1-.8-1.6-2.1-1.6-1 0-1.8.4-2.2 1.1h-1.8c.5-1.5 2-2.4 4.1-2.4 2.4 0 3.9 1.2 3.9 3.2v3z"
            fill="#F5AF02"
          />
          {/* y - Green */}
          <path
            d="M30.6 5.3h2l2.3 5.7 2.2-5.7h2l-3.4 8.2c-.8 2-2 2.8-3.7 2.8-.5 0-1-.1-1.4-.2v-1.5c.3.1.6.1.9.1 1 0 1.6-.4 2-1.4l.4-.9-3.3-7.1z"
            fill="#86B817"
          />
        </svg>
      </div>
    );
  }

  // 7. Best Buy (US / CA)
  if (normalizedId.includes("bestbuy") || normalizedId.includes("best-buy")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#0046BE] border border-[#003899] shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <div className="relative flex items-center justify-center font-black text-white text-[10px] tracking-tighter">
          <span>BEST</span>
          <span className="text-[#FFE500] ml-0.5">BUY</span>
        </div>
      </div>
    );
  }

  // 8. Official Brand Stores (Lenovo, HP, ASUS, Apple, Dell)
  if (normalizedId.includes("lenovo")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#E2231A] border border-[#c11a12] shadow-sm overflow-hidden font-black text-white text-[9px] tracking-wider ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <span>LENOVO</span>
      </div>
    );
  }

  if (normalizedId.includes("hp")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#0096D6] rounded-full border border-[#007cb3] shadow-sm overflow-hidden font-bold italic text-white text-xs ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <span>hp</span>
      </div>
    );
  }

  if (normalizedId.includes("asus")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#000000] border border-surface-700 shadow-sm overflow-hidden font-black text-white text-[9px] tracking-widest ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <span>ASUS</span>
      </div>
    );
  }

  if (normalizedId.includes("apple")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#1A1A1A] border border-surface-700 shadow-sm overflow-hidden ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="#FFFFFF">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.37-.58.67-1.08 1.76-.94 2.81 1.02.08 2.04-.5 2.67-1.27z" />
        </svg>
      </div>
    );
  }

  if (normalizedId.includes("dell")) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-[#007DB8] rounded-full border border-[#006699] shadow-sm overflow-hidden font-black text-white text-xs ${currentSizeClass} ${className}`}
        title={`${retailerName} logo`}
        role="img"
        aria-label={`${retailerName} logo`}
      >
        <span>DELL</span>
      </div>
    );
  }

  // Generic Fallback: Clean branded badge with Store icon and retailer initial/name
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-surface-900 border border-surface-750 text-surface-200 font-bold ${currentSizeClass} ${className}`}
      title={`${retailerName} logo`}
      role="img"
      aria-label={`${retailerName} logo`}
    >
      <Store className="h-4 w-4 text-brand-400" />
    </div>
  );
}
