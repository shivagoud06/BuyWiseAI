import {
  RETAILER_REGISTRY,
  getRetailerInfo,
  getRetailersForCountry,
  validateRetailerOffer,
  validateRetailerOffers,
  matchOfferToProduct,
  getBestListedPrice,
  ALL_RETAILER_ADAPTERS,
} from "../index";
import { Laptop, RetailerOffer } from "@/types";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const sampleLaptop: Laptop = {
  id: "test-laptop-1",
  brand: "Acer",
  model: "AL15-52",
  fullName: "Acer Aspire Lite AL15-52",
  name: "Acer Aspire Lite 15",
  sku: "UN.485SI.001",
  category: "Entry Everyday Laptop",
  price: 31990,
  currency: "INR",
  image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
  processor: "Intel Core i3 1215U",
  processorFamily: "Intel Core i3",
  ram: "8GB DDR4",
  ramSize: 8,
  storage: "512GB SSD",
  display: "15.6 FHD",
  gpu: "Intel UHD",
  gpuCategory: "Integrated",
  battery: "36Wh",
  weight: "1.59kg",
  operatingSystem: "Windows 11",
  rating: 4.1,
  reviewCount: 100,
  buyWiseScore: 80,
  scoreBreakdown: { performance: 70, priceValue: 90, features: 80, display: 75, battery: 75 },
  verdict: "BUY",
  verdictReason: "Great budget choice",
  useCases: ["Student"],
  pros: ["Good price"],
  cons: ["Average battery"],
  dataStatus: "verified",
};

export function runUniversalRetailerTests(): { total: number; passed: number; failed: number; results: TestResult[] } {
  const results: TestResult[] = [];
  function assert(cond: boolean, name: string, msg?: string) {
    results.push({ name, passed: cond, error: cond ? undefined : msg || "Failed assertion" });
  }

  // 1. Central Retailer Registry Test
  const amazonInfo = getRetailerInfo("amazon");
  const vijayInfo = getRetailerInfo("vijay-sales");
  assert(amazonInfo.name === "Amazon India" && vijayInfo.name === "Vijay Sales", "1. Central Registry returns valid retailer metadata");

  // 2. Retailer Adapters Registered
  assert(ALL_RETAILER_ADAPTERS.length >= 6, "2. Universal adapter system contains 6+ retailer adapters");

  // 3. One retailer offer
  const offer1: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 31490,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const best1 = getBestListedPrice([offer1], "INR");
  assert(best1 !== null && best1.price === 31490 && best1.retailerId === "amazon", "3. Single valid offer returns Best Listed Price");

  // 4. Two retailers offer
  const offer2: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 31990,
    currency: "INR",
    countryCode: "IN",
    availability: "in-stock",
    lastUpdated: "2026-08-18",
    affiliateEligible: true,
  };
  const best2 = getBestListedPrice([offer1, offer2], "INR");
  assert(best2 !== null && best2.price === 31490 && best2.retailerId === "amazon", "4. Returns lowest price between 2 retailers (Amazon 31490)");

  // 5. Five retailers offers
  const offer3: RetailerOffer = { retailerId: "croma", retailerName: "Croma", price: 32490, currency: "INR", availability: "in-stock", lastUpdated: "2026-08-18", affiliateEligible: true };
  const offer4: RetailerOffer = { retailerId: "reliance-digital", retailerName: "Reliance Digital", price: 32990, currency: "INR", availability: "in-stock", lastUpdated: "2026-08-18", affiliateEligible: true };
  const offer5: RetailerOffer = { retailerId: "vijay-sales", retailerName: "Vijay Sales", price: 30990, currency: "INR", availability: "in-stock", lastUpdated: "2026-08-18", affiliateEligible: true };

  const multiOffers = [offer1, offer2, offer3, offer4, offer5];
  const best5 = getBestListedPrice(multiOffers, "INR");
  assert(best5 !== null && best5.price === 30990 && best5.retailerId === "vijay-sales", "5. Returns lowest price across 5 retailers (Vijay Sales ₹30,990)");

  // 6. No retailers / Empty list
  assert(getBestListedPrice([], "INR") === null, "6. Empty retailer list returns null");

  // 7. Invalid offer (null price)
  const invalidOffer: any = { retailerId: "amazon", retailerName: "Amazon", price: null, availability: "in-stock" };
  const valRes = validateRetailerOffer(invalidOffer);
  assert(!valRes.isValid, "7. Validator rejects null price offer");

  // 8. Out of stock retailer skipped
  const outOfStockOffer: RetailerOffer = { retailerId: "vijay-sales", retailerName: "Vijay Sales", price: 29990, currency: "INR", availability: "out-of-stock", lastUpdated: "2026-08-18", affiliateEligible: true };
  const bestWithOOS = getBestListedPrice([offer1, outOfStockOffer], "INR");
  assert(bestWithOOS !== null && bestWithOOS.price === 31490, "8. Out of stock listing skipped in Best Listed Price");

  // 9. Exact configuration matching (RAM mismatch)
  const badRamOffer: RetailerOffer = { ...offer1, offerText: "16GB RAM model" };
  const matchRes = matchOfferToProduct(badRamOffer, sampleLaptop);
  assert(!matchRes.isMatch, "9. Matcher rejects 16GB offer for 8GB laptop");

  // 10. Correct configuration matching
  const goodMatch = matchOfferToProduct({ ...offer1, matchedSku: "UN.485SI.001" }, sampleLaptop);
  assert(goodMatch.isMatch, "10. Matcher accepts exact SKU match");

  const passed = results.filter((r) => r.passed).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}
