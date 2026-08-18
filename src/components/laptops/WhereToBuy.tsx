"use client";

import React, { useState } from "react";
import { Laptop, RetailerOffer, RetailerSortOption, CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { sortRetailerOffers, handleRetailerClick } from "@/lib/retailers";
import { validateRetailerOffers, getBestListedPrice, getRetailerInfo } from "@/services/retailers";
import {
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  ExternalLink,
  Store,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EffectivePriceCard } from "@/components/laptops/EffectivePriceCard";
import { RetailerLogo } from "@/components/retailers/RetailerLogo";

export interface WhereToBuyProps {
  laptop: Laptop;
  offers?: RetailerOffer[];
  targetCurrency?: CurrencyCode;
  compact?: boolean;
}

export function WhereToBuy({
  laptop,
  offers,
  targetCurrency,
  compact = false,
}: WhereToBuyProps) {
  const [sortOption, setSortOption] = useState<RetailerSortOption>("price-asc");

  // Filter out any mock/sample offers from live production display
  const rawOffers = (offers || laptop.offers || []).filter((o) => !o.isMock && o.source !== "mock");
  const effectiveCurrency = targetCurrency || laptop.currency || "INR";

  // Run through validation layer to filter invalid offers and match configuration
  const validatedOffers = validateRetailerOffers(rawOffers, laptop);
  const sortedOffers = sortRetailerOffers(validatedOffers, sortOption);
  const bestOffer = getBestListedPrice(validatedOffers, effectiveCurrency);

  const getAvailabilityBadge = (status: RetailerOffer["availability"]) => {
    switch (status) {
      case "in-stock":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="h-3 w-3" />
            In Stock
          </span>
        );
      case "limited-stock":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
            <AlertTriangle className="h-3 w-3" />
            Limited Stock
          </span>
        );
      case "pre-order":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />
            Pre-Order
          </span>
        );
      case "out-of-stock":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
            <XCircle className="h-3 w-3" />
            OUT OF STOCK
          </span>
        );
    }
  };

  const renderActionButton = (offer: RetailerOffer) => {
    // 2. VERIFIED LIVE + OUT OF STOCK -> Show "OUT OF STOCK" (No BUY NOW)
    if (offer.availability === "out-of-stock") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="text-xs font-semibold shrink-0 border-surface-800 text-surface-500 opacity-60 cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <span>OUT OF STOCK</span>
        </Button>
      );
    }

    const hasValidAffiliateUrl =
      offer.affiliateUrl &&
      offer.affiliateUrl.trim().length > 0 &&
      (offer.affiliateUrl.startsWith("http://") || offer.affiliateUrl.startsWith("https://"));

    const hasValidProductUrl =
      offer.productUrl &&
      offer.productUrl.trim().length > 0 &&
      (offer.productUrl.startsWith("http://") || offer.productUrl.startsWith("https://"));

    const targetUrl = hasValidAffiliateUrl ? offer.affiliateUrl! : hasValidProductUrl ? offer.productUrl! : null;
    const clickType = hasValidAffiliateUrl ? "affiliate" : "product";

    // 1. VERIFIED LIVE + AVAILABLE + VALID URL -> Show "BUY NOW" & open authentic retailer URL
    if (targetUrl) {
      return (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            handleRetailerClick({
              productId: laptop.id,
              productName: laptop.name,
              retailerId: offer.retailerId,
              retailerName: offer.retailerName,
              price: offer.price,
              targetUrl,
              clickType,
              timestamp: new Date().toISOString(),
              source: "product_page",
            })
          }
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-surface-950 bg-brand-500 hover:bg-brand-400 shadow-md shadow-brand-500/10 transition-all shrink-0 w-full sm:w-auto"
        >
          <span>BUY NOW →</span>
          <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
        </a>
      );
    }

    // 3. RETAILER SUPPORTED BUT NO LIVE DATA SOURCE YET -> Show "COMING SOON" (Unclickable, no fake URL)
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="text-xs font-semibold shrink-0 border-surface-800 text-surface-400 bg-surface-900/60 opacity-80 cursor-not-allowed w-full sm:w-auto justify-center"
      >
        <span>COMING SOON</span>
      </Button>
    );
  };

  const hasMockOffers = sortedOffers.some((o) => o.source === "mock" || o.isMock);

  // Compact Mode (for embedding in cards, AI Advisor, or widgets)
  if (compact) {
    if (sortedOffers.length === 0) {
      return (
        <div className="rounded-xl border border-surface-800 bg-surface-950/40 p-3 text-center text-xs text-surface-400">
          Live retailer pricing unavailable
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Where to Buy
            </span>
          </div>
          {bestOffer && (
            <span className="text-[11px] font-bold text-brand-300">
              🏆 Best Listed: {formatCurrency(bestOffer.price, bestOffer.currency)} ({bestOffer.retailerName})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedOffers.map((offer) => {
            const isBestPrice =
              bestOffer &&
              bestOffer.retailerId === offer.retailerId &&
              offer.availability !== "out-of-stock";

            return (
              <div
                key={offer.retailerId}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  isBestPrice
                    ? "border-brand-500/40 bg-brand-950/20"
                    : "border-surface-800 bg-surface-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <RetailerLogo
                      retailerId={offer.retailerId}
                      retailerName={offer.retailerName}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {offer.retailerName}
                    </span>
                  </div>
                  {isBestPrice && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-500 text-surface-950 text-[9px] font-extrabold uppercase shrink-0">
                      🏆 Best
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-white font-sans">
                    {formatCurrency(offer.price, offer.currency)}
                  </span>
                  {getAvailabilityBadge(offer.availability)}
                </div>

                {renderActionButton(offer)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full Details Mode
  return (
    <section className="py-10 border-t border-surface-800/80 space-y-6">
      {/* Section Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Store className="h-4 w-4 text-brand-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Where to Buy
            </h2>
            {sortedOffers.length > 0 && (
              <Badge variant="brand" size="sm" className="text-[10px] uppercase tracking-wider font-mono">
                Verified Offers
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-surface-400">
            Compare listed prices across trusted retailers for this exact laptop configuration.
          </p>
        </div>

        {/* Sort Selector */}
        {sortedOffers.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SlidersHorizontal className="h-3.5 w-3.5 text-surface-400" />
            <select
              value={sortOption}
              aria-label="Sort retailer offers"
              onChange={(e) => setSortOption(e.target.value as RetailerSortOption)}
              className="bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 rounded-xl px-3 py-1.5 focus:border-brand-400 focus:outline-none"
            >
              <option value="price-asc">Lowest Listed Price</option>
              <option value="discount-desc">Highest Discount</option>
              <option value="retailer">Retailer Name</option>
            </select>
          </div>
        )}
      </div>

      {/* Retailer Offers List */}
      {sortedOffers.length > 0 ? (
        <div className="space-y-3">
          {sortedOffers.map((offer) => {
            const isBestPrice =
              bestOffer &&
              bestOffer.retailerId === offer.retailerId &&
              offer.availability !== "out-of-stock";

            return (
              <Card
                key={offer.retailerId}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isBestPrice
                    ? "border-brand-500/50 bg-brand-950/20 shadow-lg shadow-brand-500/5"
                    : "border-surface-800 bg-surface-900/60 hover:border-surface-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Retailer info */}
                  <div className="flex items-center gap-3.5">
                    <RetailerLogo
                      retailerId={offer.retailerId}
                      retailerName={offer.retailerName}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-white font-sans">
                          {offer.retailerName}
                        </span>
                        {isBestPrice && (
                          <span className="px-2 py-0.5 rounded-md bg-brand-500 text-surface-950 text-[10px] font-extrabold tracking-wide flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" />
                            🏆 BEST LISTED PRICE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-400 flex-wrap">
                        {getAvailabilityBadge(offer.availability)}
                        {offer.offerText && (
                          <span className="text-surface-400">
                            • {offer.offerText}
                          </span>
                        )}
                        <span className="text-[10px] text-surface-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {offer.lastUpdated.startsWith("20") ? `Updated ${offer.lastUpdated}` : "Updated recently"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Buy/View Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-800">
                    <div className="text-left sm:text-right">
                      {offer.price && offer.price > 0 ? (
                        <>
                          <div className="text-lg sm:text-xl font-bold text-white font-sans">
                            {formatCurrency(offer.price, offer.currency)}
                          </div>
                          {offer.mrp && offer.mrp > offer.price && (
                            <div className="text-[11px] text-surface-500 flex items-center sm:justify-end gap-1.5">
                              <span className="line-through">{formatCurrency(offer.mrp, offer.currency)}</span>
                              {offer.discount && (
                                <span className="text-emerald-400 font-semibold">
                                  {offer.discount}% off
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-surface-500 font-medium">
                          Price unavailable
                        </div>
                      )}
                    </div>

                    {renderActionButton(offer)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/40 text-center space-y-2">
          <p className="text-sm sm:text-base text-surface-200 font-semibold">
            Live retailer pricing unavailable
          </p>
          <p className="text-xs text-surface-400 max-w-md mx-auto">
            Retailer prices will appear when live offers are available from connected stores.
          </p>
          {laptop.price && (
            <p className="text-xs text-surface-500 pt-1">
              Official catalog reference price: <span className="font-semibold text-surface-300">{formatCurrency(laptop.price, laptop.currency)}</span>
            </p>
          )}
        </Card>
      )}

      {/* Transparent Bank Offers, Discounts & Effective Price Calculation (Only if real discount offers exist) */}
      {laptop.discountOffers && laptop.discountOffers.length > 0 && laptop.discountOffers.some((o) => !o.isMock) && (
        <EffectivePriceCard
          listedPrice={bestOffer ? bestOffer.price : laptop.price}
          offers={laptop.discountOffers.filter((o) => !o.isMock)}
          currency={effectiveCurrency}
          retailerName={bestOffer ? bestOffer.retailerName : undefined}
        />
      )}

      {/* Data Freshness & Source Disclaimer */}
      <div className="rounded-xl border border-surface-800/80 bg-surface-900/30 p-3.5 text-xs text-surface-400 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-surface-500 shrink-0 mt-0.5" />
        <span>
          <strong>Verified listed prices:</strong> Offers are verified against exact model configuration and SKU matching from connected stores before being listed.
        </span>
      </div>
    </section>
  );
}

// Re-export as RetailerOffers to satisfy both naming conventions
export { WhereToBuy as RetailerOffers };
