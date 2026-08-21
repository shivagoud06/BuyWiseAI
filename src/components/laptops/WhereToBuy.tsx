"use client";

import React, { useState } from "react";
import { Laptop, RetailerOffer, RetailerSortOption, CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { sortRetailerOffers, handleRetailerClick } from "@/lib/retailers";
import { validateRetailerOffers, getBestListedPrice, getRetailerInfo, resolveRetailerOfferStatus } from "@/services/retailers";
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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="h-3 w-3" />
            In Stock
          </span>
        );
      case "limited-stock":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="h-3 w-3" />
            Limited Stock
          </span>
        );
      case "pre-order":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />
            Pre-Order
          </span>
        );
      case "out-of-stock":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle className="h-3 w-3" />
            NOT AVAILABLE
          </span>
        );
    }
  };

  const renderActionButton = (offer: RetailerOffer) => {
    const statusResult = resolveRetailerOfferStatus(offer);

    // 1. BUY NOW (Clickable authentic deeplink)
    if (statusResult.status === "BUY_NOW" && statusResult.targetUrl) {
      return (
        <a
          href={statusResult.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            handleRetailerClick({
              productId: laptop.id,
              productName: laptop.name,
              retailerId: offer.retailerId,
              retailerName: offer.retailerName,
              price: offer.price,
              targetUrl: statusResult.targetUrl!,
              clickType: statusResult.clickType || "product",
              timestamp: new Date().toISOString(),
              source: "product_page",
            })
          }
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition-all shrink-0 w-full sm:w-auto"
        >
          <span>BUY NOW →</span>
          <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
        </a>
      );
    }

    // 2. NOT AVAILABLE (Disabled out-of-stock button)
    if (statusResult.status === "NOT_AVAILABLE") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="text-xs font-semibold shrink-0 border-[#E5E7EB] bg-gray-50 text-[#9CA3AF] opacity-80 cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <span>NOT AVAILABLE</span>
        </Button>
      );
    }

    // 3. COMING SOON (Disabled unlinked button)
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="text-xs font-semibold shrink-0 border-[#E5E7EB] text-[#6B7280] bg-gray-50 opacity-80 cursor-not-allowed w-full sm:w-auto justify-center"
      >
        <span>COMING SOON</span>
      </Button>
    );
  };

  // Compact Mode (for embedding in cards, AI Advisor, or widgets)
  if (compact) {
    if (sortedOffers.length === 0) {
      return (
        <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-3 text-center text-xs text-[#6B7280]">
          Live retailer pricing unavailable
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Where to Buy
            </span>
          </div>
          {bestOffer && (
            <span className="text-[11px] font-bold text-brand-700">
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
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 shadow-sm ${
                  isBestPrice
                    ? "border-brand-300 bg-brand-50/50"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <RetailerLogo
                      retailerId={offer.retailerId}
                      retailerName={offer.retailerName}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-[#111827] truncate">
                      {offer.retailerName}
                    </span>
                  </div>
                  {isBestPrice && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-500 text-white text-[9px] font-extrabold uppercase shrink-0">
                      🏆 Best
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-[#111827] font-sans">
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
    <section className="py-8 border-t border-[#E5E7EB] space-y-5">
      {/* Section Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-4 w-4 text-brand-600" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] font-sans">
              Where to Buy
            </h2>
            {sortedOffers.length > 0 && (
              <Badge variant="brand" size="sm" className="text-[10px] uppercase tracking-wider font-mono">
                Verified Offers
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Compare listed prices across trusted retailers for this exact laptop configuration.
          </p>
        </div>

        {/* Sort Selector */}
        {sortedOffers.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#6B7280]" />
            <select
              value={sortOption}
              aria-label="Sort retailer offers"
              onChange={(e) => setSortOption(e.target.value as RetailerSortOption)}
              className="bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] rounded-xl px-3 py-1.5 focus:border-brand-500 focus:outline-none shadow-sm"
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
              <div
                key={offer.retailerId}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-sm ${
                  isBestPrice
                    ? "border-brand-300 bg-brand-50/50"
                    : "border-[#E5E7EB] bg-white hover:border-gray-300"
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
                        <span className="text-sm sm:text-base font-bold text-[#111827] font-sans">
                          {offer.retailerName}
                        </span>
                        {isBestPrice && (
                          <span className="px-2 py-0.5 rounded-md bg-brand-500 text-white text-[10px] font-extrabold tracking-wide flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" />
                            🏆 BEST LISTED PRICE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B7280] flex-wrap">
                        {getAvailabilityBadge(offer.availability)}
                        {offer.offerText && (
                          <span className="text-[#6B7280]">
                            • {offer.offerText}
                          </span>
                        )}
                        <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {offer.lastUpdated.startsWith("20") ? `Updated ${offer.lastUpdated}` : "Updated recently"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Buy/View Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                    <div className="text-left sm:text-right">
                      {offer.price && offer.price > 0 ? (
                        <>
                          <div className="text-lg sm:text-xl font-bold text-[#111827] font-sans">
                            {formatCurrency(offer.price, offer.currency)}
                          </div>
                          {offer.mrp && offer.mrp > offer.price && (
                            <div className="text-[11px] text-[#9CA3AF] flex items-center sm:justify-end gap-1.5">
                              <span className="line-through">{formatCurrency(offer.mrp, offer.currency)}</span>
                              {offer.discount && (
                                <span className="text-emerald-700 font-semibold">
                                  {offer.discount}% off
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-[#9CA3AF] font-medium">
                          Price unavailable
                        </div>
                      )}
                    </div>

                    {renderActionButton(offer)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] bg-white text-center space-y-2 shadow-sm">
          <p className="text-sm sm:text-base text-[#111827] font-semibold">
            Live retailer pricing unavailable
          </p>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            Retailer prices will appear when live offers are available from connected stores.
          </p>
          {laptop.price && (
            <p className="text-xs text-[#9CA3AF] pt-1">
              Official catalog reference price: <span className="font-semibold text-[#374151]">{formatCurrency(laptop.price, laptop.currency)}</span>
            </p>
          )}
        </div>
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
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 text-xs text-[#6B7280] flex items-start gap-2.5 shadow-sm">
        <Info className="h-4 w-4 text-[#9CA3AF] shrink-0 mt-0.5" />
        <span>
          <strong>Verified listed prices:</strong> Offers are verified against exact model configuration and SKU matching from connected stores before being listed.
        </span>
      </div>
    </section>
  );
}

// Re-export as RetailerOffers to satisfy both naming conventions
export { WhereToBuy as RetailerOffers };
