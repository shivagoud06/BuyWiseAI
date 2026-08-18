import { RetailerOffer, CurrencyCode, CountryCode } from "@/types";
import { validateRetailerOffer } from "./validator";

/**
 * Deterministically finds the lowest available listed price among valid retailer offers.
 * Ignores out-of-stock listings, null/zero/invalid prices, and invalid offers.
 * Compares only offers within the same currency and country/market.
 * 
 * Naming note: Strictly returns "Best Listed Price" (NOT "Best Deal").
 */
export function getBestListedPrice(
  offers: RetailerOffer[] | undefined | null,
  targetCurrency?: CurrencyCode,
  targetCountry?: CountryCode
): RetailerOffer | null {
  if (!offers || !Array.isArray(offers) || offers.length === 0) {
    return null;
  }

  // 1. Filter for valid and in-stock offers matching currency and country constraints
  const eligibleOffers = offers.filter((offer) => {
    // Validate schema
    const validation = validateRetailerOffer(offer);
    if (!validation.isValid || !validation.offer) {
      return false;
    }

    const validOffer = validation.offer;

    // Price must be numeric and > 0
    if (typeof validOffer.price !== "number" || isNaN(validOffer.price) || validOffer.price <= 0) {
      return false;
    }

    // Must be available (in-stock, limited-stock, pre-order); exclude out-of-stock
    if (validOffer.availability === "out-of-stock") {
      return false;
    }

    // Must match requested currency if specified
    if (targetCurrency && validOffer.currency !== targetCurrency) {
      return false;
    }

    // Must match requested country if specified
    if (targetCountry && validOffer.countryCode && validOffer.countryCode !== targetCountry) {
      return false;
    }

    return true;
  });

  if (eligibleOffers.length === 0) {
    return null;
  }

  // If no target currency was specified, group by the first offer's currency to avoid mixed-currency comparison
  const baseCurrency = targetCurrency || eligibleOffers[0].currency;
  const currencyFiltered = eligibleOffers.filter((o) => o.currency === baseCurrency);

  if (currencyFiltered.length === 0) {
    return null;
  }

  // 2. Sort ascending by price to find the lowest listed offer
  const sorted = [...currencyFiltered].sort((a, b) => a.price - b.price);
  return sorted[0] || null;
}
