import {
  Laptop,
  RetailerOffer,
  RetailerId,
  CountryCode,
  CurrencyCode,
  OfferSourceType,
  RetailerConnectionStatus,
  RetailerDataSource,
} from "@/types";

export interface RetailerQuery {
  product: Laptop;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
}

export interface RetailerAdapter {
  id: RetailerId;
  name: string;
  countryCode: CountryCode;
  currency: CurrencyCode;
  connectionStatus: RetailerConnectionStatus;
  dataSourceType: RetailerDataSource;
  source: OfferSourceType;
  isMock?: boolean;
  isLiveApiConnected: boolean;
  /**
   * Searches retailer catalog by keyword/query
   */
  searchProducts?: (query: string, options?: any) => Promise<unknown[]>;
  /**
   * Fetches product details by SKU / Product ID from retailer
   */
  getProduct?: (productIdOrSku: string) => Promise<unknown | null>;
  /**
   * Fetches offers from retailer for a specific product configuration.
   * Returns empty array if live integration is not yet connected.
   */
  getOffers: (query: RetailerQuery) => Promise<RetailerOffer[]>;
}

export interface ValidationIssue {
  field: string;
  message: string;
  receivedValue?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  offer: RetailerOffer | null;
  issues: ValidationIssue[];
}
