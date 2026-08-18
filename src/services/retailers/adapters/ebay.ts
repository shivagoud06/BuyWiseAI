import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer, Laptop } from "@/types";
import { normalizeRetailerOffer, RawRetailerInput } from "../normalizer";

/**
 * Server-side eBay API Configuration interface
 * (Keeps credentials private; never exposed to browser)
 */
export interface EbayApiConfig {
  clientId: string | null;
  clientSecret: string | null;
  isConfigured: boolean;
  environment: "SANDBOX" | "PRODUCTION";
  accountStatus: "pending_approval" | "approved" | "disabled";
}

/**
 * Safely reads server-side eBay environment variables without exposing secrets
 */
export function getEbayConfig(): EbayApiConfig {
  const clientId = process.env.EBAY_CLIENT_ID || null;
  const clientSecret = process.env.EBAY_CLIENT_SECRET || null;
  const environment = (process.env.EBAY_ENVIRONMENT as "SANDBOX" | "PRODUCTION") || "PRODUCTION";

  return {
    clientId,
    clientSecret,
    isConfigured: Boolean(clientId && clientSecret),
    environment,
    accountStatus: "pending_approval",
  };
}

/**
 * Builds an optimized eBay Browse API search query string from a Laptop configuration
 */
export function buildEbaySearchQuery(product: Laptop): string {
  const terms: string[] = [product.brand];
  
  if (product.name) {
    terms.push(product.name);
  }
  if (product.model && !product.name.includes(product.model)) {
    terms.push(product.model);
  }
  if (product.ramSize) {
    terms.push(`${product.ramSize}GB`);
  }

  return terms.join(" ").trim();
}

/**
 * Type definition for raw item summary returned by eBay Browse API
 * (https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search)
 */
export interface EbayRawItemSummary {
  itemId: string;
  title: string;
  price?: {
    value: string | number;
    currency: string;
  };
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  buyingOptions?: string[];
  condition?: string;
  shippingOptions?: Array<{
    shippingCost?: {
      value: string | number;
      currency: string;
    };
    shippingCostType?: string;
  }>;
  seller?: {
    username?: string;
    feedbackPercentage?: string;
  };
  itemLocation?: {
    country?: string;
  };
  mpn?: string;
  epid?: string;
}

/**
 * Normalizes an eBay Browse API item summary into standard BuyWise RetailerOffer structure
 */
export function normalizeEbayItem(rawItem: EbayRawItemSummary): RetailerOffer | null {
  if (!rawItem || !rawItem.itemId || !rawItem.title) {
    return null;
  }

  const rawPrice = rawItem.price?.value;
  if (rawPrice === undefined || rawPrice === null) {
    return null;
  }

  const shippingCost = rawItem.shippingOptions?.[0]?.shippingCost?.value;
  const basePrice = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;
  const shipping = shippingCost ? (typeof shippingCost === "string" ? parseFloat(shippingCost) : shippingCost) : 0;
  const totalPrice = isFinite(basePrice) ? basePrice + (isFinite(shipping) ? shipping : 0) : basePrice;

  const rawInput: RawRetailerInput = {
    retailerId: "ebay",
    retailerName: "eBay",
    countryCode: rawItem.itemLocation?.country || "US",
    price: totalPrice,
    currency: rawItem.price?.currency || "USD",
    productUrl: rawItem.itemWebUrl || null,
    affiliateUrl: rawItem.itemAffiliateWebUrl || null,
    availability: rawItem.buyingOptions?.includes("OUT_OF_STOCK") ? "out-of-stock" : "in-stock",
    offerText: rawItem.title,
    source: "official_api",
    isMock: false,
    matchedSku: rawItem.mpn || undefined,
  };

  return normalizeRetailerOffer(rawInput);
}

/**
 * eBay Retailer Adapter (Phase 18A — Preparation Phase)
 * 
 * Connection status remains "not_connected" with isLiveApiConnected: false
 * while eBay Developer account approval is pending.
 */
export const EbayAdapter: RetailerAdapter = {
  id: "ebay",
  name: "eBay",
  countryCode: "US",
  currency: "USD",
  connectionStatus: "not_connected",
  dataSourceType: "api",
  source: "official_api",
  isLiveApiConnected: false,

  searchProducts: async (_query: string): Promise<unknown[]> => {
    // Returns empty array while developer account approval is pending
    if (!EbayAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },

  getProduct: async (_productIdOrSku: string): Promise<unknown | null> => {
    if (!EbayAdapter.isLiveApiConnected) {
      return null;
    }
    return null;
  },

  getOffers: async (_query: RetailerQuery): Promise<RetailerOffer[]> => {
    // Safe not-connected state: returns zero offers without throwing
    if (!EbayAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },
};
