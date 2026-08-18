import { DiscountOffer, CurrencyCode, CountryCode, RetailerId } from "@/types";

export interface OfferEvaluationContext {
  paymentMethod?: string | null;
  bankName?: string | null;
  cardType?: string | null;
  userCoupon?: string | null;
  exchangeValue?: number | null;
  currentDate?: string | null; // YYYY-MM-DD format
}

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  calculatedDiscount: number; // Nominal instant discount, cashback, or exchange benefit value
}

export interface EffectivePriceCalculation {
  listedPrice: number;
  instantDiscount: number; // Sum of instant retailer discounts, bank offers, and coupons
  payNowPrice: number; // listedPrice - instantDiscount (amount charged at checkout)
  potentialCashback: number; // Post-purchase cashback credit
  potentialExchange: number; // Potential exchange benefit value
  effectivePrice: number; // payNowPrice - potentialCashback (Effective Value)
  totalDiscount: number; // listedPrice - effectivePrice
  savings: number; // listedPrice - effectivePrice
  appliedOffers: DiscountOffer[];
  excludedOffers: { offer: DiscountOffer; reason: string }[];
  breakdown: {
    retailerDiscount: number;
    bankDiscount: number;
    couponDiscount: number;
    cashbackAmount: number;
    exchangeAmount: number;
  };
}

export interface RetailerEffectiveOption {
  retailerId: RetailerId;
  retailerName: string;
  listedPrice: number;
  currency: CurrencyCode;
  calculation: EffectivePriceCalculation;
}
