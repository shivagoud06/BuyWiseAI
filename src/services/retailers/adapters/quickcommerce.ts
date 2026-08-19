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
 * Maximum search query variants generated per retailer platform
 */
export const MAX_QUERIES_PER_PLATFORM = 4;

/**
 * Deduplicates adjacent words and removes excessive punctuation to ensure clean search terms
 */
export function cleanQueryString(input: string): string {
  if (!input) return "";
  // Strip parentheses, commas, brackets, special quotes
  const cleaned = input.replace(/[()[\]{},"']/g, " ").replace(/\s+/g, " ").trim();
  
  // Deduplicate adjacent/repeated case-insensitive tokens
  const words = cleaned.split(" ");
  const uniqueWords: string[] = [];
  for (const word of words) {
    const trimmed = word.trim();
    if (!trimmed) continue;
    const lastWord = uniqueWords[uniqueWords.length - 1];
    if (!lastWord || lastWord.toLowerCase() !== trimmed.toLowerCase()) {
      uniqueWords.push(trimmed);
    }
  }
  return uniqueWords.join(" ").trim();
}

/**
 * Constructs a targeted search query for QuickCommerce laptop search (Primary variant)
 */
export function buildQuickCommerceSearchQuery(product: Laptop): string {
  const queries = buildQuickCommerceSearchQueries(product);
  return queries[0] || `${product.brand} ${product.name}`.trim();
}

/**
 * Constructs up to 4 clean, prioritized query variants for multi-query retailer retrieval:
 * 1. Brand + Full Name / Specific Model Code (Strongest identity)
 * 2. Brand + Series / Model line (e.g. "HP Victus 15", "Lenovo LOQ 15")
 * 3. Brand + Series + CPU Tier + GPU Tier (e.g. "HP Victus 15 i5 RTX 3050")
 * 4. Brand + Series + Dedicated GPU / Key Spec (e.g. "HP Victus RTX 3050")
 */
export function buildQuickCommerceSearchQueries(product: Laptop): string[] {
  const brand = (product.brand || "").trim();
  let name = (product.name || "").trim();

  // Strip brand prefix if already part of name
  if (brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = name.substring(brand.length).trim();
  }

  const queryVariants: string[] = [];

  // Helper to safely add variant if unique and non-empty
  const addVariant = (raw: string) => {
    const cleaned = cleanQueryString(raw);
    if (cleaned && !queryVariants.some((v) => v.toLowerCase() === cleaned.toLowerCase())) {
      queryVariants.push(cleaned);
    }
  };

  // 1. Primary Variant: Brand + Name
  addVariant(`${brand} ${name}`);

  // 2. Series / Short Model Line Variant (e.g. "HP Victus 15", "Lenovo LOQ 15", "Acer Aspire Lite 15")
  const seriesLine = name.replace(/[-_][a-zA-Z0-9]+$/i, "").trim();
  if (seriesLine.toLowerCase() !== name.toLowerCase()) {
    addVariant(`${brand} ${seriesLine}`);
  } else {
    const nameWords = name.split(" ");
    if (nameWords.length >= 2) {
      addVariant(`${brand} ${nameWords.slice(0, 2).join(" ")}`);
    }
  }

  // 3. Configuration Variant: Brand + Series + CPU + GPU
  let cpuShort = "";
  const procLower = (product.processor || product.processorFamily || "").toLowerCase();
  if (procLower.includes("core 5") || procLower.includes("core i5") || procLower.includes("i5")) cpuShort = "i5";
  else if (procLower.includes("core 7") || procLower.includes("core i7") || procLower.includes("i7")) cpuShort = "i7";
  else if (procLower.includes("core 9") || procLower.includes("core i9") || procLower.includes("i9")) cpuShort = "i9";
  else if (procLower.includes("core i3") || procLower.includes("i3")) cpuShort = "i3";
  else if (procLower.includes("ryzen 5")) cpuShort = "Ryzen 5";
  else if (procLower.includes("ryzen 7")) cpuShort = "Ryzen 7";
  else if (procLower.includes("ryzen 9")) cpuShort = "Ryzen 9";
  else if (procLower.includes("m2")) cpuShort = "M2";
  else if (procLower.includes("m3")) cpuShort = "M3";

  let gpuShort = "";
  const gpuLower = (product.gpu || "").toLowerCase();
  const rtxMatch = gpuLower.match(/rtx\s*([0-9]{4})/i);
  if (rtxMatch) {
    gpuShort = `RTX ${rtxMatch[1]}`;
  } else if (gpuLower.includes("gtx")) {
    const gtxMatch = gpuLower.match(/gtx\s*([0-9]{4})/i);
    if (gtxMatch) gpuShort = `GTX ${gtxMatch[1]}`;
  }

  const seriesBase = seriesLine || name.split(" ")[0] || "";

  if (cpuShort && gpuShort) {
    addVariant(`${brand} ${seriesBase} ${cpuShort} ${gpuShort}`);
  } else if (gpuShort) {
    addVariant(`${brand} ${seriesBase} ${gpuShort}`);
  } else if (cpuShort) {
    addVariant(`${brand} ${seriesBase} ${cpuShort}`);
  }

  // 4. Dedicated GPU / Spec Variant (e.g. "HP Victus RTX 3050" or "HP Victus 16GB")
  if (gpuShort) {
    addVariant(`${brand} ${seriesBase.split(" ")[0]} ${gpuShort}`);
  } else if (product.ramSize) {
    addVariant(`${brand} ${seriesBase} ${product.ramSize}GB`);
  }

  // Ensure maximum MAX_QUERIES_PER_PLATFORM variants
  return queryVariants.slice(0, MAX_QUERIES_PER_PLATFORM);
}

/**
 * Calculates a canonical deduplication key for a retailer offer
 */
export function getOfferDeduplicationKey(offer: RetailerOffer): string {
  if (offer.matchedSku && offer.matchedSku.trim().length > 0) {
    return `${offer.retailerId}_sku_${offer.matchedSku.toLowerCase().trim()}`;
  }
  if (offer.productUrl && offer.productUrl.trim().length > 0) {
    try {
      const u = new URL(offer.productUrl);
      return `${offer.retailerId}_url_${u.origin}${u.pathname}`.toLowerCase();
    } catch {
      return `${offer.retailerId}_url_${offer.productUrl.toLowerCase().trim()}`;
    }
  }
  return `${offer.retailerId}_text_${(offer.offerText || "").toLowerCase().trim()}`;
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
   * Uses targeted multi-query retrieval with credit protection (max 4 queries/platform, early stop upon exact match)
   */
  getOffers: async (query: RetailerQuery): Promise<RetailerOffer[]> => {
    const config = getQuickCommerceConfig();
    if (!config.isConfigured) {
      return [];
    }

    const queryVariants = buildQuickCommerceSearchQueries(query.product);
    const platforms = ["Amazon", "Flipkart"];
    const candidateOffers: RetailerOffer[] = [];
    const seenOfferKeys = new Set<string>();

    for (const platform of platforms) {
      for (const qText of queryVariants) {
        const rawItems = (await QuickCommerceAdapter.searchProducts!(qText, { platform })) as RawQuickCommerceProduct[];
        let foundExactOnPlatform = false;

        for (const rawItem of rawItems) {
          const normalized = normalizeQuickCommerceItem(rawItem);
          if (!normalized) continue;

          // Exact product specification matching (RAM, GPU tier, Storage, SKU)
          const matchResult = matchOfferToProduct(normalized, query.product);
          if (!matchResult.isMatch) continue;

          // Strict offer schema and compliance validation
          const validationResult = validateRetailerOffer(normalized, query.product);
          if (validationResult.isValid && validationResult.offer) {
            const offerKey = getOfferDeduplicationKey(validationResult.offer);
            if (!seenOfferKeys.has(offerKey)) {
              seenOfferKeys.add(offerKey);
              candidateOffers.push(validationResult.offer);
            }
            foundExactOnPlatform = true;
          }
        }

        // Early stop: Stop searching subsequent query variants on this platform once an exact match is verified
        if (foundExactOnPlatform) {
          break;
        }
      }
    }

    return candidateOffers;
  },
};
