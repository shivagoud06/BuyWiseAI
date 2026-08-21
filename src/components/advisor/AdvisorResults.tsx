"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RecommendationResult, AdvisorInput, RetailerOffer, CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getBestRetailerOffer, handleRetailerClick } from "@/lib/retailers";
import { useCompare } from "@/context/CompareContext";
import {
  Trophy,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Check,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Battery,
  Store,
  ExternalLink,
  SlidersHorizontal,
  Info,
  Globe,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WhereToBuy } from "@/components/laptops/WhereToBuy";
import { calculateEffectivePrice } from "@/services/retailers/offers";

interface AdvisorResultsProps {
  results: RecommendationResult[];
  input: AdvisorInput;
  isRelaxed: boolean;
  relaxedReason?: string;
  isUnsupportedMarket?: boolean;
  unsupportedMessage?: string;
  isAmbiguousCurrency?: boolean;
  onReset: () => void;
}

type AdvisorSortOption = "match" | "price-asc" | "score-desc" | "value-desc";

export function AdvisorResults({
  results,
  input,
  isRelaxed,
  relaxedReason,
  isUnsupportedMarket,
  unsupportedMessage,
  isAmbiguousCurrency,
  onReset,
}: AdvisorResultsProps) {
  const { isComparing, toggleLaptop } = useCompare();
  const [sortOption, setSortOption] = useState<AdvisorSortOption>("match");

  const activeCurrency: CurrencyCode = input.currency || "INR";

  // Sorted Results
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      const priceA = a.displayPrice ?? a.laptop.price ?? 999999;
      const priceB = b.displayPrice ?? b.laptop.price ?? 999999;
      switch (sortOption) {
        case "price-asc":
          return priceA - priceB;
        case "score-desc":
          return b.laptop.buyWiseScore - a.laptop.buyWiseScore;
        case "value-desc":
          return b.laptop.scoreBreakdown.priceValue - a.laptop.scoreBreakdown.priceValue;
        case "match":
        default:
          return b.matchPercentage - a.matchPercentage;
      }
    });
  }, [results, sortOption]);

  const topMatches = sortedResults.slice(0, 3);
  const remainingMatches = sortedResults.slice(3);

  const getBudgetLabel = (b: string, cur: CurrencyCode) => {
    if (cur === "USD") {
      switch (b) {
        case "under-40k": return "Under $500";
        case "40k-50k": return "$500 – $750";
        case "50k-75k": return "$750 – $1,000";
        case "75k-100k": return "$1,000 – $1,400";
        case "above-100k": return "Above $1,400";
      }
    } else if (cur === "GBP") {
      switch (b) {
        case "under-40k": return "Under £450";
        case "40k-50k": return "£450 – £650";
        case "50k-75k": return "£650 – £900";
        case "75k-100k": return "£900 – £1,200";
        case "above-100k": return "Above £1,200";
      }
    } else if (cur === "EUR") {
      switch (b) {
        case "under-40k": return "Under €500";
        case "40k-50k": return "€500 – €750";
        case "50k-75k": return "€750 – €1,000";
        case "75k-100k": return "€1,000 – €1,500";
        case "above-100k": return "Above €1,500";
      }
    }

    // Default INR
    switch (b) {
      case "under-40k": return "Under ₹40,000";
      case "40k-50k": return "₹40,000 – ₹50,000";
      case "50k-75k": return "₹50,000 – ₹75,000";
      case "75k-100k": return "₹75,000 – ₹1,00,000";
      case "above-100k": return "Above ₹1,00,000";
      default: return b;
    }
  };

  const getRankTheme = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: Trophy,
          label: "🏆 BEST MATCH",
          badgeClass: "bg-teal-600 text-white font-extrabold shadow-sm",
          borderClass: "border-teal-300 bg-white ring-1 ring-teal-500/20 shadow-md",
          matchColor: "text-teal-700 border-teal-200 bg-teal-50",
        };
      case 2:
        return {
          icon: Sparkles,
          label: "🥈 STRONG CONTENDER",
          badgeClass: "bg-cyan-600 text-white font-bold",
          borderClass: "border-[#E2E8F0] bg-white shadow-sm",
          matchColor: "text-cyan-700 border-cyan-200 bg-cyan-50",
        };
      case 3:
        return {
          icon: Sparkles,
          label: "🥉 GREAT ALTERNATIVE",
          badgeClass: "bg-slate-700 text-white font-bold",
          borderClass: "border-[#E2E8F0] bg-white shadow-sm",
          matchColor: "text-teal-700 border-teal-200 bg-teal-50",
        };
      default:
        return {
          icon: Sparkles,
          label: `MATCH #${rank}`,
          badgeClass: "bg-slate-100 text-[#334155] font-semibold border border-[#CBD5E1]",
          borderClass: "border-[#E2E8F0] bg-white shadow-sm",
          matchColor: "text-[#475569] border-[#E2E8F0] bg-slate-50",
        };
    }
  };

  // If Unsupported Market
  if (isUnsupportedMarket) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8 animate-fadeIn text-center">
        <div className="p-8 sm:p-10 rounded-3xl border border-[#E2E8F0] bg-white shadow-xl space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
            BuyWise doesn&apos;t have verified laptop pricing for this market yet.
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-lg mx-auto">
            {unsupportedMessage ||
              "We currently have verified catalog coverage for India (₹ INR), the United States ($ USD), the United Kingdom (£ GBP), and Europe (€ EUR)."}
          </p>
          <div className="pt-3">
            <Button variant="primary" size="md" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span>Try a Different Search</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderRecommendationCard = (item: RecommendationResult, isTopThree: boolean) => {
    const { laptop, rank, matchPercentage, whyItMatches, potentialDrawback, displayPrice, displayCurrency, displayOffers } = item;
    const theme = getRankTheme(rank);
    const compared = isComparing(laptop.id);

    const priceToDisplay = displayPrice ?? laptop.price;
    const currencyToDisplay = displayCurrency ?? laptop.currency ?? activeCurrency;
    const offersToDisplay = displayOffers || laptop.offers || [];

    const bestOffer = offersToDisplay.find((o) => o.availability !== "out-of-stock");

    return (
      <div
        key={laptop.id}
        className={`p-5 sm:p-7 rounded-3xl border ${theme.borderClass} shadow-md transition-all space-y-5`}
      >
        {/* Card Top: Rank Badge, Brand, Price & BuyWise Match Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-xl text-xs ${theme.badgeClass}`}>
              {theme.label}
            </span>
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider">
              {laptop.brand}
            </span>
            {laptop.model && (
              <span className="text-[11px] text-[#94A3B8] font-mono">
                {laptop.model}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* BuyWise Match Score Pill */}
            <div className="flex flex-col items-end">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${theme.matchColor}`}
                title="How closely this laptop fits your preferences"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{matchPercentage}% Match</span>
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-0.5 hidden sm:inline">
                BuyWise Match
              </span>
            </div>

            {/* BuyWise Score */}
            <div className="text-xs text-[#64748B] font-semibold pl-3 border-l border-[#E2E8F0]">
              Score: <strong className="text-[#111827]">{laptop.buyWiseScore}</strong>/100
            </div>
          </div>
        </div>

        {/* Middle Section: Image (Left) + Details & Specs (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Product Image */}
          <div className="md:col-span-4 relative aspect-[16/11] rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] p-3 flex items-center justify-center shadow-xs">
            <img
              src={laptop.image}
              alt={laptop.name}
              className="h-full w-full object-contain"
            />
            <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#111827] border border-[#E2E8F0] shadow-xs">
              {laptop.brand}
            </div>
          </div>

          {/* Info & Reasoning */}
          <div className="md:col-span-8 space-y-3.5">
            <div>
              <Link href={`/laptops/${laptop.id}?from=advisor&use=${encodeURIComponent(input.primaryUse)}&budget=${encodeURIComponent(input.budget)}&match=${encodeURIComponent(whyItMatches.join('|'))}`}>
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] hover:text-teal-700 transition-colors font-sans">
                  {laptop.name}
                </h3>
              </Link>
              {laptop.fullName && (
                <p className="text-xs text-[#64748B] truncate mt-0.5">
                  {laptop.fullName}
                </p>
              )}
              {(() => {
                const liveDiscountOffers = (laptop.discountOffers || []).filter((o) => !o.isMock);
                const effectiveCalc = calculateEffectivePrice(priceToDisplay, liveDiscountOffers);
                const hasOfferDiscount = effectiveCalc.savings > 0;

                return (
                  <div className="space-y-1 mt-1.5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] block font-medium">Catalog Reference Price</span>
                        <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                          {formatCurrency(priceToDisplay, currencyToDisplay)}
                        </span>
                      </div>

                      {hasOfferDiscount && (
                        <div>
                          <span className="text-[10px] text-emerald-600 block font-medium">Pay Now (With Offers)</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-sans">
                            {formatCurrency(effectiveCalc.effectivePrice, currencyToDisplay)}
                          </span>
                        </div>
                      )}

                      {bestOffer && priceToDisplay && bestOffer.price < priceToDisplay && (
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg flex items-center gap-1 self-end mb-0.5 shadow-xs">
                          <Sparkles className="h-3 w-3 text-teal-600" />
                          Best Listed: {formatCurrency(bestOffer.price, currencyToDisplay)} ({bestOffer.retailerName})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">CPU</span>
                <span className="font-semibold text-[#111827] truncate block">{laptop.processor.split("(")[0]}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">RAM / Storage</span>
                <span className="font-semibold text-[#111827] truncate block">{laptop.ram.split(" ")[0]} / {laptop.storage.split(" ")[0]}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Graphics</span>
                <span className="font-semibold text-[#111827] truncate block">{laptop.gpu.replace("NVIDIA GeForce ", "")}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Display</span>
                <span className="font-semibold text-[#111827] truncate block">{laptop.display.split("(")[0]}</span>
              </div>
            </div>

            {/* Why it matches */}
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-1.5">
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Why it matches your requirements:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-emerald-950">
                {whyItMatches.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Near-Match Warning Note */}
            {item.warningNote && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-800 font-bold">Requirement Note:</strong>{" "}
                  <span>{item.warningNote}</span>
                </div>
              </div>
            )}

            {/* Potential drawback */}
            {potentialDrawback && !item.warningNote && (
              <div className="rounded-xl bg-slate-50 border border-[#E2E8F0] px-3 py-2 text-xs text-[#475569] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111827]">Trade-off:</strong>{" "}
                  <span>{potentialDrawback}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Direct "Where to Buy" Retailer Section inside Recommendation Card */}
        <div className="pt-3.5 border-t border-[#E2E8F0]">
          <WhereToBuy
            laptop={laptop}
            offers={offersToDisplay}
            targetCurrency={currencyToDisplay}
            compact={true}
          />
        </div>

        {/* Bottom Actions: Add to Compare & View Full Details */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3.5 border-t border-[#E2E8F0]">
          <Button
            type="button"
            variant={compared ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleLaptop(laptop)}
            className="w-full sm:w-auto text-xs font-semibold border-[#E2E8F0] bg-white text-[#111827]"
          >
            {compared ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Added to Compare</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 text-teal-600" />
                <span>Add to Compare</span>
              </>
            )}
          </Button>

          <Link href={`/laptops/${laptop.id}`} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <span>View Full Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Search Summary Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
            Your search:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#111827] font-semibold border border-[#E2E8F0]">
            {input.primaryUse}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#111827] font-semibold border border-[#E2E8F0]">
            {getBudgetLabel(input.budget, activeCurrency)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-semibold border border-teal-200 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Market: {activeCurrency}
          </span>
          {input.ramPreference !== "no-preference" && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#111827] font-semibold border border-[#E2E8F0]">
              {input.ramPreference} RAM
            </span>
          )}
          {input.priorities.map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#475569] font-medium border border-[#E2E8F0]">
              {p}
            </span>
          ))}
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Change Preferences</span>
        </button>
      </div>

      {/* Ambiguous Currency Notification (e.g. '$' without country) */}
      {isAmbiguousCurrency && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900 text-xs flex items-center gap-2.5 shadow-sm">
          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            Showing results for <strong>United States ($ USD)</strong>. If you are shopping in another country, simply include it in your request (e.g., &quot;in UK&quot; or &quot;in India&quot;).
          </span>
        </div>
      )}

      {/* Top Header with Total Match Count & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Your BuyWise Recommendations
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
            {sortedResults.length} {sortedResults.length === 1 ? "Laptop Matches" : "Laptops Match"} Your Requirements
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
            Personalized recommendations with verified {activeCurrency} pricing for {input.primaryUse.toLowerCase()} workloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          {sortedResults.length > 1 && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#64748B]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as AdvisorSortOption)}
                aria-label="Sort advisor results"
                className="bg-white border border-[#E2E8F0] text-xs font-semibold text-[#111827] rounded-xl px-3 py-1.5 focus:border-teal-500 focus:outline-none transition-all cursor-pointer shadow-xs"
              >
                <option value="match">Best Match (Default)</option>
                <option value="price-asc">Lowest Price</option>
                <option value="score-desc">Highest BuyWise Score</option>
                <option value="value-desc">Best Value Rating</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Relaxed / Partial Match Notification (If applicable) */}
      {isRelaxed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 text-sm space-y-1.5 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">No exact 100% matches found.</div>
            <p className="text-xs text-amber-800 leading-relaxed font-normal">
              {relaxedReason || "Some of your chosen constraints conflicted. We have provided the closest high-performing alternatives."}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Top Recommendations / Best Matches */}
      {topMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-teal-600" />
            <h3 className="text-base font-bold text-[#111827] font-sans uppercase tracking-wider text-xs">
              Top Recommendations ({topMatches.length})
            </h3>
          </div>

          <div className="space-y-6">
            {topMatches.map((item) => renderRecommendationCard(item, true))}
          </div>
        </div>
      )}

      {/* SECTION 2: More Matching Laptops (All remaining qualifying products) */}
      {remainingMatches.length > 0 && (
        <div className="pt-8 space-y-4 border-t border-[#E2E8F0]">
          <div>
            <h3 className="text-lg font-bold text-[#111827] font-sans">
              More Laptops Matching Your Requirements ({remainingMatches.length})
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Additional qualifying options from the catalog that fit your {input.primaryUse} and budget criteria in {activeCurrency}.
            </p>
          </div>

          <div className="space-y-6">
            {remainingMatches.map((item) => renderRecommendationCard(item, false))}
          </div>
        </div>
      )}
    </div>
  );
}
