export type VerdictType = "BUY" | "WAIT" | "SKIP";

export type UseCaseType = "Student" | "Programming" | "Gaming" | "Office" | "Content Creation";

export type BrandType = "Lenovo" | "HP" | "Dell" | "ASUS" | "Acer" | "MSI" | "Apple";

export type RamSizeType = 8 | 16 | 18 | 24 | 32 | 64;

export type ProcessorFamilyType =
  | "Intel Core i3"
  | "Intel Core i5"
  | "Intel Core i7"
  | "Intel Core i9"
  | "Intel Core Ultra 7"
  | "AMD Ryzen 3"
  | "AMD Ryzen 5"
  | "AMD Ryzen 7"
  | "AMD Ryzen 9"
  | "Apple M-series"
  | "Snapdragon X Elite";

export type GpuCategoryType = "Integrated" | "NVIDIA" | "AMD" | "Apple";

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "OTHER";

export type CountryCode = "IN" | "US" | "UK" | "EU" | "OTHER";

export type RetailerId =
  | "amazon"
  | "flipkart"
  | "croma"
  | "reliance-digital"
  | "vijay-sales"
  | "lenovo-store"
  | "hp-store"
  | "asus-store"
  | "apple-store"
  | "dell-store"
  | "bestbuy-us"
  | "amazon-us"
  | "currys-uk"
  | "amazon-uk"
  | "amazon-de"
  | "ebay"
  | "quickcommerce";

export type RetailerConnectionStatus =
  | "not_connected"
  | "development"
  | "connected"
  | "disabled"
  | "error";

export type RetailerDataSource =
  | "api"
  | "affiliate_feed"
  | "merchant_feed"
  | "manual_verified"
  | "mock";

export interface RetailerInfo {
  id: RetailerId;
  name: string;
  countryCode: CountryCode;
  currency: CurrencyCode;
  logo?: string;
  enabled: boolean;
  connectionStatus: RetailerConnectionStatus;
  dataSourceType: RetailerDataSource;
  dataSource: string;
  affiliateSupported: boolean;
  iconColorClass?: string;
}

export type AvailabilityStatus = "in-stock" | "out-of-stock" | "limited-stock" | "pre-order";

export type OfferSourceType = "official_api" | "affiliate_feed" | "manual_verified" | "mock";

export type DiscountOfferType =
  | "retailer_discount"
  | "bank_offer"
  | "coupon"
  | "cashback"
  | "exchange_offer";

export interface DiscountOffer {
  offerId: string;
  retailerId: RetailerId;
  offerType: DiscountOfferType;
  title: string;
  description?: string | null;
  amount?: number | null;
  percentage?: number | null;
  currency: CurrencyCode;
  paymentMethod?: string | null;
  bankName?: string | null;
  cardType?: string | null;
  couponCode?: string | null;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  stackable: boolean;
  verified: boolean;
  source?: OfferSourceType;
  isMock?: boolean;
  lastUpdated: string;
  exchangeMaxAmount?: number | null;
}

export interface RetailerOffer {
  retailerId: RetailerId;
  retailerName: string;
  countryCode?: CountryCode;
  price: number; // Price in the offer's currency
  mrp?: number | null; // MRP in the offer's currency
  discount?: number | null; // Percentage discount (e.g. 15%)
  currency: CurrencyCode;
  productUrl?: string | null; // Real product URL or null
  affiliateUrl?: string | null; // Real affiliate URL or null
  availability: AvailabilityStatus;
  lastUpdated: string;
  offerText?: string;
  affiliateEligible: boolean;
  source?: OfferSourceType;
  isMock?: boolean;
  matchedSku?: string;
  matchedModel?: string;
  discounts?: DiscountOffer[];
}

export interface RegionalPricing {
  currency: CurrencyCode;
  country: CountryCode;
  price: number;
  originalPrice?: number | null;
  mrp?: number | null;
  discount?: number | null;
  offers?: RetailerOffer[];
}

export type RetailerSortOption = "price-asc" | "discount-desc" | "retailer";

export interface ScoreBreakdown {
  performance: number; // 0 - 100
  priceValue: number;  // 0 - 100
  features: number;    // 0 - 100
  display: number;     // 0 - 100
  battery: number;     // 0 - 100
}

export type DataStatusType = "verified" | "partially-verified";

export interface Laptop {
  id: string;
  brand: BrandType;
  model: string; // Exact model code (e.g. "15IRH8", "UX3405MA")
  fullName: string; // Exact full retail name
  name: string; // Friendly display name (e.g. "Lenovo LOQ 15")
  sku?: string;
  category?: string;
  price: number | null; // Base reference price in INR (null if unverified)
  originalPrice?: number | null; // MRP in INR
  mrp?: number | null;
  discount?: number | null;
  currency: CurrencyCode;
  regionalPricing?: Partial<Record<CurrencyCode, RegionalPricing>>;
  image: string;
  imageUrl?: string;
  processor: string;
  processorFamily: ProcessorFamilyType;
  ram: string; // e.g. "16GB DDR5 4800MHz"
  ramSize: RamSizeType;
  storage: string; // e.g. "512GB PCIe 4.0 NVMe SSD"
  display: string; // e.g. '15.6" FHD (1920x1080) 144Hz IPS'
  gpu: string; // e.g. "NVIDIA GeForce RTX 4050 6GB"
  gpuCategory: GpuCategoryType;
  battery: string; // e.g. "60Wh (Up to 6 hours)"
  weight?: string; // e.g. "2.4 kg"
  operatingSystem?: string; // e.g. "Windows 11 Home"
  rating: number; // e.g. 4.5
  reviewCount: number;
  buyWiseScore: number; // 0 - 100
  scoreBreakdown: ScoreBreakdown;
  verdict: VerdictType;
  verdictReason: string;
  useCases: UseCaseType[];
  pros: string[];
  cons: string[];
  productUrl?: string | null;
  badge?: string; // e.g. "Best Value", "Top Pick", "Editors Choice"
  source?: string; // e.g. "Official Lenovo India Store"
  sourceUrl?: string | null;
  lastVerified?: string; // e.g. "2026-08-18"
  dataStatus: DataStatusType; // "verified" | "partially-verified"
  offers?: RetailerOffer[]; // Multi-retailer store offers
  discountOffers?: DiscountOffer[]; // Verified bank, coupon & cashback offers
}

export type PriceRangeFilter = "under-40k" | "40k-50k" | "50k-75k" | "75k-100k" | "above-100k";

export type BudgetMode = "under" | "around" | "above";

export interface FilterState {
  searchQuery: string;
  brands: BrandType[];
  priceRanges: PriceRangeFilter[];
  ramSizes: number[];
  processorFamilies: ProcessorFamilyType[];
  gpuCategories: GpuCategoryType[];
  useCases: UseCaseType[];
}

export type SortOption =
  | "recommended"
  | "best-match"
  | "price-asc"
  | "lowest-listed-price"
  | "price-desc"
  | "score-desc"
  | "rating-desc"
  | "best-value";

export type PriorityType =
  | "Performance"
  | "Battery"
  | "Portability"
  | "Display"
  | "Value for Money";

export type RamPreferenceType = "8GB" | "16GB" | "32GB" | "no-preference";

export type GpuPreferenceType =
  | "integrated"
  | "dedicated-preferred"
  | "gaming-required"
  | "no-preference";

export interface AdvisorInput {
  budget: PriceRangeFilter;
  rawBudgetAmount?: number;
  budgetMode?: BudgetMode;
  currency?: CurrencyCode;
  country?: CountryCode;
  primaryUse: UseCaseType;
  priorities: PriorityType[];
  ramPreference: RamPreferenceType;
  gpuPreference: GpuPreferenceType;
  preferredBrands?: BrandType[];
  minRam?: number;
  minStorage?: number;
  storagePreference?: "256GB" | "512GB" | "1TB" | "no-preference";
  minCpu?: string;
  minGpuTier?: "integrated" | "any-dedicated" | "rtx-3050" | "rtx-4050" | "rtx-4060" | "rtx-4070";
  displayRequirements?: "high-refresh" | "oled-color-accurate" | "standard" | "no-preference";
}

export interface RecommendationResult {
  laptop: Laptop;
  rank: number; // 1, 2, 3...
  rankLabel: string; // e.g. "BEST MATCH", "STRONG CONTENDER", "GREAT ALTERNATIVE"
  matchPercentage: number; // 0 - 100%
  whyItMatches: string[];
  potentialDrawback: string;
  warningNote?: string;
  isRelaxedMatch?: boolean;
  relaxedReason?: string;
  displayPrice?: number;
  displayCurrency?: CurrencyCode;
  displayOffers?: RetailerOffer[];
  matchScoreBreakdown?: {
    budgetScore: number;
    useCaseScore: number;
    specScore: number;
    priorityScore: number;
    buyWiseScore: number;
  };
}

export type UseCase = {
  id: string;
  label: string;
  description: string;
  iconName: string;
};

export type BudgetRange = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

export type PopularSearch = {
  id: string;
  title: string;
  useCase: string;
  tag: string;
  prompt: string;
  link: string;
};

export type StepItem = {
  step: number;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
};
