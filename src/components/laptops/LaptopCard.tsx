"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Laptop } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCompare } from "@/context/CompareContext";
import {
  Cpu,
  Monitor,
  Layers,
  Star,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";

import { getLaptopImage, getLaptopImageAlt, DEFAULT_LAPTOP_FALLBACK_IMAGE } from "@/lib/laptopImage";

interface LaptopCardProps {
  laptop: Laptop;
  fallbackExplanation?: string;
}

export function LaptopCard({ laptop, fallbackExplanation }: LaptopCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isComparing, toggleLaptop } = useCompare();
  const compared = isComparing(laptop.id);

  const discount =
    laptop.originalPrice && laptop.price
      ? Math.round(((laptop.originalPrice - laptop.price) / laptop.originalPrice) * 100)
      : 0;

  const getVerdictConfig = () => {
    switch (laptop.verdict) {
      case "BUY":
        return { icon: CheckCircle2, label: "BUY", cls: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]" };
      case "WAIT":
        return { icon: Clock, label: "WAIT", cls: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]" };
      case "SKIP":
        return { icon: AlertTriangle, label: "SKIP", cls: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]" };
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[#16A34A] bg-[#DCFCE7] border-[#BBF7D0]";
    if (score >= 80) return "text-[#0EA5A4] bg-[#E6FFFE] border-[#99F6F3]";
    if (score >= 70) return "text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]";
    return "text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]";
  };

  const shortProcessor = laptop.processor.split("(")[0].trim();
  const verdictConfig = getVerdictConfig();
  const productImage = getLaptopImage(laptop);

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-[#E2E8F0] shadow-card-light hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full">

      {/* ── Fixed Image Area (Standardized 180px Desktop / 160px Tablet / 150px Mobile) ── */}
      <Link
        href={`/laptops/${laptop.id}`}
        className="relative flex items-center justify-center w-full h-[150px] sm:h-[160px] md:h-[180px] bg-white overflow-hidden border-b border-[#E2E8F0] p-3"
        tabIndex={0}
      >
        <img
          src={productImage}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_LAPTOP_FALLBACK_IMAGE;
          }}
          alt={getLaptopImageAlt(laptop)}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-contain object-center transition-all duration-300 group-hover:scale-[1.03] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse">
            <Cpu className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {/* Brand pill + badge top-left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="bg-white/95 backdrop-blur-sm text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E2E8F0] shadow-xs">
            {laptop.brand}
          </span>
          {laptop.badge && (
            <span className="bg-[#0EA5A4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {laptop.badge}
            </span>
          )}
        </div>

        {/* BuyWise score top-right */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold shadow-xs ${getScoreColor(laptop.buyWiseScore)}`}
            title="BuyWise AI Spec-to-Value Score"
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>{laptop.buyWiseScore}</span>
          </div>
        </div>
      </Link>

      {/* ── Content Area ── */}
      <div className="flex flex-col flex-1 p-3">

        {/* Rating + Verdict row */}
        <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[1.25rem]">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B] shrink-0" />
            <span className="font-bold text-[#111827]">{laptop.rating.toFixed(1)}</span>
            <span className="text-[#64748B] text-[11px]">
              ({laptop.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>
          {verdictConfig && (
            <div className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${verdictConfig.cls}`}>
              <verdictConfig.icon className="h-2.5 w-2.5 shrink-0" />
              {verdictConfig.label}
            </div>
          )}
        </div>

        {/* Product name — Standardized 2-line height for aligned grid rows */}
        <Link href={`/laptops/${laptop.id}`}>
          <h3 className="text-sm font-semibold text-[#111827] leading-snug group-hover:text-[#0EA5A4] transition-colors line-clamp-2 h-[2.6rem] mb-2">
            {laptop.name}
          </h3>
        </Link>

        {/* Key Specs — compact inline pills with aligned minimum height */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-[2.5rem] content-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#475569] bg-slate-100 border border-[#E2E8F0] rounded-md px-1.5 py-0.5 truncate max-w-full" title={laptop.processor}>
            <Cpu className="h-2.5 w-2.5 shrink-0 text-[#0EA5A4]" />
            <span className="truncate">{shortProcessor.split(" ").slice(0, 3).join(" ")}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#475569] bg-slate-100 border border-[#E2E8F0] rounded-md px-1.5 py-0.5">
            <Layers className="h-2.5 w-2.5 shrink-0 text-cyan-600" />
            {laptop.ram.split(" ")[0]} • {laptop.storage.split(" ")[0]}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#475569] bg-slate-100 border border-[#E2E8F0] rounded-md px-1.5 py-0.5 truncate max-w-full" title={laptop.display}>
            <Monitor className="h-2.5 w-2.5 shrink-0 text-indigo-500" />
            <span className="truncate">{laptop.display.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}</span>
          </span>
          {laptop.gpu && laptop.gpu !== "Integrated" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#475569] bg-slate-100 border border-[#E2E8F0] rounded-md px-1.5 py-0.5 truncate max-w-full" title={laptop.gpu}>
              <Zap className="h-2.5 w-2.5 shrink-0 text-purple-500" />
              <span className="truncate">{laptop.gpu.replace("NVIDIA GeForce ", "").replace("AMD Radeon ", "")}</span>
            </span>
          )}
        </div>

        {/* Smart alternative explanation */}
        {fallbackExplanation && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-medium mb-2">
            <Sparkles className="h-2.5 w-2.5 text-amber-500 shrink-0" />
            <span className="truncate">{fallbackExplanation}</span>
          </div>
        )}

        {/* Spacer to push price+actions to bottom */}
        <div className="flex-1" />

        {/* ── Price Area ── */}
        <div className="pt-2 border-t border-[#E2E8F0] mt-2">
          {laptop.isUpcoming ? (
            <div className="mb-2 min-h-[2.5rem]">
              <div className="text-sm font-bold text-amber-600">
                Expected {laptop.expectedLaunch || "Soon"}
              </div>
              <div className="text-[10px] text-[#64748B]">Official launch pending</div>
            </div>
          ) : laptop.price && laptop.price > 0 ? (
            <div className="flex items-end justify-between gap-1 mb-2 min-h-[2.5rem]">
              <div>
                <div className="text-lg font-bold text-[#111827] tracking-tight leading-none">
                  {formatINR(laptop.price)}
                </div>
                {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-[#94A3B8] line-through font-normal">
                      {formatINR(laptop.originalPrice)}
                    </span>
                    <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-1.5 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-medium text-right leading-tight">
                Catalog<br />Ref Price
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-[#64748B] mb-2 min-h-[2.5rem]">Price unavailable</div>
          )}

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => toggleLaptop(laptop)}
              className={`flex items-center justify-center gap-1 text-xs font-semibold py-1.5 px-2 rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4] ${
                compared
                  ? "bg-[#0EA5A4] text-white border-[#0EA5A4] hover:bg-[#087F7E]"
                  : "bg-white text-[#111827] border-[#E2E8F0] hover:border-[#0EA5A4] hover:text-[#0EA5A4] hover:bg-[#E6FFFE]"
              }`}
              aria-label={compared ? `Remove ${laptop.name} from compare` : `Compare ${laptop.name}`}
            >
              {compared ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Compare</span>
                </>
              )}
            </button>

            <Link href={`/laptops/${laptop.id}`} className="w-full">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-lg bg-[#0EA5A4] text-white hover:bg-[#087F7E] transition-all duration-150 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]"
                aria-label={`View details for ${laptop.name}`}
              >
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
