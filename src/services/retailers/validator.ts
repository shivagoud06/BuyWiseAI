import { RetailerOffer, Laptop, RetailerId, CurrencyCode, CountryCode, AvailabilityStatus } from "@/types";
import { ValidationResult, ValidationIssue } from "./types";
import { matchOfferToProduct } from "./matcher";

import { RETAILER_REGISTRY } from "./registry";

const VALID_RETAILER_IDS: Set<RetailerId> = new Set<RetailerId>(
  Object.keys(RETAILER_REGISTRY) as RetailerId[]
);

const VALID_CURRENCIES: Set<CurrencyCode> = new Set<CurrencyCode>([
  "INR",
  "USD",
  "GBP",
  "EUR",
  "OTHER",
]);

const VALID_COUNTRY_CODES: Set<CountryCode> = new Set<CountryCode>([
  "IN",
  "US",
  "UK",
  "EU",
  "OTHER",
]);

const VALID_AVAILABILITY: Set<AvailabilityStatus> = new Set<AvailabilityStatus>([
  "in-stock",
  "out-of-stock",
  "limited-stock",
  "pre-order",
]);

/**
 * Validates a single retailer offer against schema and product constraints.
 * Rejects invalid prices, missing currencies, invalid URLs, and mismatched configurations.
 */
export function validateRetailerOffer(
  rawOffer: unknown,
  expectedProduct?: Laptop
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!rawOffer || typeof rawOffer !== "object") {
    return {
      isValid: false,
      offer: null,
      issues: [{ field: "root", message: "Offer must be a non-null object", receivedValue: rawOffer }],
    };
  }

  const o = rawOffer as Partial<RetailerOffer>;

  // 1. Retailer ID & Name
  if (!o.retailerId || !VALID_RETAILER_IDS.has(o.retailerId as RetailerId)) {
    issues.push({ field: "retailerId", message: "Invalid or unsupported retailer ID", receivedValue: o.retailerId });
  }

  if (!o.retailerName || typeof o.retailerName !== "string" || o.retailerName.trim().length === 0) {
    issues.push({ field: "retailerName", message: "Retailer name must be a non-empty string", receivedValue: o.retailerName });
  }

  // 2. Price Validation (must be positive numeric > 0)
  if (o.price === null || o.price === undefined || typeof o.price !== "number" || isNaN(o.price) || o.price <= 0) {
    issues.push({ field: "price", message: "Price must be a positive numeric amount > 0", receivedValue: o.price });
  }

  // 3. Currency Validation
  if (!o.currency || !VALID_CURRENCIES.has(o.currency as CurrencyCode)) {
    issues.push({ field: "currency", message: "Invalid or missing currency code", receivedValue: o.currency });
  }

  // 4. Country Code Validation (if present, must be valid; defaults/inferred from currency if applicable)
  if (o.countryCode && !VALID_COUNTRY_CODES.has(o.countryCode as CountryCode)) {
    issues.push({ field: "countryCode", message: "Invalid country code", receivedValue: o.countryCode });
  }

  // 5. Availability Validation
  if (!o.availability || !VALID_AVAILABILITY.has(o.availability as AvailabilityStatus)) {
    issues.push({ field: "availability", message: "Invalid or missing availability status", receivedValue: o.availability });
  }

  // 6. URL Validation (if present, must be valid format with http/https)
  if (o.productUrl !== undefined && o.productUrl !== null && typeof o.productUrl === "string" && o.productUrl.trim().length > 0) {
    try {
      const url = new URL(o.productUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        issues.push({ field: "productUrl", message: "productUrl must use http or https protocol", receivedValue: o.productUrl });
      }
    } catch {
      issues.push({ field: "productUrl", message: "productUrl is not a valid URL format", receivedValue: o.productUrl });
    }
  }

  if (o.affiliateUrl !== undefined && o.affiliateUrl !== null && typeof o.affiliateUrl === "string" && o.affiliateUrl.trim().length > 0) {
    try {
      const url = new URL(o.affiliateUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        issues.push({ field: "affiliateUrl", message: "affiliateUrl must use http or https protocol", receivedValue: o.affiliateUrl });
      }
    } catch {
      issues.push({ field: "affiliateUrl", message: "affiliateUrl is not a valid URL format", receivedValue: o.affiliateUrl });
    }
  }

  // 7. Last Updated Validation
  if (!o.lastUpdated || typeof o.lastUpdated !== "string" || o.lastUpdated.trim().length === 0) {
    issues.push({ field: "lastUpdated", message: "lastUpdated timestamp is required", receivedValue: o.lastUpdated });
  }

  // 8. Reject mock/sample offers in production validation
  if (o.isMock || o.source === "mock") {
    issues.push({
      field: "source",
      message: "Mock and sample offers are not permitted as live retailer offers in production",
      receivedValue: { isMock: o.isMock, source: o.source },
    });
  }

  // 9. Exact Product Configuration Matching (if expectedProduct is passed)
  if (expectedProduct && issues.length === 0) {
    const match = matchOfferToProduct(o as RetailerOffer, expectedProduct);
    if (!match.isMatch) {
      issues.push({
        field: "productMatch",
        message: match.reasons.join("; "),
        receivedValue: { matchedSku: o.matchedSku, matchedModel: o.matchedModel, offerText: o.offerText },
      });
    }
  }

  const isValid = issues.length === 0;

  let validatedOffer: RetailerOffer | null = null;
  if (isValid) {
    validatedOffer = {
      ...(o as RetailerOffer),
      productId: expectedProduct?.id || o.productId,
      isVerified: true,
      lastVerified: o.lastVerified || o.lastUpdated || new Date().toISOString().split("T")[0],
    };
  }

  return {
    isValid,
    offer: validatedOffer,
    issues,
  };
}

/**
 * Validates a list of offers and returns only valid, compliant offers
 */
export function validateRetailerOffers(
  rawOffers: unknown[],
  expectedProduct?: Laptop
): RetailerOffer[] {
  if (!Array.isArray(rawOffers)) return [];

  const validOffers: RetailerOffer[] = [];

  for (const raw of rawOffers) {
    const res = validateRetailerOffer(raw, expectedProduct);
    if (res.isValid && res.offer) {
      validOffers.push(res.offer);
    }
  }

  return validOffers;
}
