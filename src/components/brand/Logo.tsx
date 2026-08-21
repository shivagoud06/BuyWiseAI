import React from "react";

interface LogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

export function Logo({
  variant = "full",
  size = "md",
  className = "",
  showTagline = false,
}: LogoProps) {
  const markDimensions = {
    sm: "h-7 w-7",
    md: "h-8 w-8 sm:h-9 sm:w-9",
    lg: "h-11 w-11",
  }[size];

  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Unique Geometric B Mark */}
      <div className={`relative shrink-0 rounded-xl overflow-hidden shadow-xs transition-transform ${markDimensions}`}>
        <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
          <defs>
            <linearGradient id="bw-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#0EA5A4" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
            <linearGradient id="bw-accent-comp" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#bw-grad-comp)" />
          <path d="M14 12h11c3.866 0 7 3.134 7 7 0 2.22-1.035 4.198-2.65 5.48C31.543 25.88 33 28.27 33 31c0 4.418-3.582 8-8 8H14V12z" fill="white" fillOpacity="0.2" />
          <path d="M16 14h8.5c2.761 0 5 2.239 5 5s-2.239 5-5 5H16V14z" fill="white" />
          <path d="M16 24h9.5c3.314 0 6 2.686 6 6s-2.686 6-6 6H16V24z" fill="url(#bw-accent-comp)" />
          <path d="M37 7l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="#FEF08A" />
        </svg>
      </div>

      {/* Single-line Brand Name: [Logo] BuyWise AI */}
      {variant === "full" && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-[#111827] font-sans ${textSizes}`}>
            BuyWise
          </span>
          <span className="rounded-md bg-[#E6FFFE] border border-[#99F6F3] px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-[#0EA5A4] uppercase tracking-wide">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
