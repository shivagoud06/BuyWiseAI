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
  defaultLat: number;
  defaultLon: number;
  defaultPlatform: string;
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
    defaultLat: parseFloat(process.env.QUICKCOMMERCE_DEFAULT_LAT || "12.9716"),
    defaultLon: parseFloat(process.env.QUICKCOMMERCE_DEFAULT_LON || "77.5946"),
    defaultPlatform: process.env.QUICKCOMMERCE_DEFAULT_PLATFORM || "Amazon",
  };
}

/**
 * Raw product item schema as returned by QuickCommerce API endpoints
 */
export interface RawQuickCommerceProduct {
  id?: string | number;
  name?: string;
  title?: string;
  product_name?: string;
  price?: number | string;
  current_price?: number | string;
  offer_price?: number | string;
  mrp?: number | string | null;
  original_price?: number | string | null;
  discount?: number | string | null;
  currency?: string;
  deeplink?: string | null;
  url?: string | null;
  link?: string | null;
  product_url?: string | null;
  platform?: string | { name?: string; [key: string]: any };
  source?: string;
  merchant?: string;
  available?: boolean;
  in_stock?: boolean | string;
  availability?: string;
  is_available?: boolean;
  image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  brand?: string;
  sku?: string;
  seller?: string;
  eta_minutes?: number;
}

/**
 * In-memory response cache to protect limited API credits and prevent redundant calls
 */
const apiCache = new Map<string, { data: RawQuickCommerceProduct[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

/**
 * Maps QuickCommerce platform strings to standard BuyWise retailer identifiers
 */
/**
 * Maps QuickCommerce platform strings to standard BuyWise retailer identifiers
 */
export function mapPlatformToRetailer(platformInput?: any): { retailerId: RetailerId; retailerName: string } {
  if (!platformInput) {
    return { retailerId: "quickcommerce", retailerName: "QuickCommerce" };
  }

  const platformStr = typeof platformInput === "object" && platformInput !== null
    ? (platformInput.name || "")
    : String(platformInput);

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

  // Preserve platform name for other quickcommerce providers (e.g. BlinkIt, Zepto)
  return {
    retailerId: "quickcommerce",
    retailerName: platformStr.trim() || "QuickCommerce",
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

  const title = (item.title || item.name || item.product_name || "").trim();
  if (!title) return null;

  const rawPrice = item.offer_price ?? item.price ?? item.current_price;
  const parsedPrice = parsePrice(rawPrice);
  if (parsedPrice === null || parsedPrice <= 0) return null;

  const rawMrp = item.mrp ?? item.original_price;
  const parsedMrp = parsePrice(rawMrp);

  const { retailerId, retailerName } = mapPlatformToRetailer(item.platform || item.source || item.merchant);

  // Availability normalization
  let availability: AvailabilityStatus = "in-stock";
  if (
    item.available === false ||
    item.in_stock === false ||
    item.is_available === false ||
    item.availability === "out-of-stock" ||
    item.availability === "OUT_OF_STOCK"
  ) {
    availability = "out-of-stock";
  } else if (item.availability) {
    const a = String(item.availability).toLowerCase();
    if (a.includes("limited") || a.includes("few")) availability = "limited-stock";
    else if (a.includes("preorder") || a.includes("pre-order")) availability = "pre-order";
  }

  const rawUrl = item.deeplink || item.url || item.link || item.product_url;
  const productUrl = normalizeUrl(rawUrl);

  const rawInput: RawRetailerInput = {
    retailerId,
    retailerName,
    countryCode: "IN",
    price: parsedPrice,
    mrp: parsedMrp,
    discount: item.discount !== undefined && item.discount !== null ? parsePrice(item.discount) : null,
    currency: item.currency || "INR",
    productUrl,
    affiliateUrl: null,
    availability,
    offerText: title,
    source: "official_api",
    isMock: false,
    matchedSku: item.sku || (item.id ? String(item.id) : undefined),
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
   * Searches QuickCommerce products across supported platforms (Amazon, Flipkart, etc.)
   */
  searchProducts: async (
    query: string,
    options?: { pincode?: string; lat?: number; lon?: number; platform?: string }
  ): Promise<RawQuickCommerceProduct[]> => {
    const config = getQuickCommerceConfig();
    if (!config.isConfigured || !config.apiKey) {
      return [];
    }

    const platform = options?.platform || config.defaultPlatform;
    const lat = options?.lat ?? config.defaultLat;
    const lon = options?.lon ?? config.defaultLon;

    const cacheKey = `${query.toLowerCase().trim()}_${platform}_${lat}_${lon}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = new URL(`${config.endpoint}/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("platform", platform);
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lon", lon.toString());

      const headers: Record<string, string> = {
        "X-API-Key": config.apiKey,
        "Accept": "application/json",
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const responseJson = await response.json();

      // Handles { status: "success", data: { products: [...] } } or { data: [...] } or { products: [...] }
      const itemsList: RawQuickCommerceProduct[] = Array.isArray(responseJson)
        ? responseJson
        : Array.isArray(responseJson?.data?.products)
        ? responseJson.data.products
        : Array.isArray(responseJson?.products)
        ? responseJson.products
        : Array.isArray(responseJson?.data?.items)
        ? responseJson.data.items
        : Array.isArray(responseJson?.items)
        ? responseJson.items
        : Array.isArray(responseJson?.data?.results)
        ? responseJson.data.results
        : Array.isArray(responseJson?.results)
        ? responseJson.results
        : Array.isArray(responseJson?.data)
        ? responseJson.data
        : [];

      // Attach platform if missing on individual items
      const enrichedItems = itemsList.map((item) => ({
        ...item,
        platform: item.platform || platform,
      }));

      apiCache.set(cacheKey, { data: enrichedItems, timestamp: Date.now() });

      return enrichedItems;
    } catch {
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
    
    // Fetch from both Amazon and Flipkart platforms separately
    const [rawAmazonItems, rawFlipkartItems] = await Promise.all([
      QuickCommerceAdapter.searchProducts!(searchQuery, { platform: "Amazon" }),
      QuickCommerceAdapter.searchProducts!(searchQuery, { platform: "Flipkart" }),
    ]);

    const allRawItems = [...rawAmazonItems, ...rawFlipkartItems];

    if (allRawItems.length === 0) {
      return [];
    }

    const validatedOffers: RetailerOffer[] = [];

    for (const rawItem of allRawItems) {
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
