import {
  RetailerOffer,
  RetailerId,
  CurrencyCode,
  CountryCode,
  AvailabilityStatus,
  OfferSourceType,
} from "@/types";
import { RETAILER_REGISTRY } from "./registry";

export interface RawRetailerInput {
  retailerId: string;
  retailerName?: string;
  countryCode?: string;
  price: number | string;
  mrp?: number | string | null;
  discount?: number | string | null;
  currency?: string;
  productUrl?: string | null;
  affiliateUrl?: string | null;
  availability?: string;
  lastUpdated?: string | Date;
  offerText?: string;
  affiliateEligible?: boolean;
  source?: OfferSourceType | string;
  isMock?: boolean;
  matchedSku?: string;
  matchedModel?: string;
  discounts?: unknown[];
}

/**
 * Parses numeric price from numbers or formatted strings (e.g., "₹74,999", "74999.00")
 */
export function parsePrice(val: unknown): number | null {
  if (typeof val === "number") {
    return isFinite(val) && val > 0 ? val : null;
  }
  if (typeof val === "string") {
    // Strip currency symbols, commas, spaces
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

/**
 * Normalizes availability status into standard BuyWise AvailabilityStatus
 */
export function normalizeAvailability(val: unknown): AvailabilityStatus {
  if (typeof val !== "string") return "out-of-stock";
  const s = val.toLowerCase().trim().replace(/[_\s]+/g, "-");

  if (s === "in-stock" || s === "available" || s === "instock" || s === "in-stock-online") {
    return "in-stock";
  }
  if (s === "limited-stock" || s === "few-left" || s === "low-stock") {
    return "limited-stock";
  }
  if (s === "pre-order" || s === "preorder" || s === "backorder") {
    return "pre-order";
  }
  return "out-of-stock";
}

/**
 * Normalizes currency string into standard CurrencyCode
 */
export function normalizeCurrency(val: unknown, fallback: CurrencyCode = "INR"): CurrencyCode {
  if (typeof val !== "string") return fallback;
  const s = val.toUpperCase().trim();
  if (s === "INR" || s === "₹" || s === "RS" || s === "RS.") return "INR";
  if (s === "USD" || s === "$") return "USD";
  if (s === "GBP" || s === "£") return "GBP";
  if (s === "EUR" || s === "€") return "EUR";
  return fallback;
}

/**
 * Validates and cleans URL strings, returning null for invalid or unsafe protocols
 */
export function normalizeUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Central Retailer Offer Normalizer
 * Normalizes raw vendor/API responses into standard BuyWise RetailerOffer structure.
 */
export function normalizeRetailerOffer(raw: RawRetailerInput): RetailerOffer | null {
  if (!raw || typeof raw !== "object") return null;

  const retailerId = raw.retailerId as RetailerId;
  const regInfo = RETAILER_REGISTRY[retailerId];
  const retailerName = raw.retailerName || regInfo?.name || retailerId;

  const price = parsePrice(raw.price);
  if (price === null) return null;

  const mrp = parsePrice(raw.mrp);
  const currency = normalizeCurrency(raw.currency || regInfo?.currency, regInfo?.currency || "INR");
  const countryCode = (raw.countryCode || regInfo?.countryCode || "IN") as CountryCode;
  const availability = normalizeAvailability(raw.availability);

  // Compute percentage discount if mrp > price
  let discount: number | null = null;
  if (mrp && mrp > price) {
    discount = Math.round(((mrp - price) / mrp) * 100);
  } else if (raw.discount !== undefined && raw.discount !== null) {
    const d = parsePrice(raw.discount);
    if (d !== null && d <= 100) discount = d;
  }

  // Format ISO timestamp
  let lastUpdated = new Date().toISOString().split("T")[0];
  if (raw.lastUpdated) {
    if (raw.lastUpdated instanceof Date) {
      lastUpdated = raw.lastUpdated.toISOString().split("T")[0];
    } else if (typeof raw.lastUpdated === "string" && raw.lastUpdated.trim().length > 0) {
      lastUpdated = raw.lastUpdated.trim();
    }
  }

  const productUrl = normalizeUrl(raw.productUrl);
  const affiliateUrl = normalizeUrl(raw.affiliateUrl);

  const offer: RetailerOffer = {
    retailerId,
    retailerName,
    countryCode,
    price,
    mrp,
    discount,
    currency,
    productUrl,
    affiliateUrl,
    availability,
    lastUpdated,
    offerText: raw.offerText || undefined,
    affiliateEligible: raw.affiliateEligible ?? (Boolean(affiliateUrl) && (regInfo?.affiliateSupported ?? false)),
    source: (raw.source as OfferSourceType) || "official_api",
    isMock: raw.isMock ?? false,
    matchedSku: raw.matchedSku || undefined,
    matchedModel: raw.matchedModel || undefined,
  };

  return offer;
}

/**
 * Normalizes an array of raw retailer responses
 */
export function normalizeRetailerOffers(rawList: unknown[]): RetailerOffer[] {
  if (!Array.isArray(rawList)) return [];
  const normalized: RetailerOffer[] = [];

  for (const raw of rawList) {
    const offer = normalizeRetailerOffer(raw as RawRetailerInput);
    if (offer) {
      normalized.push(offer);
    }
  }

  return normalized;
}
