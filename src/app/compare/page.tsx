"use client";

import React from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { LAPTOPS } from "@/data/laptops";
import { formatINR } from "@/lib/utils";
import { getBestRetailerOffer } from "@/lib/retailers";
import { Laptop } from "@/types";
import {
  Scale,
  X,
  Plus,
  Trophy,
  Sparkles,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RotateCcw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { calculateEffectivePrice } from "@/services/retailers/offers";
import { SAMPLE_OFFERS } from "@/data/mockOffers";

export default function ComparePage() {
  const { comparedLaptops, removeLaptop, addLaptop, clearCompare, count } = useCompare();

  // Pick suggestions when user has 0 or 1 laptop selected
  const suggestedLaptops = LAPTOPS.filter(
    (l) => !comparedLaptops.some((c) => c.id === l.id)
  ).slice(0, 3);

  // Deterministic Winner Calculation using BuyWise Score
  const winner: Laptop | null = React.useMemo(() => {
    if (comparedLaptops.length < 2) return null;
    return [...comparedLaptops].sort((a, b) => {
      if (b.buyWiseScore !== a.buyWiseScore) {
        return b.buyWiseScore - a.buyWiseScore;
      }
      return (a.price ?? 99999999) - (b.price ?? 99999999);
    })[0];
  }, [comparedLaptops]);

  const generateWinnerReason = (w: Laptop, items: Laptop[]) => {
    const others = items.filter((l) => l.id !== w.id);
    const otherNames = others.map((o) => `${o.brand} ${o.name}`).join(" and ");

    return `${w.brand} ${w.name} is the stronger overall option based on performance, features, and value score (${w.buyWiseScore}/100) compared to ${otherNames}.`;
  };

  const getVerdictBadge = (verdict: Laptop["verdict"]) => {
    switch (verdict) {
      case "BUY":
        return (
          <Badge variant="verdict-buy" size="sm" className="font-semibold text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            BUY
          </Badge>
        );
      case "WAIT":
        return (
          <Badge variant="verdict-wait" size="sm" className="font-semibold text-[11px]">
            <Clock className="h-3 w-3" />
            WAIT
          </Badge>
        );
      case "SKIP":
        return (
          <Badge variant="verdict-skip" size="sm" className="font-semibold text-[11px]">
            <AlertTriangle className="h-3 w-3" />
            SKIP
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sample Data Disclaimer Banner */}
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 p-3 text-xs text-surface-400 flex items-center gap-2 mb-6">
          <Info className="h-4 w-4 text-brand-400 shrink-0" />
          <span>
            <strong>Sample Comparison Data:</strong> Specifications, scores, and INR pricing are mock values for prototype evaluation.
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2.5">
              <Badge variant="brand" size="sm" className="font-medium text-xs">
                <Scale className="h-3.5 w-3.5 text-brand-400" />
                <span>Side-by-Side Comparison</span>
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Compare Laptops
            </h1>
            <p className="text-sm text-surface-400 mt-1 max-w-2xl font-normal">
              Compare up to 3 laptops on pricing, specifications, display, battery, and deterministic BuyWise scores.
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompare}
                className="text-xs text-surface-400 hover:text-rose-400 font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear comparison
              </Button>
              <Link href="/laptops">
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" />
                  Add more laptops
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* State 1: Zero Laptops Selected */}
        {count === 0 && (
          <Card className="p-12 text-center border-surface-800 bg-surface-900/40 rounded-2xl max-w-2xl mx-auto space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-brand-400">
              <Scale className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white font-sans">
              No Laptops Selected for Comparison
            </h2>
            <p className="text-sm text-surface-400 font-normal">
              Browse our catalog of 20 Indian market laptops and click the <strong>&quot;Compare&quot;</strong> button on any product card to start a side-by-side spec evaluation.
            </p>
            <div className="pt-2">
              <Link href="/laptops">
                <Button variant="primary" size="md" className="font-semibold">
                  Browse Laptop Catalog
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* State 2: Only 1 Laptop Selected */}
        {count === 1 && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5 flex items-start gap-3.5 text-amber-200 text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Select at least 2 laptops to compare.</span>
                <p className="text-xs text-surface-300 mt-1 font-normal">
                  You currently have 1 laptop selected (<span className="text-white font-semibold">{comparedLaptops[0].name}</span>). Add another model below to compare specifications side-by-side.
                </p>
              </div>
            </div>

            {/* Quick Add Suggestions */}
            <div>
              <h3 className="text-base font-bold text-white mb-4 font-sans">
                Suggested Laptops to Compare with {comparedLaptops[0].brand}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {suggestedLaptops.map((sug) => (
                  <Card
                    key={sug.id}
                    className="p-4 flex flex-col justify-between border-surface-800 bg-surface-900/60 rounded-xl space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-surface-400 mb-1">
                        <span className="font-semibold text-white">{sug.brand}</span>
                        <span className="font-bold text-brand-300">{formatINR(sug.price)}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {sug.name}
                      </h4>
                      <p className="text-xs text-surface-400 line-clamp-1 mt-1">
                        {sug.processor.split("(")[0]}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addLaptop(sug)}
                      className="w-full text-xs font-semibold justify-center"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Comparison
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State 3: 2 or 3 Laptops Selected -> Full Matrix */}
        {count >= 2 && (
          <div className="space-y-8">
            {/* Mobile swipe helper */}
            <div className="flex md:hidden items-center justify-between text-[11px] text-surface-400 px-1">
              <span>Swipe horizontally to compare specs</span>
              <span className="text-brand-400 font-semibold">→</span>
            </div>

            {/* Table with horizontal scroll container */}
            <div className="overflow-x-auto rounded-2xl border border-surface-800 bg-surface-900/60 backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left text-sm border-collapse min-w-[650px] sm:min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-950/80">
                    <th className="p-4 sm:p-6 w-1/4 text-xs font-bold uppercase tracking-wider text-surface-400 align-top">
                      Specification
                    </th>
                    {comparedLaptops.map((laptop) => (
                      <th
                        key={laptop.id}
                        className="p-4 sm:p-6 w-1/4 align-top border-l border-surface-800/80"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-900 border border-surface-800">
                            <img
                              src={laptop.image}
                              alt={laptop.name}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeLaptop(laptop.id)}
                              className="absolute top-2 right-2 rounded-lg bg-surface-950/90 p-1 text-surface-400 hover:text-rose-400 hover:bg-surface-900 transition-colors"
                              aria-label={`Remove ${laptop.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                              {laptop.brand}
                            </span>
                            <Link href={`/laptops/${laptop.id}`}>
                              <h3 className="text-sm font-bold text-white leading-snug hover:text-brand-300 transition-colors">
                                {laptop.name}
                              </h3>
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                    {comparedLaptops.length < 3 && (
                      <th className="p-4 sm:p-6 w-1/4 border-l border-surface-800/80 align-middle text-center bg-surface-950/40">
                        <div className="p-6 border-2 border-dashed border-surface-800 rounded-xl space-y-2">
                          <Plus className="h-6 w-6 text-surface-500 mx-auto" />
                          <p className="text-xs text-surface-400 font-medium">Add 3rd Laptop</p>
                          <Link href="/laptops">
                            <Button variant="ghost" size="sm" className="text-xs font-semibold text-brand-400">
                              Browse Catalog
                            </Button>
                          </Link>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-surface-800/60 text-xs sm:text-sm">
                  {/* 1a. Listed Price */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">
                      <div>Listed Price</div>
                      <div className="text-[10px] text-surface-500 font-normal mt-0.5">Reference Catalog Price</div>
                    </td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 font-bold text-white font-sans text-base">
                        {laptop.price && laptop.price > 0 ? formatINR(laptop.price) : "Price unavailable"}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 1b. Best Listed Price */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">
                      <div>Best Listed Price</div>
                      <div className="text-[10px] text-surface-500 font-normal mt-0.5">Lowest Verified Retailer</div>
                    </td>
                    {comparedLaptops.map((laptop) => {
                      const bestOffer = getBestRetailerOffer(laptop);
                      return (
                        <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                          {bestOffer ? (
                            <div className="text-xs font-semibold text-brand-300 flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                              <span>{formatINR(bestOffer.price)} ({bestOffer.retailerName})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-surface-500 font-normal">Pricing unavailable</span>
                          )}
                        </td>
                      );
                    })}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 1c. Available Instant Discount & Pay Now */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">
                      <div>Pay Now (Checkout)</div>
                      <div className="text-[10px] text-surface-500 font-normal mt-0.5">After instant bank &amp; coupons</div>
                    </td>
                    {comparedLaptops.map((laptop) => {
                      const bestOffer = getBestRetailerOffer(laptop);
                      const basePrice = bestOffer ? bestOffer.price : laptop.price;
                      const calc = calculateEffectivePrice(basePrice, laptop.discountOffers || SAMPLE_OFFERS);
                      return (
                        <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                          {calc.listedPrice > 0 ? (
                            <div className="space-y-0.5">
                              <span className="text-base font-bold text-white font-sans block">
                                {formatINR(calc.payNowPrice)}
                              </span>
                              {calc.instantDiscount > 0 && (
                                <span className="text-[11px] text-emerald-400 font-medium block">
                                  Save {formatINR(calc.instantDiscount)} instant
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-surface-500">Unavailable</span>
                          )}
                        </td>
                      );
                    })}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 1d. Potential Cashback & Effective Value */}
                  <tr className="hover:bg-surface-850/40 transition-colors bg-brand-500/5">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">
                      <div>Effective Value</div>
                      <div className="text-[10px] text-surface-500 font-normal mt-0.5">After potential cashback</div>
                    </td>
                    {comparedLaptops.map((laptop) => {
                      const bestOffer = getBestRetailerOffer(laptop);
                      const basePrice = bestOffer ? bestOffer.price : laptop.price;
                      const calc = calculateEffectivePrice(basePrice, laptop.discountOffers || SAMPLE_OFFERS);
                      return (
                        <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                          {calc.listedPrice > 0 ? (
                            <div className="space-y-0.5">
                              <span className="text-lg font-extrabold text-brand-300 font-sans block">
                                {formatINR(calc.effectivePrice)}
                              </span>
                              {calc.potentialCashback > 0 && (
                                <span className="text-[11px] text-cyan-300 font-medium block">
                                  Incl. {formatINR(calc.potentialCashback)} cashback
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-surface-500">Unavailable</span>
                          )}
                        </td>
                      );
                    })}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 2. Processor */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Processor</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.processor}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 3. RAM */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">RAM</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.ram}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 4. Storage */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Storage</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.storage}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 5. GPU */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Graphics (GPU)</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.gpu}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 6. Display */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Display</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.display}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 7. Battery */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Battery</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.battery}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 8. Weight */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Weight</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.weight || "Not verified"}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 9. Operating System */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Operating System</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60 text-white font-medium">
                        {laptop.operatingSystem || "Windows 11"}
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 8. Rating */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Rating</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{laptop.rating.toFixed(1)}</span>
                          <span className="text-xs text-surface-500 font-normal">
                            ({laptop.reviewCount})
                          </span>
                        </div>
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 9. BuyWise Score */}
                  <tr className="hover:bg-surface-850/40 transition-colors bg-brand-500/5">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">BuyWise Score</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className="flex items-center gap-1 font-bold text-brand-300 font-sans">
                            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                            <span>{laptop.buyWiseScore}/100</span>
                          </div>
                          <div>{getVerdictBadge(laptop.verdict)}</div>
                        </div>
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* 10. Best Use Cases */}
                  <tr className="hover:bg-surface-850/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-surface-300">Best Use Cases</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                        <div className="flex flex-wrap gap-1">
                          {laptop.useCases.map((uc) => (
                            <span
                              key={uc}
                              className="rounded-md bg-surface-800 px-2 py-0.5 text-[10px] font-medium text-surface-300 border border-surface-700/50"
                            >
                              {uc}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>

                  {/* Actions */}
                  <tr className="bg-surface-950/60">
                    <td className="p-4 sm:p-5 font-bold text-surface-400">Action</td>
                    {comparedLaptops.map((laptop) => (
                      <td key={laptop.id} className="p-4 sm:p-5 border-l border-surface-800/60">
                        <Link href={`/laptops/${laptop.id}`}>
                          <Button variant="primary" size="sm" className="w-full text-xs font-semibold justify-center">
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    ))}
                    {comparedLaptops.length < 3 && <td className="p-4 border-l border-surface-800/60" />}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BuyWise Recommendation */}
            {winner && (
              <Card className="p-6 sm:p-8 rounded-2xl border-brand-500/40 bg-gradient-to-br from-brand-950/40 via-surface-900/80 to-surface-950 border shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm" className="font-bold">
                          🏆 Best Overall
                        </Badge>
                        <span className="text-xs text-brand-300 font-mono font-bold">
                          {winner.buyWiseScore}/100
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-sans mt-1">
                        BuyWise Recommendation
                      </h3>
                    </div>
                  </div>

                  <Link href={`/laptops/${winner.id}`}>
                    <Button variant="primary" size="sm" className="font-bold">
                      <span>View {winner.brand} Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-surface-800/80 pt-4 text-xs sm:text-sm text-surface-200 leading-relaxed font-normal">
                  <p>{generateWinnerReason(winner, comparedLaptops)}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
