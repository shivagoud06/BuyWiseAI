import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer, Laptop, AvailabilityStatus } from "@/types";
import { normalizeRetailerOffer, RawRetailerInput, parsePrice, normalizeUrl } from "../normalizer";
import { matchOfferToProduct } from "../matcher";
import { validateRetailerOffer } from "../validator";
import { buildQuickCommerceSearchQueries } from "./quickcommerce";

/**
 * Server-side eBay API Configuration interface
 * (Strictly server-side; never exposed to browser or client bundles)
 */
export interface EbayApiConfig {
  appId: string | null;
  devId: string | null;
  certId: string | null;
  clientId: string | null;
  clientSecret: string | null;
  isConfigured: boolean;
  environment: "sandbox" | "production";
  accountStatus: "pending_approval" | "approved" | "disabled";
  oauthEndpoint: string;
  browseEndpoint: string;
}

/**
 * Safely reads server-side eBay environment variables without exposing secrets
 */
export function getEbayConfig(): EbayApiConfig {
  const appId = process.env.EBAY_APP_ID || process.env.EBAY_CLIENT_ID || null;
  const devId = process.env.EBAY_DEV_ID || null;
  const certId = process.env.EBAY_CERT_ID || process.env.EBAY_CLIENT_SECRET || null;
  const envRaw = (process.env.EBAY_ENVIRONMENT || "sandbox").toLowerCase().trim();
  const environment: "sandbox" | "production" = envRaw === "production" ? "production" : "sandbox";

  const oauthEndpoint =
    environment === "production"
      ? "https://api.ebay.com/identity/v1/oauth2/token"
      : "https://api.sandbox.ebay.com/identity/v1/oauth2/token";

  const browseEndpoint =
    environment === "production"
      ? "https://api.ebay.com/buy/browse/v1"
      : "https://api.sandbox.ebay.com/buy/browse/v1";

  const isConfigured = Boolean(appId && certId && appId.trim().length > 0 && certId.trim().length > 0);

  return {
    appId,
    devId,
    certId,
    clientId: appId,
    clientSecret: certId,
    isConfigured,
    environment,
    accountStatus: isConfigured ? "approved" : "pending_approval",
    oauthEndpoint,
    browseEndpoint,
  };
}

/**
 * In-memory OAuth token cache
 */
interface TokenCache {
  token: string;
  expiresAt: number;
}
let cachedToken: TokenCache | null = null;

/**
 * In-memory response cache for eBay item searches (15 minute TTL)
 */
const ebaySearchCache = new Map<string, { data: EbayRawItemSummary[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Secure server-side OAuth 2.0 Client Credentials token retrieval for eBay API
 */
export async function getEbayAccessToken(forceRefresh = false): Promise<string | null> {
  const config = getEbayConfig();
  if (!config.isConfigured || !config.appId || !config.certId) {
    return null;
  }

  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${config.appId}:${config.certId}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(config.oauthEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body: body.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.access_token) {
      const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 7200;
      cachedToken = {
        token: data.access_token,
        expiresAt: now + expiresInSec * 1000,
      };
      return data.access_token;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Builds an optimized eBay search query string from a Laptop configuration
 */
export function buildEbaySearchQuery(product: Laptop): string {
  const brand = (product.brand || "").trim();
  let name = (product.name || "").trim();

  if (brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = name.substring(brand.length).trim();
  }

  const parts: string[] = [];
  if (brand) parts.push(brand);
  if (name) parts.push(name);

  return parts.join(" ").trim();
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
  originalPrice?: {
    value: string | number;
    currency: string;
  };
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  buyingOptions?: string[];
  condition?: string;
  estimatedAvailabilities?: Array<{
    estimatedAvailabilityStatus?: string;
    estimatedAvailableQuantity?: number;
  }>;
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
  const parsedPrice = parsePrice(rawPrice);
  if (parsedPrice === null || parsedPrice <= 0) {
    return null;
  }

  const shippingCostRaw = rawItem.shippingOptions?.[0]?.shippingCost?.value;
  const parsedShipping = shippingCostRaw ? parsePrice(shippingCostRaw) : 0;
  const totalPrice = parsedPrice + (parsedShipping && parsedShipping > 0 ? parsedShipping : 0);

  const rawMrp = rawItem.originalPrice?.value;
  const parsedMrp = rawMrp ? parsePrice(rawMrp) : null;

  const rawUrl = rawItem.itemAffiliateWebUrl || rawItem.itemWebUrl;
  const productUrl = normalizeUrl(rawUrl);

  // Availability normalization
  let availability: AvailabilityStatus = "in-stock";
  const availStatus = rawItem.estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus?.toLowerCase();
  const availQty = rawItem.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity;

  if (
    rawItem.buyingOptions?.includes("OUT_OF_STOCK") ||
    availStatus === "out_of_stock" ||
    availQty === 0
  ) {
    availability = "out-of-stock";
  } else if (availStatus === "limited_stock" || (typeof availQty === "number" && availQty > 0 && availQty <= 3)) {
    availability = "limited-stock";
  }

  const rawInput: RawRetailerInput = {
    retailerId: "ebay",
    retailerName: "eBay",
    countryCode: rawItem.itemLocation?.country || "US",
    price: totalPrice,
    mrp: parsedMrp && parsedMrp > totalPrice ? parsedMrp : null,
    currency: rawItem.price?.currency || "USD",
    productUrl,
    affiliateUrl: rawItem.itemAffiliateWebUrl ? normalizeUrl(rawItem.itemAffiliateWebUrl) : null,
    availability,
    offerText: rawItem.title,
    source: "official_api",
    isMock: false,
    matchedSku: rawItem.mpn || rawItem.epid || undefined,
  };

  return normalizeRetailerOffer(rawInput);
}

/**
 * eBay Retailer Adapter (eBay Browse API — Sandbox / Production)
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

  /**
   * Searches eBay Browse API item summaries for a query
   */
  searchProducts: async (
    query: string,
    options?: { limit?: number; marketplaceId?: string }
  ): Promise<EbayRawItemSummary[]> => {
    const config = getEbayConfig();
    if (!config.isConfigured) {
      return [];
    }

    const token = await getEbayAccessToken();
    if (!token) {
      return [];
    }

    const cacheKey = `${query.toLowerCase().trim()}_${config.environment}_${options?.marketplaceId || "EBAY_US"}`;
    const cached = ebaySearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const limit = options?.limit || 5;
      const marketplaceId = options?.marketplaceId || (config.environment === "sandbox" ? "EBAY_US" : "EBAY_US");
      const url = new URL(`${config.browseEndpoint}/item_summary/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("limit", limit.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const items: EbayRawItemSummary[] = Array.isArray(data?.itemSummaries) ? data.itemSummaries : [];

      ebaySearchCache.set(cacheKey, { data: items, timestamp: Date.now() });
      return items;
    } catch {
      return [];
    }
  },

  getProduct: async (_productIdOrSku: string): Promise<unknown | null> => {
    return null;
  },

  /**
   * Retrieves and exact-matches live eBay offers for a target laptop
   */
  getOffers: async (query: RetailerQuery): Promise<RetailerOffer[]> => {
    const config = getEbayConfig();
    if (!config.isConfigured) {
      return [];
    }

    const queryVariants = buildQuickCommerceSearchQueries(query.product);
    const candidateOffers: RetailerOffer[] = [];
    const seenUrls = new Set<string>();

    for (const qText of queryVariants) {
      const rawItems = (await EbayAdapter.searchProducts!(qText, { limit: 5 })) as EbayRawItemSummary[];
      let foundExact = false;

      for (const rawItem of rawItems) {
        const normalized = normalizeEbayItem(rawItem);
        if (!normalized) continue;

        // Exact specification matching
        const matchResult = matchOfferToProduct(normalized, query.product);
        if (!matchResult.isMatch) continue;

        // Strict offer schema and compliance validation
        const validationResult = validateRetailerOffer(normalized, query.product);
        if (validationResult.isValid && validationResult.offer) {
          const urlKey = validationResult.offer.productUrl || validationResult.offer.offerText || "";
          if (!seenUrls.has(urlKey)) {
            seenUrls.add(urlKey);
            candidateOffers.push(validationResult.offer);
          }
          foundExact = true;
        }
      }

      // Early stop after finding an exact verified offer for this laptop
      if (foundExact) {
        break;
      }
    }

    return candidateOffers;
  },
};
