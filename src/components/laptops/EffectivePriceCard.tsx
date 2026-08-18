"use client";

import React, { useState } from "react";
import { DiscountOffer, CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { calculateEffectivePrice, OfferEvaluationContext } from "@/services/retailers/offers";
import {
  Tag,
  CreditCard,
  Ticket,
  Coins,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface EffectivePriceCardProps {
  listedPrice: number | null | undefined;
  offers?: DiscountOffer[];
  currency?: CurrencyCode;
  retailerName?: string;
  context?: OfferEvaluationContext;
  compact?: boolean;
}

export function EffectivePriceCard({
  listedPrice,
  offers = [],
  currency = "INR",
  retailerName,
  context = {},
  compact = false,
}: EffectivePriceCardProps) {
  const [showAllDetails, setShowAllDetails] = useState(false);

  const calc = calculateEffectivePrice(listedPrice, offers, context);

  const getOfferIcon = (type: DiscountOffer["offerType"]) => {
    switch (type) {
      case "bank_offer":
        return <CreditCard className="h-4 w-4 text-brand-400" />;
      case "coupon":
        return <Ticket className="h-4 w-4 text-cyan-400" />;
      case "cashback":
        return <Coins className="h-4 w-4 text-emerald-400" />;
      case "exchange_offer":
        return <RefreshCw className="h-4 w-4 text-amber-400" />;
      case "retailer_discount":
      default:
        return <Tag className="h-4 w-4 text-purple-400" />;
    }
  };

  const hasOffers = calc.appliedOffers.length > 0;
  const hasMockOffers = calc.appliedOffers.some((o) => o.isMock);

  if (!listedPrice || listedPrice <= 0) {
    return (
      <Card className="p-4 rounded-2xl border-surface-800 bg-surface-900/40 text-center text-xs text-surface-400">
        Pricing unavailable
      </Card>
    );
  }

  // Compact Mode (For AI Advisor & comparison cards)
  if (compact) {
    if (!hasOffers) {
      return (
        <div className="text-xs text-surface-400">
          No verified offers available
        </div>
      );
    }

    return (
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-400 font-medium">Pay Now (Checkout):</span>
          <span className="text-white font-bold font-sans">
            {formatCurrency(calc.payNowPrice, currency)}
          </span>
        </div>

        {calc.potentialCashback > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Potential Cashback:
            </span>
            <span className="text-emerald-300 font-semibold font-sans">
              -{formatCurrency(calc.potentialCashback, currency)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-800/60">
          <span className="text-brand-300 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-400" />
            Effective Value:
          </span>
          <span className="text-brand-300 font-extrabold font-sans">
            {formatCurrency(calc.effectivePrice, currency)}
          </span>
        </div>
      </div>
    );
  }

  // Full Details Mode
  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-surface-750 bg-surface-900/80 backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-4 w-4 text-brand-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">
              Offers &amp; Effective Price Calculation
            </h3>
            {hasMockOffers && (
              <Badge variant="default" size="sm" className="text-[10px] uppercase font-mono">
                Sample Offers
              </Badge>
            )}
          </div>
          <p className="text-xs text-surface-400">
            {retailerName ? `Verified deals for ${retailerName}` : "Transparent discount calculation engine"}
          </p>
        </div>

        {hasOffers && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Potential Savings: {formatCurrency(calc.savings, currency)}</span>
          </div>
        )}
      </div>

      {/* State 1: No Verified Offers */}
      {!hasOffers ? (
        <div className="p-4 rounded-xl bg-surface-950/60 border border-surface-800 text-center space-y-1">
          <p className="text-xs text-surface-300 font-semibold">
            No verified offers available
          </p>
          <p className="text-[11px] text-surface-500">
            Standard Listed Price applies at checkout ({formatCurrency(calc.listedPrice, currency)}).
          </p>
        </div>
      ) : (
        /* State 2: Applied Offers List */
        <div className="space-y-3">
          <div className="text-xs font-bold text-surface-300 uppercase tracking-wider">
            Available Store &amp; Bank Offers ({calc.appliedOffers.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {calc.appliedOffers.map((offer) => (
              <div
                key={offer.offerId}
                className="p-3.5 rounded-xl border border-surface-800 bg-surface-950/60 flex items-start gap-3 transition-all hover:border-surface-700"
              >
                <div className="p-2 rounded-lg bg-surface-900 border border-surface-750 shrink-0">
                  {getOfferIcon(offer.offerType)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white leading-tight">
                      {offer.title}
                    </span>
                    {offer.couponCode && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold shrink-0">
                        {offer.couponCode}
                      </span>
                    )}
                  </div>
                  {offer.description && (
                    <p className="text-[11px] text-surface-400 leading-snug line-clamp-2">
                      {offer.description}
                    </p>
                  )}
                  <div className="text-[11px] font-semibold text-brand-300 flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>
                      {offer.offerType === "cashback"
                        ? `₹${(offer.amount || 0).toLocaleString()} Potential Cashback`
                        : offer.offerType === "exchange_offer"
                        ? `Up to ₹${(offer.exchangeMaxAmount || 8000).toLocaleString()} Exchange Benefit`
                        : `Save ${formatCurrency(offer.amount || offer.maxDiscount || 0, currency)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transparent Calculation Summary Box */}
          <div className="mt-4 p-4 rounded-xl border border-surface-750 bg-surface-950/80 space-y-3 font-sans">
            <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-surface-800 flex items-center justify-between">
              <span>Transparent Price Summary</span>
              <span className="text-[10px] font-mono text-surface-400 uppercase">INR Currency</span>
            </div>

            {/* 1. Listed Price */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-surface-400 font-medium">Listed Price:</span>
              <span className="text-white font-semibold">{formatCurrency(calc.listedPrice, currency)}</span>
            </div>

            {/* 2. Instant Discounts */}
            {calc.instantDiscount > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-400">
                <span className="font-medium flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Instant Discount (Bank &amp; Coupons):
                </span>
                <span className="font-bold">-{formatCurrency(calc.instantDiscount, currency)}</span>
              </div>
            )}

            {/* 3. Pay Now (Checkout Amount) */}
            <div className="p-3 rounded-lg bg-surface-900 border border-surface-700 flex items-center justify-between text-sm sm:text-base font-bold">
              <span className="text-white flex items-center gap-2">
                Pay Now
                <span className="text-[11px] font-normal text-surface-400">(Charged at checkout)</span>
              </span>
              <span className="text-white text-base sm:text-lg">{formatCurrency(calc.payNowPrice, currency)}</span>
            </div>

            {/* 4. Cashback Notice */}
            {calc.potentialCashback > 0 && (
              <div className="flex items-center justify-between text-xs text-cyan-300">
                <span className="font-medium flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-cyan-400" />
                  Potential Cashback (Credited post-purchase):
                </span>
                <span className="font-bold">-{formatCurrency(calc.potentialCashback, currency)}</span>
              </div>
            )}

            {/* 5. Exchange Offer Notice */}
            {calc.potentialExchange > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-300">
                <span className="font-medium flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                  Exchange Benefit:
                </span>
                <span className="font-bold">Up to ₹{calc.potentialExchange.toLocaleString()}</span>
              </div>
            )}

            {/* 6. Potential Effective Value */}
            <div className="pt-2 border-t border-surface-800 flex items-center justify-between text-sm sm:text-base font-bold">
              <span className="text-brand-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-400" />
                Effective Value
                <span className="text-[11px] font-normal text-surface-400">(After cashback)</span>
              </span>
              <span className="text-brand-300 text-lg sm:text-xl font-extrabold">{formatCurrency(calc.effectivePrice, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimers & Language Compliance */}
      <div className="rounded-xl border border-surface-800/80 bg-surface-950/40 p-3 text-[11px] text-surface-400 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 text-surface-500 shrink-0 mt-0.5" />
        <span>
          <strong>Price Transparency:</strong> Pay Now represents the immediate total charged by the retailer. Cashback credits and exchange benefits are verified post-purchase items and do not reduce the immediate checkout charge.
        </span>
      </div>
    </Card>
  );
}
