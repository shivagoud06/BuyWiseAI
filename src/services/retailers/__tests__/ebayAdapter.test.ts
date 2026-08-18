import {
  EbayAdapter,
  getEbayConfig,
  buildEbaySearchQuery,
  normalizeEbayItem,
  EbayRawItemSummary,
} from "../adapters/ebay";
import { RETAILER_REGISTRY, getRetailerInfo } from "../registry";
import { matchOfferToProduct } from "../matcher";
import { validateRetailerOffer } from "../validator";
import { ALL_RETAILER_ADAPTERS } from "../index";
import { Laptop } from "@/types";

/**
 * =========================================================================
 * TEST FIXTURES (CLEARLY MARKED OFFLINE MOCK FIXTURES FOR UNIT TESTING)
 * NEVER USED AS LIVE DATA.
 * =========================================================================
 */
export const MOCK_TEST_FIXTURE_EBAY_ITEM_EXACT: EbayRawItemSummary = {
  itemId: "v1|123456789012|0",
  title: "Lenovo LOQ 15.6 Gaming Laptop Intel i7-13650HX 16GB RAM 512GB SSD RTX 4060",
  price: {
    value: "949.99",
    currency: "USD",
  },
  itemWebUrl: "https://www.ebay.com/itm/123456789012",
  itemAffiliateWebUrl: "https://rover.ebay.com/rover/1/711-53200-19255-0/1?mpre=https://www.ebay.com/itm/123456789012",
  buyingOptions: ["FIXED_PRICE"],
  condition: "New",
  shippingOptions: [
    {
      shippingCost: {
        value: "0.00",
        currency: "USD",
      },
      shippingCostType: "FREE",
    },
  ],
  itemLocation: {
    country: "US",
  },
  mpn: "83DV00BEIN",
};

export const MOCK_TEST_FIXTURE_EBAY_ITEM_RAM_MISMATCH: EbayRawItemSummary = {
  itemId: "v1|987654321098|0",
  title: "Lenovo LOQ 15.6 Gaming Laptop 8GB RAM 512GB SSD RTX 4060",
  price: {
    value: "799.99",
    currency: "USD",
  },
  itemWebUrl: "https://www.ebay.com/itm/987654321098",
  buyingOptions: ["FIXED_PRICE"],
  shippingOptions: [
    {
      shippingCost: {
        value: "15.00",
        currency: "USD",
      },
    },
  ],
  itemLocation: {
    country: "US",
  },
};

export const MOCK_TEST_FIXTURE_PRODUCT: Laptop = {
  id: "lenovo-loq-15irh8",
  brand: "Lenovo",
  model: "15IRH8",
  fullName: "Lenovo LOQ 15IRH8 (15.6-inch, Core i7 13th Gen, 16GB, 512GB SSD, RTX 4060)",
  name: "Lenovo LOQ 15",
  sku: "83DV00BEIN",
  price: 89990,
  currency: "INR",
  image: "https://example.com/laptop.jpg",
  processor: "Intel Core i7-13650HX",
  processorFamily: "Intel Core i7",
  ram: "16GB DDR5",
  ramSize: 16,
  storage: "512GB SSD",
  display: '15.6" FHD 144Hz',
  gpu: "NVIDIA GeForce RTX 4060 8GB",
  gpuCategory: "NVIDIA",
  battery: "60Wh",
  rating: 4.5,
  reviewCount: 200,
  buyWiseScore: 88,
  scoreBreakdown: {
    performance: 90,
    priceValue: 85,
    features: 88,
    display: 86,
    battery: 80,
  },
  verdict: "BUY",
  verdictReason: "Great performance",
  useCases: ["Gaming", "Programming"],
  pros: ["Fast GPU"],
  cons: ["Moderate battery"],
  dataStatus: "verified",
};

/**
 * Runs all unit tests for the eBay Retailer Adapter
 */
export function runEbayAdapterTests(): { total: number; passed: number; failed: number; results: Array<{ name: string; passed: boolean; error?: string }> } {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Adapter Registration
  test("Test 1: eBay adapter is registered in RETAILER_REGISTRY and ALL_RETAILER_ADAPTERS", () => {
    const regInfo = getRetailerInfo("ebay");
    if (!regInfo || regInfo.id !== "ebay") throw new Error("eBay not found in registry");
    if (regInfo.name !== "eBay") throw new Error(`Unexpected name: ${regInfo.name}`);
    const foundAdapter = ALL_RETAILER_ADAPTERS.find((a) => a.id === "ebay");
    if (!foundAdapter) throw new Error("EbayAdapter not found in ALL_RETAILER_ADAPTERS");
  });

  // 2. Not-Connected State
  test("Test 2: eBay adapter is marked as not_connected with isLiveApiConnected: false", () => {
    const regInfo = RETAILER_REGISTRY.ebay;
    if (regInfo.connectionStatus !== "not_connected") {
      throw new Error(`Expected connectionStatus 'not_connected', got '${regInfo.connectionStatus}'`);
    }
    if (EbayAdapter.connectionStatus !== "not_connected") {
      throw new Error(`Expected adapter connectionStatus 'not_connected', got '${EbayAdapter.connectionStatus}'`);
    }
    if (EbayAdapter.isLiveApiConnected !== false) {
      throw new Error("Expected isLiveApiConnected to be false while approval is pending");
    }
  });

  // 3. Missing Credentials / Pending Approval
  test("Test 3: Missing credentials handled safely by getEbayConfig", () => {
    const config = getEbayConfig();
    if (config.accountStatus !== "pending_approval") {
      throw new Error("Expected accountStatus to be pending_approval");
    }
    // Should return object without throwing
    if (typeof config.isConfigured !== "boolean") {
      throw new Error("Expected isConfigured boolean");
    }
  });

  // 4. Secure Environment Variable Handling
  test("Test 4: eBay configuration uses server-side variables without NEXT_PUBLIC prefix", () => {
    if (process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET) {
      throw new Error("NEXT_PUBLIC_EBAY_CLIENT_SECRET must never be defined");
    }
    if (process.env.NEXT_PUBLIC_EBAY_CLIENT_ID) {
      throw new Error("NEXT_PUBLIC_EBAY_CLIENT_ID must never be defined");
    }
  });

  // 5. Search Query Builder
  test("Test 5: buildEbaySearchQuery constructs clean search query from Laptop specs", () => {
    const query = buildEbaySearchQuery(MOCK_TEST_FIXTURE_PRODUCT);
    if (!query.includes("Lenovo") || !query.includes("LOQ") || !query.includes("16GB")) {
      throw new Error(`Generated search query '${query}' missing expected terms`);
    }
  });

  // 6. Response Normalization with Test Fixture
  test("Test 6: normalizeEbayItem normalizes raw eBay Browse item summary into standard RetailerOffer", () => {
    const offer = normalizeEbayItem(MOCK_TEST_FIXTURE_EBAY_ITEM_EXACT);
    if (!offer) throw new Error("Expected non-null normalized offer");
    if (offer.retailerId !== "ebay") throw new Error(`Expected retailerId 'ebay', got '${offer.retailerId}'`);
    if (offer.price !== 949.99) throw new Error(`Expected price 949.99, got ${offer.price}`);
    if (offer.currency !== "USD") throw new Error(`Expected currency 'USD', got '${offer.currency}'`);
    if (offer.productUrl !== "https://www.ebay.com/itm/123456789012") throw new Error(`Invalid productUrl: ${offer.productUrl}`);
    if (offer.availability !== "in-stock") throw new Error(`Invalid availability: ${offer.availability}`);
  });

  // 7. Price Normalization with Shipping
  test("Test 7: normalizeEbayItem includes shipping cost in total price", () => {
    const offer = normalizeEbayItem(MOCK_TEST_FIXTURE_EBAY_ITEM_RAM_MISMATCH);
    if (!offer) throw new Error("Expected non-null normalized offer");
    // 799.99 + 15.00 = 814.99
    if (Math.abs(offer.price - 814.99) > 0.01) {
      throw new Error(`Expected price 814.99 (including shipping), got ${offer.price}`);
    }
  });

  // 8. Currency Normalization
  test("Test 8: Preserves eBay returned currency (USD, GBP, EUR)", () => {
    const gbpItem: EbayRawItemSummary = {
      ...MOCK_TEST_FIXTURE_EBAY_ITEM_EXACT,
      price: { value: "850.00", currency: "GBP" },
    };
    const offer = normalizeEbayItem(gbpItem);
    if (!offer || offer.currency !== "GBP") {
      throw new Error(`Expected GBP currency preservation, got ${offer?.currency}`);
    }
  });

  // 9. Exact Product Matching
  test("Test 9: Exact product match verified with SKU, RAM, and GPU", () => {
    const offer = normalizeEbayItem(MOCK_TEST_FIXTURE_EBAY_ITEM_EXACT);
    if (!offer) throw new Error("Offer failed normalization");
    const match = matchOfferToProduct(offer, MOCK_TEST_FIXTURE_PRODUCT);
    if (!match.isMatch || match.confidence !== "exact") {
      throw new Error(`Expected exact match, got ${JSON.stringify(match)}`);
    }
  });

  // 10. Rejection of Mismatched RAM
  test("Test 10: Rejects offer with 8GB RAM for 16GB required laptop", () => {
    const offer = normalizeEbayItem(MOCK_TEST_FIXTURE_EBAY_ITEM_RAM_MISMATCH);
    if (!offer) throw new Error("Offer failed normalization");
    const match = matchOfferToProduct(offer, MOCK_TEST_FIXTURE_PRODUCT);
    if (match.isMatch) {
      throw new Error("Expected RAM mismatch rejection but offer passed");
    }
  });

  // 11. Validation Layer Integration
  test("Test 11: validateRetailerOffer validates eBay offer schema and exact product constraint", () => {
    const validOffer = normalizeEbayItem(MOCK_TEST_FIXTURE_EBAY_ITEM_EXACT);
    const res = validateRetailerOffer(validOffer, MOCK_TEST_FIXTURE_PRODUCT);
    if (!res.isValid || !res.offer) {
      throw new Error(`Expected valid offer validation, issues: ${JSON.stringify(res.issues)}`);
    }
  });

  // 12. Safe Not-Connected Adapter Execution
  test("Test 12: EbayAdapter.getOffers returns empty array safely when not connected", async () => {
    const offers = await EbayAdapter.getOffers({ product: MOCK_TEST_FIXTURE_PRODUCT });
    if (!Array.isArray(offers) || offers.length !== 0) {
      throw new Error("Expected empty array while adapter is not connected");
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { total: results.length, passed, failed, results };
}
