import { Laptop, RetailerOffer, CountryCode, RetailerId, RetailerInfo, RetailerState } from "@/types";
import { RetailerAdapter, RetailerQuery, RetailerProvider, ValidationResult } from "./types";
import { AmazonAdapter } from "./adapters/amazon";
import { FlipkartAdapter } from "./adapters/flipkart";
import { CromaAdapter } from "./adapters/croma";
import { RelianceDigitalAdapter } from "./adapters/relianceDigital";
import { VijaySalesAdapter } from "./adapters/vijaySales";
import { OfficialStoreAdapter } from "./adapters/officialStore";
import { EbayAdapter } from "./adapters/ebay";
import { QuickCommerceAdapter } from "./adapters/quickcommerce";
import { normalizeRetailerOffers } from "./normalizer";
import { validateRetailerOffers, validateRetailerOffer } from "./validator";
import { getBestListedPrice } from "./priceComparison";
import { RETAILER_REGISTRY, getRetailerInfo, getRetailersForCountry } from "./registry";
import { resolveRetailerClickUrl } from "./affiliateResolver";

export * from "./types";
export * from "./registry";
export * from "./matcher";
export * from "./validator";
export * from "./normalizer";
export * from "./priceComparison";
export * from "./offers";
export * from "./adapters/amazon";
export * from "./adapters/flipkart";
export * from "./adapters/croma";
export * from "./adapters/relianceDigital";
export * from "./adapters/vijaySales";
export * from "./adapters/officialStore";
export * from "./adapters/ebay";
export * from "./adapters/quickcommerce";
export * from "./affiliateResolver";

export const ALL_RETAILER_ADAPTERS: RetailerAdapter[] = [
  AmazonAdapter,
  FlipkartAdapter,
  CromaAdapter,
  RelianceDigitalAdapter,
  VijaySalesAdapter,
  OfficialStoreAdapter,
  EbayAdapter,
  QuickCommerceAdapter,
];

const DEFAULT_ADAPTER_TIMEOUT_MS = 3500;

/**
 * Executes a retailer adapter with strict timeout and error boundary isolation.
 * If an adapter times out or throws an exception, it is logged and returns [] without crashing other retailers.
 */
async function executeAdapterSafe(
  adapter: RetailerAdapter,
  query: RetailerQuery,
  timeoutMs: number = DEFAULT_ADAPTER_TIMEOUT_MS
): Promise<RetailerOffer[]> {
  try {
    const fetchPromise = adapter.getOffers(query);
    const timeoutPromise = new Promise<RetailerOffer[]>((_, reject) =>
      setTimeout(() => reject(new Error(`Adapter timeout (${adapter.id})`)), timeoutMs)
    );

    const rawOffers = await Promise.race([fetchPromise, timeoutPromise]);
    // Normalize raw offers before validation
    const normalizedOffers = normalizeRetailerOffers(rawOffers);
    return normalizedOffers;
  } catch (error) {
    // Isolated adapter error handling: never break the whole page
    if (process.env.NODE_ENV === "development") {
      console.warn(`[RetailerPipeline] Error in adapter ${adapter.id}:`, error instanceof Error ? error.message : "Unknown error");
    }
    return [];
  }
}

/**
 * Central Retailer Data Pipeline Execution:
 * Retailer Adapter → Normalize Response → Exact Product Matcher → Offer Validator → Verified RetailerOffer[]
 */
export async function getRetailerOffers(
  product: Laptop,
  countryCode: CountryCode = "IN",
  options?: { timeoutMs?: number }
): Promise<RetailerOffer[]> {
  const query: RetailerQuery = {
    product,
    countryCode,
    currency: countryCode === "IN" ? "INR" : "USD",
  };

  const matchingAdapters = ALL_RETAILER_ADAPTERS.filter(
    (a) => a.countryCode === countryCode
  );

  const offerPromises = matchingAdapters.map((adapter) =>
    executeAdapterSafe(adapter, query, options?.timeoutMs)
  );

  const nestedOffers = await Promise.all(offerPromises);
  const rawCombined = nestedOffers.flat();

  // Exact matching & validation pipeline on live adapter responses
  return validateRetailerOffers(rawCombined, product);
}

export type RetailerButtonState = "BUY_NOW" | "NOT_AVAILABLE" | "COMING_SOON";

export interface RetailerOfferStatusResult {
  status: RetailerButtonState;
  state: RetailerState;
  buttonLabel: string;
  isClickable: boolean;
  targetUrl: string | null;
  clickType: "affiliate" | "product" | null;
}

/**
 * Resolves the standardized lifecycle state of a retailer offer
 */
export function getRetailerOfferState(
  offer?: RetailerOffer | null,
  isValidated: boolean = true
): RetailerState {
  if (!offer || offer.isMock || offer.source === "mock") {
    return "COMING_SOON";
  }
  if (!isValidated && offer.isVerified === false) {
    return "COMING_SOON";
  }
  if (offer.availability === "out-of-stock") {
    return "UNAVAILABLE";
  }
  if (!offer.price || offer.price <= 0) {
    return "COMING_SOON";
  }
  const { targetUrl } = resolveRetailerClickUrl(offer);
  if (!targetUrl) {
    return "COMING_SOON";
  }
  return "LIVE";
}

/**
 * Central Retailer Status Priority Engine
 * Priority:
 * 1. Exact validated live offer + in_stock + valid positive price + valid URL -> BUY NOW (LIVE)
 * 2. Exact validated live offer + out_of_stock -> NOT AVAILABLE (UNAVAILABLE)
 * 3. No validated live offer from that retailer/platform -> COMING SOON (COMING_SOON)
 *
 * CRITICAL RULE: The retailer's registry connectionStatus NEVER overrides a validated live RetailerOffer.
 */
export function resolveRetailerOfferStatus(offer?: RetailerOffer | null): RetailerOfferStatusResult {
  if (!offer || offer.isMock || offer.source === "mock") {
    return {
      status: "COMING_SOON",
      state: "COMING_SOON",
      buttonLabel: "COMING SOON",
      isClickable: false,
      targetUrl: null,
      clickType: null,
    };
  }

  // 2. Out of stock live offer -> NOT AVAILABLE
  if (offer.availability === "out-of-stock") {
    return {
      status: "NOT_AVAILABLE",
      state: "UNAVAILABLE",
      buttonLabel: "NOT AVAILABLE",
      isClickable: false,
      targetUrl: null,
      clickType: null,
    };
  }

  const { targetUrl, clickType } = resolveRetailerClickUrl(offer);

  // 1. Exact validated live offer + in_stock + valid positive price + valid URL -> BUY NOW
  if (targetUrl && offer.price && offer.price > 0) {
    return {
      status: "BUY_NOW",
      state: "LIVE",
      buttonLabel: "BUY NOW →",
      isClickable: true,
      targetUrl,
      clickType,
    };
  }

  // 3. No valid URL or unpriced -> COMING SOON
  return {
    status: "COMING_SOON",
    state: "COMING_SOON",
    buttonLabel: "COMING SOON",
    isClickable: false,
    targetUrl: null,
    clickType: null,
  };
}

/**
 * Universal Retailer Provider Implementation
 */
export const retailerProvider: RetailerProvider = {
  searchOffers: async (
    product: Laptop,
    options?: { countryCode?: CountryCode; timeoutMs?: number }
  ): Promise<RetailerOffer[]> => {
    return getRetailerOffers(product, options?.countryCode || "IN", {
      timeoutMs: options?.timeoutMs,
    });
  },

  getOffer: async (
    product: Laptop,
    retailerId: RetailerId
  ): Promise<RetailerOffer | null> => {
    const adapter = ALL_RETAILER_ADAPTERS.find((a) => a.id === retailerId);
    if (!adapter) return null;
    const query: RetailerQuery = {
      product,
      countryCode: adapter.countryCode,
      currency: adapter.currency,
    };
    const rawOffers = await executeAdapterSafe(adapter, query);
    const validOffers = validateRetailerOffers(rawOffers, product);
    return validOffers[0] || null;
  },

  validateOffer: (offer: unknown, product?: Laptop): ValidationResult => {
    return validateRetailerOffer(offer, product);
  },
};

/**
 * Central Retailer Service Layer
 * Clean interface for querying adapters, registry metadata, and normalized offers.
 */
export const retailerService = {
  getAdapters: (countryCode?: CountryCode): RetailerAdapter[] => {
    if (!countryCode) return ALL_RETAILER_ADAPTERS;
    return ALL_RETAILER_ADAPTERS.filter((a) => a.countryCode === countryCode);
  },
  getAdapter: (id: RetailerId): RetailerAdapter | undefined => {
    return ALL_RETAILER_ADAPTERS.find((a) => a.id === id);
  },
  getConnectedRetailers: (): RetailerInfo[] => {
    return Object.values(RETAILER_REGISTRY).filter((r) => r.connectionStatus === "connected");
  },
  provider: retailerProvider,
  getRetailerOffers,
  validateRetailerOffers,
  getBestListedPrice,
  getRetailerInfo,
  getRetailersForCountry,
  resolveRetailerOfferStatus,
  getRetailerOfferState,
};
