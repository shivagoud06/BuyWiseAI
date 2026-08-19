import { RetailerOffer, RetailerId } from "@/types";

export interface AffiliateSystemConfig {
  amazonAssociateTag: string | null;
  flipkartAffiliateId: string | null;
  ebayCampaignId: string | null;
  isAmazonAffiliateConfigured: boolean;
  isFlipkartAffiliateConfigured: boolean;
  isEbayAffiliateEnabled: boolean; // Always false for Sandbox / production unapproved
}

export interface ResolvedClickUrl {
  targetUrl: string | null;
  clickType: "affiliate" | "product" | null;
  trackingProvider?: string;
  affiliateEnabled: boolean;
}

export interface RetailerClickEvent {
  productId: string;
  productName?: string;
  retailerId: RetailerId;
  retailerName?: string;
  price: number;
  targetUrl: string;
  clickType: "affiliate" | "product";
  timestamp: string; // ISO 8601 string
  trackingProvider?: string;
  source?: "product_page" | "comparison" | "advisor";
}

/**
 * Safely reads server-side affiliate configuration
 * Secrets and tags are NEVER exposed to client code (no NEXT_PUBLIC_ prefix).
 */
export function getAffiliateConfig(): AffiliateSystemConfig {
  // Amazon Associates (Default tag: buywiseai06-21 if not overridden by server-side env)
  const amazonAssociateTag = process.env.AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_ID || "buywiseai06-21";
  const isAmazonAffiliateConfigured = Boolean(amazonAssociateTag && amazonAssociateTag.trim().length > 0);

  // Flipkart Affiliate
  const flipkartAffiliateId = process.env.FLIPKART_AFFILIATE_ID || null;
  const isFlipkartAffiliateConfigured = Boolean(flipkartAffiliateId && flipkartAffiliateId.trim().length > 0);

  // eBay Partner Network (production affiliate access NOT approved; keep disabled)
  const ebayCampaignId = process.env.EBAY_CAMPAIGN_ID || null;
  const isEbayAffiliateEnabled = false;

  return {
    amazonAssociateTag,
    flipkartAffiliateId,
    ebayCampaignId,
    isAmazonAffiliateConfigured,
    isFlipkartAffiliateConfigured,
    isEbayAffiliateEnabled,
  };
}

/**
 * Validates that a URL is a well-formed http/https web link
 */
export function isValidHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return false;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("ftp:")) {
    return false;
  }
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
  }
}

/**
 * Checks if a given URL belongs to an authentic Amazon domain
 */
export function isAmazonUrl(url?: string | null): boolean {
  if (!isValidHttpUrl(url)) return false;
  try {
    const u = new URL(url!.trim());
    const host = u.hostname.toLowerCase();
    return (
      host === "amazon.in" ||
      host.endsWith(".amazon.in") ||
      host === "amazon.com" ||
      host.endsWith(".amazon.com") ||
      host === "amazon.co.uk" ||
      host.endsWith(".amazon.co.uk") ||
      host === "amazon.de" ||
      host.endsWith(".amazon.de") ||
      host === "amzn.to" ||
      host === "amzn.in" ||
      host.includes("amazon.")
    );
  } catch {
    return false;
  }
}

/**
 * Appends official Amazon Associates tracking tag to an authentic Amazon product URL
 * Replaces any existing/duplicate tag with the configured tag.
 * Never modifies non-Amazon URLs.
 */
export function buildAmazonAffiliateUrl(productUrl?: string | null, tag?: string | null): string {
  if (!productUrl || typeof productUrl !== "string") {
    return "";
  }
  if (!isValidHttpUrl(productUrl)) {
    return "";
  }
  if (!isAmazonUrl(productUrl)) {
    return productUrl;
  }
  const associateTag = tag && tag.trim().length > 0 ? tag.trim() : (getAffiliateConfig().amazonAssociateTag || "buywiseai06-21");
  if (!associateTag) {
    return productUrl;
  }
  try {
    const u = new URL(productUrl.trim());
    u.searchParams.set("tag", associateTag);
    return u.toString();
  } catch {
    const sep = productUrl.includes("?") ? "&" : "?";
    return `${productUrl.trim()}${sep}tag=${encodeURIComponent(associateTag)}`;
  }
}

/**
 * Appends official Flipkart affiliate tracking parameter to an authentic Flipkart product URL
 */
export function buildFlipkartAffiliateUrl(productUrl: string, affiliateId: string): string {
  if (!isValidHttpUrl(productUrl) || !affiliateId || affiliateId.trim().length === 0) {
    return productUrl;
  }
  try {
    const u = new URL(productUrl);
    u.searchParams.set("affid", affiliateId.trim());
    return u.toString();
  } catch {
    const sep = productUrl.includes("?") ? "&" : "?";
    return `${productUrl}${sep}affid=${encodeURIComponent(affiliateId.trim())}`;
  }
}

/**
 * Central Retailer Click URL Resolver
 * 
 * Hierarchy:
 * 1. Valid approved affiliate URL
 * 2. Valid retailer product URL
 * 3. null
 * 
 * Never fabricates an affiliate URL unless legitimate credentials exist.
 * Normal product URLs continue to function cleanly when no affiliate link is configured.
 */
export function resolveRetailerClickUrl(offer?: RetailerOffer | null): ResolvedClickUrl {
  if (!offer || offer.isMock || offer.source === "mock") {
    return {
      targetUrl: null,
      clickType: null,
      affiliateEnabled: false,
    };
  }

  // 1. Explicit validated affiliate URL present on offer
  if (isValidHttpUrl(offer.affiliateUrl)) {
    return {
      targetUrl: offer.affiliateUrl!.trim(),
      clickType: "affiliate",
      trackingProvider: offer.trackingProvider || "retailer_affiliate",
      affiliateEnabled: true,
    };
  }

  // 2. Derive affiliate URL if retailer has configured server-side affiliate credentials
  if (isValidHttpUrl(offer.productUrl)) {
    const config = getAffiliateConfig();

    if (offer.retailerId === "amazon" && config.isAmazonAffiliateConfigured) {
      const taggedUrl = buildAmazonAffiliateUrl(offer.productUrl!, config.amazonAssociateTag!);
      return {
        targetUrl: taggedUrl,
        clickType: "affiliate",
        trackingProvider: "amazon_associates",
        affiliateEnabled: true,
      };
    }

    if (offer.retailerId === "flipkart" && config.isFlipkartAffiliateConfigured) {
      const taggedUrl = buildFlipkartAffiliateUrl(offer.productUrl!, config.flipkartAffiliateId!);
      return {
        targetUrl: taggedUrl,
        clickType: "affiliate",
        trackingProvider: "flipkart_affiliate",
        affiliateEnabled: true,
      };
    }

    // 3. Fall back to legitimate retailer product URL without tracking parameters
    return {
      targetUrl: offer.productUrl!.trim(),
      clickType: "product",
      trackingProvider: "direct",
      affiliateEnabled: false,
    };
  }

  // 4. No valid URL
  return {
    targetUrl: null,
    clickType: null,
    affiliateEnabled: false,
  };
}

/**
 * Safe internal click event logging abstraction
 * Records retailer clicks without exposing secrets, tokens, or PII.
 * Never claims a commission occurred when only a click is registered.
 */
export function recordRetailerClick(event: RetailerClickEvent): void {
  // Validate that no sensitive authorization headers or secrets leaked into payload
  const safeEvent: RetailerClickEvent = {
    productId: String(event.productId),
    productName: event.productName ? String(event.productName).slice(0, 150) : undefined,
    retailerId: event.retailerId,
    retailerName: event.retailerName ? String(event.retailerName).slice(0, 50) : undefined,
    price: typeof event.price === "number" && !isNaN(event.price) ? event.price : 0,
    targetUrl: String(event.targetUrl),
    clickType: event.clickType === "affiliate" ? "affiliate" : "product",
    timestamp: event.timestamp || new Date().toISOString(),
    trackingProvider: event.trackingProvider,
    source: event.source,
  };

  if (process.env.NODE_ENV === "development") {
    // console.debug("[Retailer Click Tracked]:", safeEvent);
  }
}
