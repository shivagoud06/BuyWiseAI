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

/**
 * Universal Retailer Provider Interface
 * Standard abstraction for searching offers, retrieving individual retailer quotes, and validating offers.
 */
export interface RetailerProvider {
  /**
   * Search real offers across all supported retailer adapters for a given product
   */
  searchOffers: (
    product: Laptop,
    options?: { countryCode?: CountryCode; timeoutMs?: number }
  ) => Promise<RetailerOffer[]>;

  /**
   * Get an offer from a specific retailer for a product
   */
  getOffer: (product: Laptop, retailerId: RetailerId) => Promise<RetailerOffer | null>;

  /**
   * Validate a candidate retailer offer against data integrity and product configuration
   */
  validateOffer: (offer: unknown, product?: Laptop) => ValidationResult;
}

/**
 * Universal Affiliate Adapter Interface
 * Allows affiliate networks (such as Cuelinks, Amazon Associates, eBay EPN) to plug in dynamically.
 */
export interface AffiliateAdapter {
  id: string;
  name: string;
  /**
   * Checks whether required server-side credentials/keys are configured via environment variables
   */
  isConfigured: () => boolean;
  /**
   * Converts a real product URL into an authenticated tracking deeplink.
   * Returns null if unconfigured or unsupported.
   */
  convertProductUrlToAffiliateUrl: (
    productUrl: string,
    retailerId: RetailerId
  ) => Promise<string | null> | string | null;
}

