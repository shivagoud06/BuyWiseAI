import { DiscountOffer } from "@/types";
import { OfferEvaluationContext } from "./types";
import { checkOfferEligibility } from "./eligibility";

export interface StackingEvaluation {
  appliedOffers: DiscountOffer[];
  excludedOffers: { offer: DiscountOffer; reason: string }[];
  instantDiscount: number;
  cashbackAmount: number;
  exchangeAmount: number;
}

/**
 * Deterministically evaluates a set of eligible offers and calculates the optimal combination based on stacking rules.
 * 
 * Rules:
 * - Stackable offers (stackable: true) can be combined together.
 * - Non-stackable offers (stackable: false) cannot be combined with other non-stackable offers of the same category.
 * - Evaluates combinations to pick the optimal valid set yielding highest customer savings.
 */
export function calculateBestOfferCombination(
  rawOffers: DiscountOffer[],
  listedPrice: number,
  context: OfferEvaluationContext = {}
): StackingEvaluation {
  const appliedOffers: DiscountOffer[] = [];
  const excludedOffers: { offer: DiscountOffer; reason: string }[] = [];

  if (!rawOffers || !Array.isArray(rawOffers) || rawOffers.length === 0) {
    return {
      appliedOffers: [],
      excludedOffers: [],
      instantDiscount: 0,
      cashbackAmount: 0,
      exchangeAmount: 0,
    };
  }

  // 1. Separate into eligible vs ineligible
  const eligibleItems: { offer: DiscountOffer; value: number }[] = [];

  for (const offer of rawOffers) {
    const res = checkOfferEligibility(offer, listedPrice, context);
    if (res.isEligible && res.calculatedDiscount >= 0) {
      eligibleItems.push({ offer, value: res.calculatedDiscount });
    } else {
      excludedOffers.push({ offer, reason: res.reason || "Offer conditions not satisfied" });
    }
  }

  if (eligibleItems.length === 0) {
    return {
      appliedOffers: [],
      excludedOffers,
      instantDiscount: 0,
      cashbackAmount: 0,
      exchangeAmount: 0,
    };
  }

  // Group by category/stackability
  const stackableItems = eligibleItems.filter((i) => i.offer.stackable);
  const nonStackableItems = eligibleItems.filter((i) => !i.offer.stackable);

  // Calculate base stackable value
  let instantDiscount = 0;
  let cashbackAmount = 0;
  let exchangeAmount = 0;

  // Add all eligible stackable offers
  for (const item of stackableItems) {
    appliedOffers.push(item.offer);
    if (item.offer.offerType === "cashback") {
      cashbackAmount += item.value;
    } else if (item.offer.offerType === "exchange_offer") {
      exchangeAmount += item.value;
    } else {
      instantDiscount += item.value;
    }
  }

  // If there are non-stackable offers, evaluate which single non-stackable offer (or non-stackable group) yields highest savings
  if (nonStackableItems.length > 0) {
    // Sort non-stackable items descending by monetary value
    const sortedNonStackable = [...nonStackableItems].sort((a, b) => b.value - a.value);

    // Group non-stackable by offerType (e.g. Bank offer vs Coupon vs Retailer Discount)
    // A user can pick the best non-stackable bank offer, best non-stackable coupon, etc. if different types don't conflict,
    // or pick the single highest value non-stackable offer if global non-stackable restriction applies.
    
    // We pick the best non-stackable offer per distinct offerType if applicable, or best overall non-stackable item
    const pickedTypes = new Set<string>();

    for (const item of sortedNonStackable) {
      if (!pickedTypes.has(item.offer.offerType)) {
        pickedTypes.add(item.offer.offerType);
        appliedOffers.push(item.offer);

        if (item.offer.offerType === "cashback") {
          cashbackAmount += item.value;
        } else if (item.offer.offerType === "exchange_offer") {
          exchangeAmount += item.value;
        } else {
          instantDiscount += item.value;
        }
      } else {
        excludedOffers.push({
          offer: item.offer,
          reason: `Non-stackable offer replaced by higher value ${item.offer.offerType}`,
        });
      }
    }
  }

  // Capping instant discount so pay now cannot drop below ₹0
  instantDiscount = Math.min(instantDiscount, listedPrice);

  return {
    appliedOffers,
    excludedOffers,
    instantDiscount: Math.round(instantDiscount),
    cashbackAmount: Math.round(cashbackAmount),
    exchangeAmount: Math.round(exchangeAmount),
  };
}
