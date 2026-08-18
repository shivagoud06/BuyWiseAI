import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQuery,
  normalizeQuickCommerceItem,
  mapPlatformToRetailer,
  RawQuickCommerceProduct,
} from "../adapters/quickcommerce";
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
export const MOCK_TEST_FIXTURE_QC_AMAZON_EXACT: RawQuickCommerceProduct = {
  id: "B0CX8XQ123",
  title: "Lenovo LOQ 15.6 inch Gaming Laptop Intel Core i7-13650HX 16GB DDR5 512GB SSD NVIDIA RTX 4060 8GB",
  price: 89990,
  mrp: 114990,
  platform: "Amazon",
  currency: "INR",
  deeplink: "https://www.amazon.in/dp/B0CX8XQ123",
  in_stock: true,
  sku: "83DV00BEIN",
  brand: "Lenovo",
};

export const MOCK_TEST_FIXTURE_QC_FLIPKART_EXACT: RawQuickCommerceProduct = {
  id: "FLIPKART_LOQ_4060",
  title: "Lenovo LOQ Intel Core i7 13th Gen 16GB RAM 512GB SSD RTX 4060 Graphics",
  price: "88990",
  mrp: "112990",
  platform: "Flipkart",
  currency: "INR",
  deeplink: "https://www.flipkart.com/lenovo-loq-i7-13th-gen/p/itm12345",
  availability: "in-stock",
};

export const MOCK_TEST_FIXTURE_QC_RAM_MISMATCH: RawQuickCommerceProduct = {
  id: "B0CX8XQ888",
  title: "Lenovo LOQ Gaming Laptop 8GB RAM 512GB SSD RTX 4060",
  price: 74990,
  platform: "Amazon",
  currency: "INR",
  deeplink: "https://www.amazon.in/dp/B0CX8XQ888",
  in_stock: true,
};

export const MOCK_TEST_FIXTURE_QC_GPU_MISMATCH: RawQuickCommerceProduct = {
  id: "B0CX8XQ450",
  title: "Lenovo LOQ Gaming Laptop 16GB RAM 512GB SSD RTX 4050",
  price: 78990,
  platform: "Amazon",
  currency: "INR",
  deeplink: "https://www.amazon.in/dp/B0CX8XQ450",
  in_stock: true,
};

export const MOCK_TEST_FIXTURE_LAPTOP: Laptop = {
  id: "lenovo-loq-15irh8",
  brand: "Lenovo",
  model: "15IRH8",
  fullName: "Lenovo LOQ 15IRH8 (15.6-inch, Core i7 13th Gen, 16GB, 512GB SSD, RTX 4060)",
  name: "Lenovo LOQ 15",
  sku: "83DV00BEIN",
  price: 89990,
  currency: "INR",
  image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
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
 * Executes unit tests for the QuickCommerce Retailer Adapter
 */
export function runQuickCommerceAdapterTests(): {
  total: number;
  passed: number;
  failed: number;
  results: Array<{ name: string; passed: boolean; error?: string }>;
} {
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
  test("Test 1: QuickCommerce adapter registered in RETAILER_REGISTRY and ALL_RETAILER_ADAPTERS", () => {
    const regInfo = getRetailerInfo("quickcommerce");
    if (!regInfo || regInfo.id !== "quickcommerce") throw new Error("QuickCommerce not found in registry");
    const foundAdapter = ALL_RETAILER_ADAPTERS.find((a) => a.id === "quickcommerce");
    if (!foundAdapter) throw new Error("QuickCommerceAdapter not found in ALL_RETAILER_ADAPTERS");
  });

  // 2. Environment Variable Handling
  test("Test 2: Environment configuration reads QUICKCOMMERCE_API_KEY safely without NEXT_PUBLIC prefix", () => {
    if (process.env.NEXT_PUBLIC_QUICKCOMMERCE_API_KEY) {
      throw new Error("NEXT_PUBLIC_QUICKCOMMERCE_API_KEY must never be defined in client-side code");
    }
    const config = getQuickCommerceConfig();
    if (typeof config.isConfigured !== "boolean") {
      throw new Error("Expected boolean isConfigured in config");
    }
  });

  // 3. Platform Identification
  test("Test 3: mapPlatformToRetailer correctly maps platforms (Amazon, Flipkart, Croma, Reliance)", () => {
    const amz = mapPlatformToRetailer("Amazon India");
    if (amz.retailerId !== "amazon" || amz.retailerName !== "Amazon India") {
      throw new Error(`Expected amazon, got ${JSON.stringify(amz)}`);
    }

    const flp = mapPlatformToRetailer("Flipkart");
    if (flp.retailerId !== "flipkart" || flp.retailerName !== "Flipkart") {
      throw new Error(`Expected flipkart, got ${JSON.stringify(flp)}`);
    }

    const crm = mapPlatformToRetailer("Croma");
    if (crm.retailerId !== "croma" || crm.retailerName !== "Croma") {
      throw new Error(`Expected croma, got ${JSON.stringify(crm)}`);
    }

    const rel = mapPlatformToRetailer("Reliance Digital");
    if (rel.retailerId !== "reliance-digital" || rel.retailerName !== "Reliance Digital") {
      throw new Error(`Expected reliance-digital, got ${JSON.stringify(rel)}`);
    }
  });

  // 4. Search Query Construction
  test("Test 4: buildQuickCommerceSearchQuery constructs clean, targeted query", () => {
    const q = buildQuickCommerceSearchQuery(MOCK_TEST_FIXTURE_LAPTOP);
    if (!q.includes("Lenovo") || !q.includes("LOQ") || !q.includes("16GB")) {
      throw new Error(`Unexpected search query: ${q}`);
    }
  });

  // 5. Response Normalization
  test("Test 5: normalizeQuickCommerceItem normalizes Amazon raw product into RetailerOffer", () => {
    const offer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_AMAZON_EXACT);
    if (!offer) throw new Error("Expected normalized offer");
    if (offer.retailerId !== "amazon") throw new Error(`Expected retailerId amazon, got ${offer.retailerId}`);
    if (offer.price !== 89990) throw new Error(`Expected price 89990, got ${offer.price}`);
    if (offer.mrp !== 114990) throw new Error(`Expected mrp 114990, got ${offer.mrp}`);
    if (offer.currency !== "INR") throw new Error(`Expected currency INR, got ${offer.currency}`);
    if (offer.productUrl !== "https://www.amazon.in/dp/B0CX8XQ123") throw new Error(`Invalid URL: ${offer.productUrl}`);
  });

  test("Test 6: normalizeQuickCommerceItem normalizes Flipkart raw product with string price", () => {
    const offer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_FLIPKART_EXACT);
    if (!offer) throw new Error("Expected normalized offer");
    if (offer.retailerId !== "flipkart") throw new Error(`Expected retailerId flipkart, got ${offer.retailerId}`);
    if (offer.price !== 88990) throw new Error(`Expected parsed price 88990, got ${offer.price}`);
    if (offer.currency !== "INR") throw new Error(`Expected currency INR, got ${offer.currency}`);
  });

  // 6. Availability Normalization
  test("Test 7: Normalizes in-stock and out-of-stock availability cleanly", () => {
    const oInStock = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_AMAZON_EXACT);
    if (!oInStock || oInStock.availability !== "in-stock") throw new Error("Expected in-stock availability");

    const oOutOfStock = normalizeQuickCommerceItem({
      ...MOCK_TEST_FIXTURE_QC_AMAZON_EXACT,
      in_stock: false,
    });
    if (!oOutOfStock || oOutOfStock.availability !== "out-of-stock") throw new Error("Expected out-of-stock availability");
  });

  // 7. URL Validation
  test("Test 8: Rejects invalid or unsafe URLs and preserves valid http/https URLs", () => {
    const oBadUrl = normalizeQuickCommerceItem({
      ...MOCK_TEST_FIXTURE_QC_AMAZON_EXACT,
      deeplink: "javascript:alert(1)",
    });
    if (!oBadUrl || oBadUrl.productUrl !== null) {
      throw new Error(`Expected null productUrl for javascript: scheme, got ${oBadUrl?.productUrl}`);
    }
  });

  // 8. Exact Laptop Matching
  test("Test 9: Exact laptop matching passes for identical SKU and 16GB + RTX 4060 specs", () => {
    const offer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_AMAZON_EXACT);
    if (!offer) throw new Error("Normalization failed");
    const match = matchOfferToProduct(offer, MOCK_TEST_FIXTURE_LAPTOP);
    if (!match.isMatch || match.confidence !== "exact") {
      throw new Error(`Expected exact match, got ${JSON.stringify(match)}`);
    }
  });

  // 9. Rejection of RAM Mismatch
  test("Test 10: Rejects 8GB RAM offer for 16GB required laptop", () => {
    const offer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_RAM_MISMATCH);
    if (!offer) throw new Error("Normalization failed");
    const match = matchOfferToProduct(offer, MOCK_TEST_FIXTURE_LAPTOP);
    if (match.isMatch) {
      throw new Error("Expected RAM mismatch rejection but offer passed");
    }
  });

  // 10. Rejection of GPU Tier Mismatch
  test("Test 11: Rejects RTX 4050 offer for RTX 4060 required laptop", () => {
    const offer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_GPU_MISMATCH);
    if (!offer) throw new Error("Normalization failed");
    const match = matchOfferToProduct(offer, MOCK_TEST_FIXTURE_LAPTOP);
    if (match.isMatch) {
      throw new Error("Expected GPU mismatch rejection but offer passed");
    }
  });

  // 11. Offer Validator Integration
  test("Test 12: validateRetailerOffer accepts valid normalized offer and verifies against laptop", () => {
    const validOffer = normalizeQuickCommerceItem(MOCK_TEST_FIXTURE_QC_AMAZON_EXACT);
    const res = validateRetailerOffer(validOffer, MOCK_TEST_FIXTURE_LAPTOP);
    if (!res.isValid || !res.offer) {
      throw new Error(`Validation failed: ${JSON.stringify(res.issues)}`);
    }
  });

  // 12. No Fake Prices Behavior
  test("Test 13: Rejects invalid, 0, or negative price items without inventing prices", () => {
    const zeroPrice = normalizeQuickCommerceItem({
      ...MOCK_TEST_FIXTURE_QC_AMAZON_EXACT,
      price: 0,
    });
    if (zeroPrice !== null) {
      throw new Error("Expected null for 0 price item");
    }

    const invalidPrice = normalizeQuickCommerceItem({
      ...MOCK_TEST_FIXTURE_QC_AMAZON_EXACT,
      price: "N/A",
    });
    if (invalidPrice !== null) {
      throw new Error("Expected null for non-numeric price");
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { total: results.length, passed, failed, results };
}
