import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer } from "@/types";

export const AmazonAdapter: RetailerAdapter = {
  id: "amazon",
  name: "Amazon India",
  countryCode: "IN",
  currency: "INR",
  connectionStatus: "not_connected",
  dataSourceType: "api",
  source: "official_api",
  isLiveApiConnected: false,
  searchProducts: async () => [],
  getProduct: async () => null,
  getOffers: async (_query: RetailerQuery): Promise<RetailerOffer[]> => {
    if (!AmazonAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },
};
