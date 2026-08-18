import { DiscountOffer } from "@/types";
import { OfferEvaluationContext, EligibilityResult } from "./types";

/**
 * Checks eligibility and calculates the monetary value of a single discount offer.
 * Enforces verified status, minimum purchase, date range, bank name, payment method, and capping rules.
 */
export function checkOfferEligibility(
  offer: DiscountOffer,
  listedPrice: number,
  context: OfferEvaluationContext = {}
): EligibilityResult {
  // 1. Must be verified
  if (!offer.verified && !offer.isMock) {
    return {
      isEligible: false,
      reason: "Offer is unverified by official retailer feed",
      calculatedDiscount: 0,
    };
  }

  // 2. Minimum Purchase Threshold
  if (offer.minPurchase && listedPrice < offer.minPurchase) {
    return {
      isEligible: false,
      reason: `Minimum purchase of ₹${offer.minPurchase.toLocaleString()} required`,
      calculatedDiscount: 0,
    };
  }

  // 3. Date Validity Window
  if (context.currentDate) {
    if (offer.startDate && context.currentDate < offer.startDate) {
      return {
        isEligible: false,
        reason: `Offer has not started yet (valid from ${offer.startDate})`,
        calculatedDiscount: 0,
      };
    }
    if (offer.endDate && context.currentDate > offer.endDate) {
      return {
        isEligible: false,
        reason: `Offer expired on ${offer.endDate}`,
        calculatedDiscount: 0,
      };
    }
  }

  // 4. Bank Name Matching (if both offer and context specify a bank)
  if (offer.bankName && context.bankName) {
    const offerBank = offer.bankName.toLowerCase().trim();
    const userBank = context.bankName.toLowerCase().trim();
    if (!offerBank.includes(userBank) && !userBank.includes(offerBank)) {
      return {
        isEligible: false,
        reason: `Requires ${offer.bankName} payment instrument`,
        calculatedDiscount: 0,
      };
    }
  }

  // 5. Payment Method Matching (if specified)
  if (offer.paymentMethod && offer.paymentMethod !== "any" && context.paymentMethod) {
    const offerMethod = offer.paymentMethod.toLowerCase().trim();
    const userMethod = context.paymentMethod.toLowerCase().trim();
    if (offerMethod !== userMethod) {
      return {
        isEligible: false,
        reason: `Requires ${offer.paymentMethod} payment method`,
        calculatedDiscount: 0,
      };
    }
  }

  // 6. Coupon Code Matching (if coupon type requires code)
  if (offer.offerType === "coupon" && offer.couponCode && context.userCoupon) {
    if (offer.couponCode.toLowerCase().trim() !== context.userCoupon.toLowerCase().trim()) {
      return {
        isEligible: false,
        reason: `Coupon code '${context.userCoupon}' does not match required code '${offer.couponCode}'`,
        calculatedDiscount: 0,
      };
    }
  }

  // 7. Calculate Monetary Value & Caps
  let calculatedDiscount = 0;

  if (offer.offerType === "exchange_offer") {
    // Exchange max is NOT deducted automatically!
    // Only apply verified exchange value if provided in context
    calculatedDiscount = context.exchangeValue || 0;
  } else if (typeof offer.amount === "number" && offer.amount > 0) {
    calculatedDiscount = offer.amount;
  } else if (typeof offer.percentage === "number" && offer.percentage > 0) {
    const rawDiscount = (offer.percentage / 100) * listedPrice;
    if (offer.maxDiscount && offer.maxDiscount > 0) {
      calculatedDiscount = Math.min(rawDiscount, offer.maxDiscount);
    } else {
      calculatedDiscount = rawDiscount;
    }
  }

  // Prevent negative prices or excessive discounts
  calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, listedPrice));

  return {
    isEligible: true,
    calculatedDiscount: Math.round(calculatedDiscount),
  };
}
