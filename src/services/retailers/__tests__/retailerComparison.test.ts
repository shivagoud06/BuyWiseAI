import {
  validateRetailerOffer,
  validateRetailerOffers,
  getBestListedPrice,
  matchOfferToProduct,
} from "../index";
import { formatCurrency, formatINR, formatPrice } from "@/lib/utils";
import { Laptop, RetailerOffer } from "@/types";

// Base sample test laptop
const sampleLaptop: Laptop = {
  id: "test-laptop-1",
  brand: "Lenovo",
  model: "15IRH8",
  fullName: "Lenovo LOQ 15IRH8 (15.6-inch, Core i5 12th Gen, 16GB, 512GB SSD, RTX 4050)",
  name: "Lenovo LOQ 15",
  sku: "82XV00BRIN",
  category: "Entry Gaming",
  price: 72990,
  mrp: 98190,
  originalPrice: 98190,
  discount: 26,
  currency: "INR",
  image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
  processor: "Intel Core i5 12450H (8 Cores, 12 Threads)",
  processorFamily: "Intel Core i5",
  ram: "16GB DDR5 4800MHz",
  ramSize: 16,
  storage: "512GB PCIe 4.0 NVMe SSD",
  display: '15.6" FHD 144Hz IPS',
  gpu: "NVIDIA GeForce RTX 4050 6GB",
  gpuCategory: "NVIDIA",
  battery: "60Wh (Up to 6 hours)",
  rating: 4.5,
  reviewCount: 2150,
  buyWiseScore: 88,
  scoreBreakdown: {
    performance: 89,
    priceValue: 88,
    features: 86,
    display: 86,
    battery: 80,
  },
  verdict: "BUY",
  verdictReason: "Best value RTX 4050 laptop under ₹75k.",
  useCases: ["Gaming", "Programming"],
  pros: ["Fast RTX 4050 GPU", "16GB DDR5 RAM"],
  cons: ["2.4kg weight"],
  dataStatus: "verified",
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, testName: string, message?: string) {
  if (!condition) {
    testResults.push({ name: testName, passed: false, error: message || "Assertion failed" });
  } else {
    testResults.push({ name: testName, passed: true });
  }
}

export function runAllRetailerTests(): { total: number; passed: number; failed: number; results: TestResult[] } {
  // =========================================================================
  // TEST 1: Multiple valid retailer offers -> picks lowest price
  // =========================================================================
  const offers1: RetailerOffer[] = [
    {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 72990,
      mrp: 98190,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
    {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: 70990,
      mrp: 98190,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
    {
      retailerId: "croma",
      retailerName: "Croma",
      price: 74490,
      mrp: 98190,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
  ];

  const best1 = getBestListedPrice(offers1, "INR");
  assert(best1 !== null && best1.retailerId === "flipkart" && best1.price === 70990, "Test 1: Multiple valid retailer offers returns lowest price offer (Flipkart ₹70,990)");

  // =========================================================================
  // TEST 2: One valid retailer offer
  // =========================================================================
  const offers2: RetailerOffer[] = [
    {
      retailerId: "croma",
      retailerName: "Croma",
      price: 74490,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
  ];
  const best2 = getBestListedPrice(offers2, "INR");
  assert(best2 !== null && best2.retailerId === "croma" && best2.price === 74490, "Test 2: Single valid offer returns that offer");

  // =========================================================================
  // TEST 3: No retailer offers -> returns null
  // =========================================================================
  const best3 = getBestListedPrice([], "INR");
  const best3Null = getBestListedPrice(null, "INR");
  assert(best3 === null && best3Null === null, "Test 3: Empty or null offers return null");

  // =========================================================================
  // TEST 4: Null or undefined price -> rejected by validator & best listed price
  // =========================================================================
  const nullPriceOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: null as any,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const val4 = validateRetailerOffer(nullPriceOffer);
  const best4 = getBestListedPrice([nullPriceOffer as any], "INR");
  assert(!val4.isValid && best4 === null, "Test 4: Null price offer is rejected");

  // =========================================================================
  // TEST 5: Invalid price (<= 0 or NaN or string)
  // =========================================================================
  const invalidPriceOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: -500,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const val5 = validateRetailerOffer(invalidPriceOffer);
  const best5 = getBestListedPrice([invalidPriceOffer as any], "INR");
  assert(!val5.isValid && best5 === null, "Test 5: Negative/zero price is rejected");

  // =========================================================================
  // TEST 6: Unavailable retailer (out-of-stock) -> ignored in best listed price
  // =========================================================================
  const offers6: RetailerOffer[] = [
    {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: 65000, // Cheapest, but out of stock!
      currency: "INR",
      countryCode: "IN",
      availability: "out-of-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
    {
      retailerId: "amazon",
      retailerName: "Amazon",
      price: 72990,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
  ];
  const best6 = getBestListedPrice(offers6, "INR");
  assert(best6 !== null && best6.retailerId === "amazon" && best6.price === 72990, "Test 6: Out-of-stock cheapest offer is ignored; in-stock offer chosen");

  // =========================================================================
  // TEST 7: Product URL only
  // =========================================================================
  const offer7: RetailerOffer = {
    retailerId: "croma",
    retailerName: "Croma",
    price: 74990,
    currency: "INR",
    countryCode: "IN",
    productUrl: "https://www.croma.com/lenovo-loq-15",
    affiliateUrl: null,
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: false,
  };
  const val7 = validateRetailerOffer(offer7);
  assert(val7.isValid && offer7.productUrl !== null && offer7.affiliateUrl === null, "Test 7: Direct product URL with no affiliate URL validated");

  // =========================================================================
  // TEST 8: Affiliate URL
  // =========================================================================
  const offer8: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: 72990,
    currency: "INR",
    countryCode: "IN",
    productUrl: "https://www.amazon.in/dp/B0CX219J77",
    affiliateUrl: "https://amazon.in/dp/B0CX219J77?tag=buywiseai-21",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const val8 = validateRetailerOffer(offer8);
  assert(val8.isValid && Boolean(val8.offer?.affiliateUrl?.includes("tag=")), "Test 8: Affiliate URL validated and compliant");

  // =========================================================================
  // TEST 9: No URL ("Coming soon")
  // =========================================================================
  const offer9: RetailerOffer = {
    retailerId: "reliance-digital",
    retailerName: "Reliance Digital",
    price: 73990,
    currency: "INR",
    countryCode: "IN",
    productUrl: null,
    affiliateUrl: null,
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const val9 = validateRetailerOffer(offer9);
  assert(val9.isValid && !offer9.productUrl && !offer9.affiliateUrl, "Test 9: Offer with null URLs is valid schema for Coming Soon state without fake URLs");

  // =========================================================================
  // TEST 10: Different Currencies -> isolated comparison
  // =========================================================================
  const multiCurrencyOffers: RetailerOffer[] = [
    {
      retailerId: "amazon-us",
      retailerName: "Amazon US",
      price: 899,
      currency: "USD",
      countryCode: "US",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
    {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 72990,
      currency: "INR",
      countryCode: "IN",
      availability: "in-stock",
      lastUpdated: "2026-08-18",
      affiliateEligible: true,
    },
  ];
  const inrBest = getBestListedPrice(multiCurrencyOffers, "INR");
  const usdBest = getBestListedPrice(multiCurrencyOffers, "USD");
  assert(inrBest?.price === 72990 && usdBest?.price === 899, "Test 10: Currencies are strictly separated without mixing nominal rates");

  // =========================================================================
  // TEST 11: Different Markets
  // =========================================================================
  const usBestMarket = getBestListedPrice(multiCurrencyOffers, "USD", "US");
  assert(usBestMarket?.countryCode === "US", "Test 11: Market country matching works as expected");

  // =========================================================================
  // TEST 12: Exact Product Configuration Matching
  // =========================================================================
  // 12a. RAM Mismatch: 8GB offer for 16GB laptop
  const ramMismatchOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 58990,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    offerText: "Lenovo LOQ 8GB RAM 512GB SSD",
    affiliateEligible: true,
  };
  const matchRam = matchOfferToProduct(ramMismatchOffer, sampleLaptop);
  assert(!matchRam.isMatch, "Test 12a: 8GB RAM offer rejected for 16GB laptop configuration");

  // 12b. GPU Mismatch: Integrated GPU offer for RTX 4050 laptop
  const gpuMismatchOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 52990,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    offerText: "Lenovo LOQ Intel UHD integrated graphics only",
    affiliateEligible: true,
  };
  const matchGpu = matchOfferToProduct(gpuMismatchOffer, sampleLaptop);
  assert(!matchGpu.isMatch, "Test 12b: Integrated GPU offer rejected for dedicated RTX 4050 laptop");

  // 12c. SKU Mismatch
  const skuMismatchOffer: RetailerOffer = {
    retailerId: "croma",
    retailerName: "Croma",
    price: 74990,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    matchedSku: "WRONG-SKU-999",
    affiliateEligible: true,
  };
  const matchSku = matchOfferToProduct(skuMismatchOffer, sampleLaptop);
  assert(!matchSku.isMatch, "Test 12c: SKU mismatch offer rejected");

  // =========================================================================
  // TEST 13 & 14 & 15: Currency and Price Formatter Output Verification
  // =========================================================================
  const formattedInr = formatINR(54999);
  const formattedNull = formatINR(null);
  const formattedPriceFn = formatPrice(72990, "INR");
  assert(formattedInr.includes("54,999") && formattedInr.includes("₹"), "Test 13: formatINR formats standard INR ₹54,999");
  assert(formattedNull === "Price unavailable", "Test 14: formatINR returns 'Price unavailable' for null/empty values");
  assert(formattedPriceFn.includes("72,990"), "Test 15: formatPrice utility produces correct formatted output");

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;

  return {
    total: testResults.length,
    passed: passedCount,
    failed: failedCount,
    results: testResults,
  };
}
