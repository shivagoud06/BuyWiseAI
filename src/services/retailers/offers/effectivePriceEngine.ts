import { DiscountOffer, CurrencyCode, CountryCode, RetailerId } from "@/types";
import { OfferEvaluationContext, EffectivePriceCalculation, RetailerEffectiveOption } from "./types";
import { calculateBestOfferCombination } from "./stacking";
import { checkOfferEligibility } from "./eligibility";

/**
 * Deterministic Effective Price Calculation Engine
 * 
 * Calculates exact instant discounts, Pay Now price, potential cashback, exchange benefits,
 * and final Effective Value.
 * 
 * Formulas:
 * - Pay Now = Listed Price - Instant Discounts (Retailer + Bank + Coupon)
 * - Potential Cashback = Sum of eligible cashback offers (Separated from Pay Now)
 * - Effective Value = Pay Now - Potential Cashback
 * - Total Savings = Listed Price - Effective Value
 */
export function calculateEffectivePrice(
  listedPrice: number | null | undefined,
  offers: DiscountOffer[] | undefined | null,
  context: OfferEvaluationContext = {}
): EffectivePriceCalculation {
  const basePrice = typeof listedPrice === "number" && !isNaN(listedPrice) && listedPrice > 0 ? listedPrice : 0;
  const rawOffers = Array.isArray(offers) ? offers : [];

  if (basePrice === 0) {
    return {
      listedPrice: 0,
      instantDiscount: 0,
      payNowPrice: 0,
      potentialCashback: 0,
      potentialExchange: 0,
      effectivePrice: 0,
      totalDiscount: 0,
      savings: 0,
      appliedOffers: [],
      excludedOffers: [],
      breakdown: {
        retailerDiscount: 0,
        bankDiscount: 0,
        couponDiscount: 0,
        cashbackAmount: 0,
        exchangeAmount: 0,
      },
    };
  }

  // 1. Perform deterministic stacking evaluation
  const stacking = calculateBestOfferCombination(rawOffers, basePrice, context);

  // 2. Breakdown per offer type
  let retailerDiscount = 0;
  let bankDiscount = 0;
  let couponDiscount = 0;
  let cashbackAmount = 0;
  let exchangeAmount = 0;

  for (const offer of stacking.appliedOffers) {
    const res = checkOfferEligibility(offer, basePrice, context);
    if (res.isEligible) {
      switch (offer.offerType) {
        case "retailer_discount":
          retailerDiscount += res.calculatedDiscount;
          break;
        case "bank_offer":
          bankDiscount += res.calculatedDiscount;
          break;
        case "coupon":
          couponDiscount += res.calculatedDiscount;
          break;
        case "cashback":
          cashbackAmount += res.calculatedDiscount;
          break;
        case "exchange_offer":
          exchangeAmount += res.calculatedDiscount;
          break;
      }
    }
  }

  const totalInstantDiscount = Math.min(basePrice, retailerDiscount + bankDiscount + couponDiscount);
  const payNowPrice = Math.max(0, basePrice - totalInstantDiscount);
  
  // Cashback is NOT deducted at checkout; it reduces Effective Value post-purchase
  const potentialCashback = cashbackAmount;
  const potentialExchange = exchangeAmount;

  const effectivePrice = Math.max(0, payNowPrice - potentialCashback);
  const totalDiscount = Math.max(0, basePrice - effectivePrice);

  return {
    listedPrice: basePrice,
    instantDiscount: totalInstantDiscount,
    payNowPrice,
    potentialCashback,
    potentialExchange,
    effectivePrice,
    totalDiscount,
    savings: totalDiscount,
    appliedOffers: stacking.appliedOffers,
    excludedOffers: stacking.excludedOffers,
    breakdown: {
      retailerDiscount,
      bankDiscount,
      couponDiscount,
      cashbackAmount,
      exchangeAmount,
    },
  };
}

/**
 * Finds the retailer offer that yields the lowest Effective Value for a product
 * after applying all eligible discounts and bank offers.
 * 
 * Enforces currency and market boundary rules.
 */
export function getBestEffectivePrice(
  retailerOptions: {
    retailerId: RetailerId;
    retailerName: string;
    listedPrice: number;
    currency: CurrencyCode;
    countryCode?: CountryCode;
    offers?: DiscountOffer[];
  }[],
  targetCurrency: CurrencyCode = "INR",
  targetCountry?: CountryCode,
  context: OfferEvaluationContext = {}
): RetailerEffectiveOption | null {
  if (!retailerOptions || !Array.isArray(retailerOptions) || retailerOptions.length === 0) {
    return null;
  }

  // Filter for valid listed prices matching target currency and country
  const eligibleRetailers = retailerOptions.filter((r) => {
    if (typeof r.listedPrice !== "number" || isNaN(r.listedPrice) || r.listedPrice <= 0) {
      return false;
    }
    if (targetCurrency && r.currency !== targetCurrency) {
      return false;
    }
    if (targetCountry && r.countryCode && r.countryCode !== targetCountry) {
      return false;
    }
    return true;
  });

  if (eligibleRetailers.length === 0) {
    return null;
  }

  // Calculate effective price for each retailer option
  const evaluated: RetailerEffectiveOption[] = eligibleRetailers.map((r) => {
    const calculation = calculateEffectivePrice(r.listedPrice, r.offers || [], context);
    return {
      retailerId: r.retailerId,
      retailerName: r.retailerName,
      listedPrice: r.listedPrice,
      currency: r.currency,
      calculation,
    };
  });

  // Sort ascending by Effective Price, then by Pay Now Price
  evaluated.sort((a, b) => {
    if (a.calculation.effectivePrice !== b.calculation.effectivePrice) {
      return a.calculation.effectivePrice - b.calculation.effectivePrice;
    }
    return a.calculation.payNowPrice - b.calculation.payNowPrice;
  });

  return evaluated[0] || null;
}
