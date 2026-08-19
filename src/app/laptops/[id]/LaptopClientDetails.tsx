"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Laptop, RetailerOffer } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCompare } from "@/context/CompareContext";
import {
  Cpu,
  HardDrive,
  Monitor,
  Layers,
  Star,
  Sparkles,
  Check,
  Plus,
  Battery,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Info,
  Scale,
  Compass,
  FileCheck2,
  Calendar,
  Trophy,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WhereToBuy } from "@/components/laptops/WhereToBuy";
import { getBestRetailerOffer } from "@/lib/retailers";

interface LaptopClientDetailsProps {
  laptop: Laptop;
  initialOffers?: RetailerOffer[];
}

export function LaptopClientDetails({ laptop, initialOffers }: LaptopClientDetailsProps) {
  const searchParams = useSearchParams();
  const { isComparing, toggleLaptop } = useCompare();
  const compared = isComparing(laptop.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  // Check if arriving from AI Advisor
  const fromAdvisor = searchParams?.get("from") === "advisor";
  const matchParam = searchParams?.get("match");
  const useParam = searchParams?.get("use");
  const budgetParam = searchParams?.get("budget");

  const matchReasons = matchParam
    ? matchParam.split("|").filter((r) => r.trim().length > 0)
    : fromAdvisor
    ? [
        `Matches your ${useParam || laptop.useCases[0] || "primary"} workload requirements`,
        `Fits within your selected budget range`,
        `${laptop.ramSize}GB memory ensures smooth multitasking`,
        `BuyWise Score of ${laptop.buyWiseScore}/100 confirms exceptional price-to-performance`,
      ]
    : [];

  const discount =
    laptop.price && laptop.originalPrice && laptop.originalPrice > laptop.price
      ? Math.round(((laptop.originalPrice - laptop.price) / laptop.originalPrice) * 100)
      : 0;

  const bestOffer = getBestRetailerOffer(laptop);

  const getVerdictBadge = () => {
    switch (laptop.verdict) {
      case "BUY":
        return (
          <Badge variant="verdict-buy" size="md" className="font-semibold px-3 py-1 text-xs">
            <CheckCircle2 className="h-4 w-4" />
            BuyWise Verdict: BUY
          </Badge>
        );
      case "WAIT":
        return (
          <Badge variant="verdict-wait" size="md" className="font-semibold px-3 py-1 text-xs">
            <Clock className="h-4 w-4" />
            BuyWise Verdict: WAIT
          </Badge>
        );
      case "SKIP":
        return (
          <Badge variant="verdict-skip" size="md" className="font-semibold px-3 py-1 text-xs">
            <AlertTriangle className="h-4 w-4" />
            BuyWise Verdict: SKIP
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 80) return "text-brand-400 border-brand-500/40 bg-brand-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div className="space-y-12">
      {/* Verification & Metadata Header Strip */}
      <div className="rounded-2xl border border-surface-750 bg-surface-900/60 p-4 text-xs text-surface-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span className="capitalize">{laptop.dataStatus || "verified"} Specifications</span>
          </div>
          {laptop.source && (
            <span className="text-surface-400">
              Source: <strong className="text-surface-200">{laptop.source}</strong>
            </span>
          )}
        </div>

        {laptop.lastVerified && (
          <div className="flex items-center gap-1.5 text-surface-400">
            <Calendar className="h-3.5 w-3.5 text-surface-500" />
            <span>Last verified: <strong className="text-surface-200">{laptop.lastVerified}</strong></span>
          </div>
        )}
      </div>

      {/* 2-Column Top Section: Image (Left) & Info / Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[16/11] w-full rounded-2xl bg-surface-950/90 border border-surface-800 overflow-hidden shadow-2xl">
            <img
              src={laptop.image}
              alt={`${laptop.brand} ${laptop.name} product photo`}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover object-center transition-all duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-900 animate-pulse">
                <Cpu className="h-10 w-10 text-surface-600 animate-spin" />
              </div>
            )}

            {/* Overlays */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-surface-950/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-surface-700/60">
                {laptop.brand}
              </span>
              {laptop.model && (
                <span className="rounded-lg bg-surface-900/90 px-2.5 py-1 text-xs font-mono text-surface-300 backdrop-blur-md border border-surface-750">
                  {laptop.model}
                </span>
              )}
              {laptop.badge && (
                <span className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-bold text-surface-950 shadow-md">
                  {laptop.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details, Score & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              {getVerdictBadge()}
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-white">{laptop.rating.toFixed(1)}</span>
                <span className="text-surface-400 font-normal">
                  ({laptop.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
              {laptop.name}
            </h1>
            {laptop.fullName && (
              <p className="text-xs sm:text-sm text-surface-400 mt-1.5 font-normal">
                {laptop.fullName}
              </p>
            )}
          </div>

          {/* Price Block (Inter 700) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-900/60 border border-surface-800 backdrop-blur-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-surface-400 uppercase tracking-wider font-semibold">
                {bestOffer ? "Best Verified Live Retailer Price" : "Official Catalog Reference Price"}
              </div>
              {bestOffer && (
                <span className="text-[11px] font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-400" />
                  Best Listed: {formatINR(bestOffer.price)} ({bestOffer.retailerName})
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              {laptop.price && laptop.price > 0 ? (
                <>
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
                    {formatINR(laptop.price)}
                  </div>
                  {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through text-surface-500 font-normal">
                        {formatINR(laptop.originalPrice)}
                      </span>
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-xs">
                        Save {discount}%
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-2xl font-bold text-surface-400">
                  Price unavailable
                </div>
              )}
            </div>
          </div>

          {/* BuyWise Score & 5-Pillar Breakdown */}
          <div className="p-5 rounded-2xl bg-surface-900/80 border border-surface-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-400" />
                <span className="text-sm font-bold text-white">BuyWise Score</span>
              </div>
              <div
                className={`px-3 py-1 rounded-xl border text-sm font-bold font-sans ${getScoreColor(
                  laptop.buyWiseScore
                )}`}
              >
                {laptop.buyWiseScore}/100
              </div>
            </div>

            {/* 5-Category Breakdown Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {/* 1. Performance */}
              <div className="space-y-1">
                <div className="flex justify-between text-surface-300">
                  <span>Performance</span>
                  <span className="font-semibold text-white">{laptop.scoreBreakdown.performance}%</span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-400 rounded-full"
                    style={{ width: `${laptop.scoreBreakdown.performance}%` }}
                  />
                </div>
              </div>

              {/* 2. Price/Value */}
              <div className="space-y-1">
                <div className="flex justify-between text-surface-300">
                  <span>Price / Value</span>
                  <span className="font-semibold text-white">{laptop.scoreBreakdown.priceValue}%</span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${laptop.scoreBreakdown.priceValue}%` }}
                  />
                </div>
              </div>

              {/* 3. Features */}
              <div className="space-y-1">
                <div className="flex justify-between text-surface-300">
                  <span>Features &amp; Build</span>
                  <span className="font-semibold text-white">{laptop.scoreBreakdown.features}%</span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full"
                    style={{ width: `${laptop.scoreBreakdown.features}%` }}
                  />
                </div>
              </div>

              {/* 4. Display */}
              <div className="space-y-1">
                <div className="flex justify-between text-surface-300">
                  <span>Display Quality</span>
                  <span className="font-semibold text-white">{laptop.scoreBreakdown.display}%</span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${laptop.scoreBreakdown.display}%` }}
                  />
                </div>
              </div>

              {/* 5. Battery */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between text-surface-300">
                  <span>Battery Endurance</span>
                  <span className="font-semibold text-white">{laptop.scoreBreakdown.battery}%</span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${laptop.scoreBreakdown.battery}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Specs Overview */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-900 border border-surface-800">
              <span className="text-surface-400 block text-[11px] mb-0.5 font-medium">Processor</span>
              <span className="text-white font-semibold truncate block">{laptop.processor.split("(")[0]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-900 border border-surface-800">
              <span className="text-surface-400 block text-[11px] mb-0.5 font-medium">RAM / Storage</span>
              <span className="text-white font-semibold truncate block">{laptop.ram.split(" ")[0]} / {laptop.storage.split(" ")[0]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-900 border border-surface-800">
              <span className="text-surface-400 block text-[11px] mb-0.5 font-medium">Graphics</span>
              <span className="text-white font-semibold truncate block">{laptop.gpu.replace("NVIDIA GeForce ", "")}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-900 border border-surface-800">
              <span className="text-surface-400 block text-[11px] mb-0.5 font-medium">Display</span>
              <span className="text-white font-semibold truncate block">{laptop.display.split("(")[0]}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant={compared ? "secondary" : "outline"}
              size="lg"
              onClick={() => toggleLaptop(laptop)}
              className="w-full font-semibold border-surface-700 justify-center"
            >
              {compared ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Added to Compare</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-brand-400" />
                  <span>Add to Compare</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setBuyModalOpen(true)}
              className="w-full font-bold justify-center"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Purchase Options</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Advisor Match Banner (When coming from /advisor) */}
      {matchReasons.length > 0 && (
        <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-surface-900/70 to-brand-950/40 p-6 sm:p-7 space-y-3.5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-sans">
                Why this laptop matches you
              </h2>
            </div>
            <Badge variant="brand" size="sm" className="font-semibold text-xs self-start sm:self-auto">
              Advisor Match
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {matchReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-surface-200">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Specifications Section */}
      <section className="space-y-6 pt-8 border-t border-surface-800/80">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Detailed Verified Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Processor */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <Cpu className="h-4 w-4 text-brand-400" />
              <span>Processor</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.processor}</div>
          </div>

          {/* Memory */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Memory (RAM)</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.ram}</div>
          </div>

          {/* Storage */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <HardDrive className="h-4 w-4 text-teal-400" />
              <span>Storage</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.storage}</div>
          </div>

          {/* Display */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <Monitor className="h-4 w-4 text-indigo-400" />
              <span>Display</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.display}</div>
          </div>

          {/* GPU */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Graphics (GPU)</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.gpu}</div>
          </div>

          {/* Battery */}
          <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
              <Battery className="h-4 w-4 text-emerald-400" />
              <span>Battery &amp; Charging</span>
            </div>
            <div className="text-sm font-semibold text-white">{laptop.battery}</div>
          </div>

          {/* Weight */}
          {laptop.weight && (
            <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
                <Scale className="h-4 w-4 text-purple-400" />
                <span>Weight</span>
              </div>
              <div className="text-sm font-semibold text-white">{laptop.weight}</div>
            </div>
          )}

          {/* Operating System */}
          {laptop.operatingSystem && (
            <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
                <Compass className="h-4 w-4 text-sky-400" />
                <span>Operating System</span>
              </div>
              <div className="text-sm font-semibold text-white">{laptop.operatingSystem}</div>
            </div>
          )}

          {/* SKU / Model Identifier */}
          {laptop.sku && (
            <div className="rounded-xl bg-surface-900/60 border border-surface-800 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-1">
                <FileCheck2 className="h-4 w-4 text-orange-400" />
                <span>Retail SKU</span>
              </div>
              <div className="text-sm font-mono text-white">{laptop.sku}</div>
            </div>
          )}
        </div>
      </section>

      {/* Pros and Cons */}
      <section className="space-y-6 pt-8 border-t border-surface-800/80">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Pros and Cons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ThumbsUp className="h-4 w-4" />
              <span>Key Advantages</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-surface-200">
              {laptop.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ThumbsDown className="h-4 w-4" />
              <span>Things to Keep in Mind</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-surface-200">
              {laptop.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Best For */}
      <section className="space-y-4 pt-8 border-t border-surface-800/80">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Best Suited For
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {laptop.useCases.map((uc) => (
            <span
              key={uc}
              className="rounded-xl bg-surface-900 border border-surface-700 px-3.5 py-2 text-xs font-semibold text-brand-300"
            >
              {uc}
            </span>
          ))}
        </div>
      </section>

      {/* Purchase Decision Summary: BuyWise Recommendation (Requirement 16) */}
      <section className="rounded-2xl border border-brand-500/30 bg-surface-900/80 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">
                BuyWise Recommendation
              </h2>
              <p className="text-xs text-surface-400">
                Executive hardware evaluation &amp; purchase verdict
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getVerdictBadge()}
            <div className={`px-3 py-1 rounded-xl border text-sm font-bold font-sans ${getScoreColor(laptop.buyWiseScore)}`}>
              {laptop.buyWiseScore}/100
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800 space-y-1">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block">
              Best For
            </span>
            <span className="font-bold text-brand-300 block">
              {laptop.useCases.join(", ")}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800 space-y-1">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block">
              Best Listed Price
            </span>
            <span className="font-bold text-white font-sans block">
              {bestOffer ? `${formatINR(bestOffer.price)} (${bestOffer.retailerName})` : laptop.price ? formatINR(laptop.price) : "Price unavailable"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800 space-y-1">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block">
              Verified Hardware
            </span>
            <span className="font-semibold text-surface-200 block">
              {laptop.processor.split("(")[0]} • {laptop.ramSize}GB RAM
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="text-xs sm:text-sm text-surface-300 leading-relaxed">
            <strong className="text-white">Why consider it: </strong>
            {laptop.verdictReason || `High value configuration for ${laptop.useCases.join(" and ")}.`}
          </div>
          {laptop.cons && laptop.cons.length > 0 && (
            <div className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              <strong className="text-rose-400">Potential drawback: </strong>
              {laptop.cons[0]}
            </div>
          )}
        </div>
      </section>

      {/* Where to Buy (Multi-Retailer Store Offers) */}
      <WhereToBuy laptop={laptop} offers={initialOffers} />

      {/* Purchase Modal / Store Notice */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-2 text-brand-400">
              <ShoppingBag className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white font-sans">Store Offers Overview</h3>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed">
              Store listing for <span className="text-white font-semibold">{laptop.fullName || laptop.name}</span>:
            </p>
            <div className="text-2xl font-bold text-white font-sans">
              {laptop.price ? formatINR(laptop.price) : "Price unavailable"}
            </div>
            <div className="rounded-xl bg-surface-950 border border-surface-800 p-3 text-[11px] text-surface-400 leading-relaxed">
              Use the <strong>Where to Buy</strong> section directly below on this page to compare multi-retailer store prices and availability.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={() => setBuyModalOpen(false)} className="font-semibold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
