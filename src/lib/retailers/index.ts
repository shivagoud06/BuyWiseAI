import { Laptop, RetailerOffer, RetailerSortOption, RetailerId, CurrencyCode, CountryCode } from "@/types";
import { getBestListedPrice as getBestListedPriceService } from "@/services/retailers/priceComparison";

export * from "@/services/retailers";

export interface RetailerClickEvent {
  productId: string;
  productName: string;
  retailerId: RetailerId;
  retailerName: string;
  price: number;
  targetUrl: string;
  clickType: "affiliate" | "product";
  timestamp: string; // ISO 8601 string
  source: "product_page" | "comparison" | "advisor";
}

/**
 * Tracking abstraction for outgoing retailer clicks.
 */
export function handleRetailerClick(event: RetailerClickEvent): void {
  if (process.env.NODE_ENV !== "production") {
    // console.debug("[Retailer Click Event]:", event);
  }
}

/**
 * Deterministically finds the lowest available listed price among valid retailer offers.
 * Ignores out-of-stock listings.
 */
export function getBestRetailerOffer(
  laptop: Laptop,
  targetCurrency?: CurrencyCode,
  targetCountry?: CountryCode
): RetailerOffer | null {
  if (!laptop.offers || laptop.offers.length === 0) {
    return null;
  }
  return getBestListedPriceService(laptop.offers, targetCurrency || laptop.currency, targetCountry);
}

/**
 * Re-export getBestListedPrice
 */
export function getBestListedPrice(
  offers: RetailerOffer[] | undefined | null,
  currency?: CurrencyCode,
  country?: CountryCode
): RetailerOffer | null {
  return getBestListedPriceService(offers, currency, country);
}

/**
 * Sorts retailer offers based on user preference
 */
export function sortRetailerOffers(
  offers: RetailerOffer[],
  sortKey: RetailerSortOption = "price-asc"
): RetailerOffer[] {
  return [...offers].sort((a, b) => {
    if (a.availability === "out-of-stock" && b.availability !== "out-of-stock") return 1;
    if (a.availability !== "out-of-stock" && b.availability === "out-of-stock") return -1;

    switch (sortKey) {
      case "price-asc":
        return a.price - b.price;
      case "discount-desc":
        return (b.discount || 0) - (a.discount || 0);
      case "retailer":
        return a.retailerName.localeCompare(b.retailerName);
      default:
        return a.price - b.price;
    }
  });
}
