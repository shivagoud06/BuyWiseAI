import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer } from "@/types";

export const OfficialStoreAdapter: RetailerAdapter = {
  id: "lenovo-store",
  name: "Official Brand Store",
  countryCode: "IN",
  currency: "INR",
  connectionStatus: "not_connected",
  dataSourceType: "api",
  source: "official_api",
  isLiveApiConnected: false,
  searchProducts: async () => [],
  getProduct: async () => null,
  getOffers: async (_query: RetailerQuery): Promise<RetailerOffer[]> => {
    if (!OfficialStoreAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },
};
