import { RetailerAdapter, RetailerQuery } from "../types";
import { RetailerOffer } from "@/types";

export const VijaySalesAdapter: RetailerAdapter = {
  id: "vijay-sales",
  name: "Vijay Sales",
  countryCode: "IN",
  currency: "INR",
  connectionStatus: "not_connected",
  dataSourceType: "merchant_feed",
  source: "affiliate_feed",
  isLiveApiConnected: false,
  searchProducts: async () => [],
  getProduct: async () => null,
  getOffers: async (_query: RetailerQuery): Promise<RetailerOffer[]> => {
    if (!VijaySalesAdapter.isLiveApiConnected) {
      return [];
    }
    return [];
  },
};
