import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer, Laptop, RetailerId, AvailabilityStatus } from "@/types";
import { normalizeRetailerOffer, RawRetailerInput, parsePrice, normalizeUrl } from "../normalizer";
import { matchOfferToProduct } from "../matcher";
import { validateRetailerOffer } from "../validator";

/**
 * Server-side QuickCommerce API configuration
 * Strictly reads server environment variables; never exposed to browser.
 */
export interface QuickCommerceConfig {
  apiKey: string | null;
  isConfigured: boolean;
  endpoint: string;
  defaultPincode: string;
}

/**
 * Reads server-side QuickCommerce environment variables safely without logging or exposing secrets
 */
export function getQuickCommerceConfig(): QuickCommerceConfig {
  const apiKey = process.env.QUICKCOMMERCE_API_KEY || null;
  return {
    apiKey,
    isConfigured: Boolean(apiKey && apiKey.trim().length > 0),
    endpoint: process.env.QUICKCOMMERCE_API_ENDPOINT || "https://api.quickcommerceapi.com/v1",
    defaultPincode: process.env.QUICKCOMMERCE_DEFAULT_PINCODE || "560001",
  };
}

/**
 * Raw product item schema as returned by QuickCommerce API endpoints
 */
export interface RawQuickCommerceProduct {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  mrp?: number | string | null;
  discount?: number | string | null;
  currency?: string;
  deeplink?: string | null;
  url?: string | null;
  link?: string | null;
  platform?: string;
  source?: string;
  in_stock?: boolean | string;
  availability?: string;
  image?: string | null;
  brand?: string;
  sku?: string;
  seller?: string;
  eta_minutes?: number;
}

/**
 * Maps QuickCommerce platform strings to standard BuyWise retailer identifiers
 */
export function mapPlatformToRetailer(platformStr?: string): { retailerId: RetailerId; retailerName: string } {
  if (!platformStr) {
    return { retailerId: "quickcommerce", retailerName: "QuickCommerce" };
  }

  const p = platformStr.toLowerCase().trim();

  if (p.includes("amazon")) {
    return { retailerId: "amazon", retailerName: "Amazon India" };
  }
  if (p.includes("flipkart")) {
    return { retailerId: "flipkart", retailerName: "Flipkart" };
  }
  if (p.includes("croma")) {
    return { retailerId: "croma", retailerName: "Croma" };
  }
  if (p.includes("reliance") || p.includes("jiomart")) {
    return { retailerId: "reliance-digital", retailerName: "Reliance Digital" };
  }
  if (p.includes("vijay")) {
    return { retailerId: "vijay-sales", retailerName: "Vijay Sales" };
  }
  if (p.includes("lenovo")) {
    return { retailerId: "lenovo-store", retailerName: "Lenovo Official Store" };
  }
  if (p.includes("hp")) {
    return { retailerId: "hp-store", retailerName: "HP Official Store" };
  }
  if (p.includes("asus")) {
    return { retailerId: "asus-store", retailerName: "ASUS Official Store" };
  }
  if (p.includes("apple")) {
    return { retailerId: "apple-store", retailerName: "Apple Store India" };
  }
  if (p.includes("dell")) {
    return { retailerId: "dell-store", retailerName: "Dell Official Store" };
  }

  // Preserve platform name for other quickcommerce providers
  return {
    retailerId: "quickcommerce",
    retailerName: platformStr.trim(),
  };
}

/**
 * Constructs a targeted search query for QuickCommerce laptop search
 */
export function buildQuickCommerceSearchQuery(product: Laptop): string {
  const parts: string[] = [product.brand];
  
  if (product.name) {
    parts.push(product.name);
  }
  if (product.model && !product.name.toLowerCase().includes(product.model.toLowerCase())) {
    parts.push(product.model);
  }
  if (product.ramSize) {
    parts.push(`${product.ramSize}GB`);
  }

  return parts.join(" ").trim();
}

/**
 * Normalizes a single QuickCommerce API raw product item into a standard BuyWise RetailerOffer
 */
export function normalizeQuickCommerceItem(item: RawQuickCommerceProduct): RetailerOffer | null {
  if (!item || typeof item !== "object") return null;

  const title = (item.name || item.title || "").trim();
  if (!title) return null;

  const rawPrice = item.price;
  const parsedPrice = parsePrice(rawPrice);
  if (parsedPrice === null || parsedPrice <= 0) return null;

  const { retailerId, retailerName } = mapPlatformToRetailer(item.platform || item.source);

  // Availability normalization
  let availability: AvailabilityStatus = "in-stock";
  if (item.in_stock === false || item.availability === "out-of-stock" || item.availability === "OUT_OF_STOCK") {
    availability = "out-of-stock";
  } else if (item.availability) {
    const a = item.availability.toLowerCase();
    if (a.includes("limited") || a.includes("few")) availability = "limited-stock";
    else if (a.includes("preorder") || a.includes("pre-order")) availability = "pre-order";
  }

  const productUrl = normalizeUrl(item.deeplink || item.url || item.link);

  const rawInput: RawRetailerInput = {
    retailerId,
    retailerName,
    countryCode: "IN",
    price: parsedPrice,
    mrp: parsePrice(item.mrp),
    discount: item.discount !== undefined && item.discount !== null ? parsePrice(item.discount) : null,
    currency: item.currency || "INR",
    productUrl,
    affiliateUrl: null,
    availability,
    offerText: title,
    source: "official_api",
    isMock: false,
    matchedSku: item.sku ? String(item.sku) : undefined,
  };

  return normalizeRetailerOffer(rawInput);
}

/**
 * QuickCommerce API Client & Adapter
 * Connects to QuickCommerce multi-platform API for live search and pricing in India.
 */
export const QuickCommerceAdapter: RetailerAdapter = {
  id: "quickcommerce",
  name: "QuickCommerce Network",
  countryCode: "IN",
  currency: "INR",
  connectionStatus: "not_connected",
  dataSourceType: "api",
  source: "official_api",
  isLiveApiConnected: false,

  /**
   * Searches QuickCommerce products across supported platforms
   */
  searchProducts: async (
    query: string,
    options?: { pincode?: string; lat?: number; lon?: number; platform?: string }
  ): Promise<RawQuickCommerceProduct[]> => {
    const config = getQuickCommerceConfig();
    if (!config.isConfigured || !config.apiKey) {
      return [];
    }

    try {
      const url = new URL(`${config.endpoint}/search`);
      url.searchParams.set("q", query);

      if (options?.platform) {
        url.searchParams.set("platform", options.platform);
      }
      if (options?.lat && options?.lon) {
        url.searchParams.set("lat", options.lat.toString());
        url.searchParams.set("lon", options.lon.toString());
      }

      const pincode = options?.pincode || config.defaultPincode;

      const headers: Record<string, string> = {
        "X-API-Key": config.apiKey,
        "Accept": "application/json",
        "x-geolocation-pincode": pincode,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Return empty on API error without crashing
        return [];
      }

      const data = await response.json();
      
      // Handles both { results: [...] }, { items: [...] }, and top-level array [...]
      const itemsList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.products)
        ? data.products
        : [];

      return itemsList;
    } catch {
      // Safe error isolation
      return [];
    }
  },

  getProduct: async (_productIdOrSku: string): Promise<unknown | null> => {
    return null;
  },

  /**
   * Retrieves matching offers for a target laptop configuration from QuickCommerce
   */
  getOffers: async (query: RetailerQuery): Promise<RetailerOffer[]> => {
    const config = getQuickCommerceConfig();
    if (!config.isConfigured) {
      return [];
    }

    const searchQuery = buildQuickCommerceSearchQuery(query.product);
    const rawItems = await QuickCommerceAdapter.searchProducts!(searchQuery);

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return [];
    }

    const validatedOffers: RetailerOffer[] = [];

    for (const rawItem of rawItems) {
      const normalized = normalizeQuickCommerceItem(rawItem as RawQuickCommerceProduct);
      if (!normalized) continue;

      // Exact product specification matching (RAM, GPU tier, Storage, SKU)
      const matchResult = matchOfferToProduct(normalized, query.product);
      if (!matchResult.isMatch) continue;

      // Strict offer schema and compliance validation
      const validationResult = validateRetailerOffer(normalized, query.product);
      if (validationResult.isValid && validationResult.offer) {
        validatedOffers.push(validationResult.offer);
      }
    }

    return validatedOffers;
  },
};
