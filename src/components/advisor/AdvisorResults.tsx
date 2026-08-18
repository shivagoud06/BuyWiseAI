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
import { SAMPLE_OFFERS } from "@/data/mockOffers";

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
          badgeClass: "bg-brand-500 text-surface-950 font-extrabold shadow-md shadow-brand-500/20",
          borderClass: "border-brand-500/50 bg-gradient-to-br from-brand-950/30 via-surface-900/90 to-surface-950 shadow-brand-500/5",
          matchColor: "text-brand-300 border-brand-500/40 bg-brand-500/10",
        };
      case 2:
        return {
          icon: Sparkles,
          label: "🥈 STRONG CONTENDER",
          badgeClass: "bg-cyan-500 text-surface-950 font-bold",
          borderClass: "border-cyan-500/30 bg-surface-900/70",
          matchColor: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
        };
      case 3:
        return {
          icon: Sparkles,
          label: "🥉 GREAT ALTERNATIVE",
          badgeClass: "bg-surface-700 text-white font-bold",
          borderClass: "border-surface-750 bg-surface-900/60",
          matchColor: "text-teal-300 border-teal-500/40 bg-teal-500/10",
        };
      default:
        return {
          icon: Sparkles,
          label: `MATCH #${rank}`,
          badgeClass: "bg-surface-800 text-surface-200 font-semibold border border-surface-700",
          borderClass: "border-surface-800 bg-surface-900/50",
          matchColor: "text-surface-300 border-surface-700 bg-surface-800/40",
        };
    }
  };

  const renderRetailerButton = (offer: RetailerOffer, laptopId: string, laptopName: string) => {
    // 1. Out of stock
    if (offer.availability === "out-of-stock") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="w-full text-[11px] py-1.5 font-semibold shrink-0 border-surface-800 text-surface-500 opacity-60 cursor-not-allowed justify-center"
        >
          <span>Out of Stock</span>
        </Button>
      );
    }

    // 2. Affiliate URL available
    if (offer.affiliateUrl && offer.affiliateUrl.trim().length > 0) {
      return (
        <a
          href={offer.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            handleRetailerClick({
              productId: laptopId,
              productName: laptopName,
              retailerId: offer.retailerId,
              retailerName: offer.retailerName,
              price: offer.price,
              targetUrl: offer.affiliateUrl!,
              clickType: "affiliate",
              timestamp: new Date().toISOString(),
              source: "advisor",
            })
          }
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-surface-950 bg-brand-500 hover:bg-brand-400 shadow-sm transition-all shrink-0"
        >
          <span>Buy on {offer.retailerName}</span>
          <ExternalLink className="h-3 w-3 stroke-[2.5]" />
        </a>
      );
    }

    // 3. Direct product URL available
    if (offer.productUrl && offer.productUrl.trim().length > 0) {
      return (
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            handleRetailerClick({
              productId: laptopId,
              productName: laptopName,
              retailerId: offer.retailerId,
              retailerName: offer.retailerName,
              price: offer.price,
              targetUrl: offer.productUrl!,
              clickType: "product",
              timestamp: new Date().toISOString(),
              source: "advisor",
            })
          }
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-surface-200 bg-surface-800 border border-surface-700 hover:bg-surface-750 hover:text-white transition-all shrink-0"
        >
          <span>View on {offer.retailerName}</span>
          <ExternalLink className="h-3 w-3 stroke-[2.2]" />
        </a>
      );
    }

    // 4. Neither URL configured (Mock sample state)
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="w-full text-[11px] py-1.5 font-semibold shrink-0 border-surface-800 text-surface-400 bg-surface-950/40 opacity-70 cursor-not-allowed justify-center"
      >
        <span>Coming soon</span>
      </Button>
    );
  };

  // If Unsupported Market
  if (isUnsupportedMarket) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8 animate-fadeIn text-center">
        <Card className="p-8 sm:p-10 rounded-3xl border-surface-800 bg-surface-900/80 backdrop-blur-xl space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
            BuyWise doesn&apos;t have verified laptop pricing for this market yet.
          </h2>
          <p className="text-sm text-surface-300 leading-relaxed max-w-lg mx-auto">
            {unsupportedMessage ||
              "We currently have verified catalog coverage for India (₹ INR), the United States ($ USD), the United Kingdom (£ GBP), and Europe (€ EUR)."}
          </p>
          <div className="pt-3">
            <Button variant="primary" size="md" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span>Try a Different Search</span>
            </Button>
          </div>
        </Card>
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
      <Card
        key={laptop.id}
        className={`p-6 sm:p-7 rounded-3xl border ${theme.borderClass} shadow-xl backdrop-blur-xl transition-all space-y-5`}
      >
        {/* Card Top: Rank Badge, Brand, Price & BuyWise Match Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-xl text-xs ${theme.badgeClass}`}>
              {theme.label}
            </span>
            <span className="text-xs text-surface-400 font-semibold uppercase tracking-wider">
              {laptop.brand}
            </span>
            {laptop.model && (
              <span className="text-[11px] text-surface-500 font-mono">
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
              <span className="text-[10px] text-surface-500 mt-0.5 hidden sm:inline">
                BuyWise Match
              </span>
            </div>

            {/* BuyWise Score */}
            <div className="text-xs text-surface-300 font-semibold pl-2 border-l border-surface-800">
              Score: <strong className="text-white">{laptop.buyWiseScore}</strong>/100
            </div>
          </div>
        </div>

        {/* Middle Section: Image (Left) + Details & Specs (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Product Image */}
          <div className="md:col-span-4 relative aspect-[16/11] rounded-2xl overflow-hidden bg-surface-950 border border-surface-800">
            <img
              src={laptop.image}
              alt={laptop.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded-md bg-surface-950/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm border border-surface-700">
              {laptop.brand}
            </div>
          </div>

          {/* Info & Reasoning */}
          <div className="md:col-span-8 space-y-3.5">
            <div>
              <Link href={`/laptops/${laptop.id}?from=advisor&use=${encodeURIComponent(input.primaryUse)}&budget=${encodeURIComponent(input.budget)}&match=${encodeURIComponent(whyItMatches.join('|'))}`}>
                <h3 className="text-lg sm:text-xl font-bold text-white hover:text-brand-300 transition-colors font-sans">
                  {laptop.name}
                </h3>
              </Link>
              {laptop.fullName && (
                <p className="text-xs text-surface-400 truncate mt-0.5">
                  {laptop.fullName}
                </p>
              )}
              {(() => {
                const effectiveCalc = calculateEffectivePrice(priceToDisplay, laptop.discountOffers || SAMPLE_OFFERS);
                const hasOfferDiscount = effectiveCalc.savings > 0;

                return (
                  <div className="space-y-1 mt-1.5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <div>
                        <span className="text-[10px] text-surface-500 block font-medium">Listed Price</span>
                        <span className="text-xl sm:text-2xl font-bold text-white font-sans">
                          {formatCurrency(priceToDisplay, currencyToDisplay)}
                        </span>
                      </div>

                      {hasOfferDiscount && (
                        <div>
                          <span className="text-[10px] text-brand-400 block font-medium">With Available Offers</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-brand-300 font-sans">
                            {formatCurrency(effectiveCalc.effectivePrice, currencyToDisplay)}
                          </span>
                        </div>
                      )}

                      {bestOffer && priceToDisplay && bestOffer.price < priceToDisplay && (
                        <span className="text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 self-end mb-0.5">
                          <Sparkles className="h-3 w-3 text-brand-400" />
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
              <div className="p-2 rounded-xl bg-surface-950/80 border border-surface-800 text-surface-300">
                <span className="text-[10px] text-surface-500 block">CPU</span>
                <span className="font-semibold text-white truncate block">{laptop.processor.split("(")[0]}</span>
              </div>
              <div className="p-2 rounded-xl bg-surface-950/80 border border-surface-800 text-surface-300">
                <span className="text-[10px] text-surface-500 block">RAM / Storage</span>
                <span className="font-semibold text-white truncate block">{laptop.ram.split(" ")[0]} / {laptop.storage.split(" ")[0]}</span>
              </div>
              <div className="p-2 rounded-xl bg-surface-950/80 border border-surface-800 text-surface-300">
                <span className="text-[10px] text-surface-500 block">Graphics</span>
                <span className="font-semibold text-white truncate block">{laptop.gpu.replace("NVIDIA GeForce ", "")}</span>
              </div>
              <div className="p-2 rounded-xl bg-surface-950/80 border border-surface-800 text-surface-300">
                <span className="text-[10px] text-surface-500 block">Display</span>
                <span className="font-semibold text-white truncate block">{laptop.display.split("(")[0]}</span>
              </div>
            </div>

            {/* Why it matches */}
            <div className="rounded-2xl bg-surface-950/50 border border-surface-800 p-3.5 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Why it matches your requirements:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-surface-200">
                {whyItMatches.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Near-Match Warning Note (if relaxed or missing important requirement) */}
            {item.warningNote && (
              <div className="rounded-xl bg-amber-950/30 border border-amber-500/50 px-3.5 py-2.5 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-bold">Requirement Note:</strong>{" "}
                  <span>{item.warningNote}</span>
                </div>
              </div>
            )}

            {/* Potential drawback */}
            {potentialDrawback && !item.warningNote && (
              <div className="rounded-xl bg-surface-950/40 border border-surface-800/80 px-3 py-2 text-xs text-surface-300 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Trade-off:</strong>{" "}
                  <span>{potentialDrawback}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Direct "Where to Buy" Retailer Section inside Recommendation Card */}
        <div className="pt-3.5 border-t border-surface-800/80">
          <WhereToBuy
            laptop={laptop}
            offers={offersToDisplay}
            targetCurrency={currencyToDisplay}
            compact={true}
          />
        </div>

        {/* Bottom Actions: Add to Compare & View Full Details */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3.5 border-t border-surface-800/80">
          <Button
            type="button"
            variant={compared ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleLaptop(laptop)}
            className="w-full sm:w-auto text-xs font-semibold border-surface-700"
          >
            {compared ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Added to Compare</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 text-brand-400" />
                <span>Add to Compare</span>
              </>
            )}
          </Button>

          <Link href={`/laptops/${laptop.id}`} className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs font-bold justify-center">
              <span>View Full Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Search Summary Bar */}
      <div className="p-4 rounded-2xl bg-surface-900/60 border border-surface-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-surface-400 font-semibold uppercase tracking-wider text-[10px]">
            Your search:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-surface-950 text-white font-medium border border-surface-750">
            {input.primaryUse}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-surface-950 text-white font-medium border border-surface-750">
            {getBudgetLabel(input.budget, activeCurrency)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-surface-950 text-brand-300 font-medium border border-surface-750 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Market: {activeCurrency}
          </span>
          {input.ramPreference !== "no-preference" && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-950 text-white font-medium border border-surface-750">
              {input.ramPreference} RAM
            </span>
          )}
          {input.priorities.map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-lg bg-surface-950 text-surface-300 font-medium border border-surface-750">
              {p}
            </span>
          ))}
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Change Preferences</span>
        </button>
      </div>

      {/* Ambiguous Currency Notification (e.g. '$' without country) */}
      {isAmbiguousCurrency && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 text-blue-200 text-xs flex items-center gap-2.5">
          <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
          <span>
            Showing results for <strong>United States ($ USD)</strong>. If you are shopping in another country, simply include it in your request (e.g., &quot;in UK&quot; or &quot;in India&quot;).
          </span>
        </div>
      )}

      {/* Top Header with Total Match Count & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-800">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Your BuyWise Recommendations
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            {sortedResults.length} {sortedResults.length === 1 ? "Laptop Matches" : "Laptops Match"} Your Requirements
          </h2>
          <p className="text-xs sm:text-sm text-surface-400 mt-1 font-normal">
            Personalized recommendations with verified {activeCurrency} pricing for {input.primaryUse.toLowerCase()} workloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          {sortedResults.length > 1 && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-surface-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as AdvisorSortOption)}
                aria-label="Sort advisor results"
                className="bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 rounded-xl px-3 py-1.5 focus:border-brand-400 focus:outline-none transition-all cursor-pointer hover:border-surface-600"
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
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 text-amber-200 text-sm space-y-1.5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">No exact 100% matches found.</div>
            <p className="text-xs text-surface-300 leading-relaxed font-normal">
              {relaxedReason || "Some of your chosen constraints conflicted. We have provided the closest high-performing alternatives."}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Top Recommendations / Best Matches */}
      {topMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-400" />
            <h3 className="text-base font-bold text-white font-sans uppercase tracking-wider text-xs">
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
        <div className="pt-8 space-y-4 border-t border-surface-800/80">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              More Laptops Matching Your Requirements ({remainingMatches.length})
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
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
