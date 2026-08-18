import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer } from "@/types";

export const FlipkartAdapter: RetailerAdapter = {
  id: "flipkart",
  name: "Flipkart",
  countryCode: "IN",
  currency: "INR",
  connectionStatus: "not_connected",
  dataSourceType: "affiliate_feed",
  source: "affiliate_feed",
  isLiveApiConnected: false,
  searchProducts: async () => [],
  getProduct: async () => null,
  getOffers: async (_query: RetailerQuery): Promise<RetailerOffer[]> => {
    if (!FlipkartAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },
};
