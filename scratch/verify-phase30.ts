import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import { findSmartSearchResults } from "../src/lib/smartSearch";
import { getLaptopRecommendations } from "../src/lib/recommendationEngine";
import { resolveRetailerOfferStatus, getBestListedPrice } from "../src/services/retailers/index";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { FilterState, Laptop, RetailerOffer, AdvisorInput } from "../src/types";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 30: PRODUCTION TRUST + SMART ALTERNATIVES VERIFICATION");
console.log("================================================================================");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

const emptyFilters: FilterState = {
  searchQuery: "",
  brands: [],
  priceRanges: [],
  ramSizes: [],
  processorFamilies: [],
  gpuCategories: [],
  useCases: [],
};

// -----------------------------------------------------------------------------
// 20 TESTS
// -----------------------------------------------------------------------------

// 1. Initial catalog renders >0 products
test("1. Initial catalog renders >0 products", () => {
  const result = findSmartSearchResults(LAPTOPS, emptyFilters);
  if (result.exactMatches.length === 0) {
    throw new Error("Initial catalog returned 0 exact matches");
  }
  if (result.totalAvailableCount < 20) {
    throw new Error(`Expected at least 20 catalog products, got ${result.totalAvailableCount}`);
  }
});

// 2. Exact search returns exact product
test("2. Exact search returns exact product", () => {
  const result = findSmartSearchResults(LAPTOPS, {
    ...emptyFilters,
    searchQuery: "HP Victus 15-fa2500tx",
  });
  if (result.isFallback) throw new Error("Exact query resulted in fallback");
  if (result.exactMatches.length === 0) throw new Error("Exact query returned 0 matches");
  if (!result.exactMatches.some((l) => l.id === "hp-victus-15-fa2500tx")) {
    throw new Error("Target exact laptop missing from exactMatches");
  }
});

// 3. No exact match finds reasonable alternatives
test("3. No exact match finds reasonable alternatives", () => {
  const result = findSmartSearchResults(LAPTOPS, {
    ...emptyFilters,
    searchQuery: "HP Victus RTX 4090", // Model does not exist in catalog
  });
  if (!result.isFallback) throw new Error("Expected isFallback: true for non-existent model");
  if (result.fallbackMatches.length === 0) {
    throw new Error("Fallback matches is empty when searching for uncataloged variation");
  }
});

// 4. Alternatives are real catalog products
test("4. Alternatives are real catalog products", () => {
  const result = findSmartSearchResults(LAPTOPS, {
    ...emptyFilters,
    searchQuery: "MacBook Pro OLED 32GB",
  });
  if (result.fallbackMatches.length === 0) throw new Error("Expected fallback matches");
  for (const alt of result.fallbackMatches) {
    const exists = LAPTOPS.some((l) => l.id === alt.id);
    if (!exists) throw new Error(`Invented product detected: ${alt.name}`);
    if (alt.isUpcoming) throw new Error(`Upcoming product found inside fallbackMatches: ${alt.name}`);
  }
});

// 5. Alternative explanation is present
test("5. Alternative explanation is present", () => {
  const result = findSmartSearchResults(LAPTOPS, {
    ...emptyFilters,
    searchQuery: "HP Victus RTX 4090",
  });
  if (!result.fallbackExplanations) throw new Error("fallbackExplanations object missing");
  const firstAlt = result.fallbackMatches[0];
  const explanation = result.fallbackExplanations[firstAlt.id];
  if (!explanation || explanation.trim().length === 0) {
    throw new Error(`Missing explanation for fallback laptop ${firstAlt.id}`);
  }
});

// 6. No fake products
test("6. No fake products in catalog", () => {
  for (const l of LAPTOPS) {
    if (!l.id || !l.name || !l.brand || !l.processor || !l.ram || !l.gpu) {
      throw new Error(`Incomplete / invalid product schema: ${JSON.stringify(l)}`);
    }
  }
});

// 7. No fake prices
test("7. No fake prices", () => {
  for (const l of LAPTOPS) {
    if (l.price !== null) {
      if (typeof l.price !== "number" || isNaN(l.price) || l.price <= 0) {
        throw new Error(`Invalid catalog price detected for ${l.name}: ${l.price}`);
      }
    }
  }
});

// 8. No fake availability
test("8. No fake availability", () => {
  for (const l of LAPTOPS) {
    if (l.isUpcoming && l.offers && l.offers.length > 0) {
      throw new Error(`Upcoming product ${l.name} has fake in-stock offers`);
    }
  }
});

// 9. Catalog reference price remains clearly labeled
test("9. Catalog reference price remains clearly labeled", () => {
  const whereToBuySource = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
  if (!whereToBuySource.includes("Official catalog reference price")) {
    throw new Error("WhereToBuy missing 'Official catalog reference price' labeling");
  }

  const clientDetailsSource = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
  if (!clientDetailsSource.includes("Official Catalog Reference Price")) {
    throw new Error("LaptopClientDetails missing 'Official Catalog Reference Price' labeling");
  }
});

// 10. Reference price never becomes retailer price
test("10. Reference price never becomes retailer price", () => {
  const target = LAPTOPS.find((l) => l.id === "hp-victus-15-fa2500tx")!;
  const bestOffer = getBestListedPrice([], "INR");
  if (bestOffer !== null) {
    throw new Error("getBestListedPrice fabricated an offer from empty input");
  }
});

// 11. No live offer produces safe unavailable state
test("11. No live offer produces safe unavailable state", () => {
  const status = resolveRetailerOfferStatus(null);
  if (status.status !== "COMING_SOON" || status.isClickable) {
    throw new Error(`Expected COMING_SOON and not clickable, got ${status.status}`);
  }
});

// 12. Valid live offer still resolves BUY_NOW
test("12. Valid live offer still resolves BUY_NOW", () => {
  const validOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/sample-url",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };
  const status = resolveRetailerOfferStatus(validOffer);
  if (status.status !== "BUY_NOW" || !status.isClickable || !status.targetUrl) {
    throw new Error(`Expected BUY_NOW, got ${status.status}`);
  }
});

// 13. Out-of-stock resolves NOT_AVAILABLE
test("13. Out-of-stock resolves NOT_AVAILABLE", () => {
  const oosOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: 89990,
    currency: "INR",
    availability: "out-of-stock",
    productUrl: "https://www.amazon.in/sample-url",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };
  const status = resolveRetailerOfferStatus(oosOffer);
  if (status.status !== "NOT_AVAILABLE" || status.isClickable) {
    throw new Error(`Expected NOT_AVAILABLE, got ${status.status}`);
  }
});

// 14. Upcoming products are separated
test("14. Upcoming products are separated", () => {
  const result = findSmartSearchResults(LAPTOPS, {
    ...emptyFilters,
    searchQuery: "Snapdragon",
  });
  if (result.upcomingMatches.length === 0) {
    throw new Error("Snapdragon upcoming products were not placed into upcomingMatches");
  }
  for (const up of result.upcomingMatches) {
    if (!up.isUpcoming) throw new Error(`Non-upcoming product in upcomingMatches: ${up.name}`);
  }
});

// 15. Upcoming products never receive BUY_NOW
test("15. Upcoming products never receive BUY_NOW", () => {
  const upcomingLaptop = LAPTOPS.find((l) => l.isUpcoming)!;
  const validated = validateRetailerOffers(upcomingLaptop.offers || [], upcomingLaptop);
  if (validated.length > 0) {
    throw new Error("Upcoming laptop generated validated offers");
  }
});

// 16. Upcoming products never enter Best Listed Price
test("16. Upcoming products never enter Best Listed Price", () => {
  const upcomingLaptop = LAPTOPS.find((l) => l.isUpcoming)!;
  const bestOffer = getBestListedPrice(upcomingLaptop.offers || [], "INR");
  if (bestOffer !== null) {
    throw new Error("Upcoming laptop produced a best listed price");
  }
});

// 17. Advisor uses alternatives
test("17. Advisor uses alternatives", () => {
  const impossibleInput: AdvisorInput = {
    budget: "under-40k",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    gpuPreference: "gaming-required",
    ramPreference: "32GB",
  };
  const recs = getLaptopRecommendations(impossibleInput, LAPTOPS);
  if (!recs.isRelaxed) throw new Error("Expected Advisor isRelaxed: true for impossible constraints");
  if (recs.recommendations.length === 0) throw new Error("Advisor returned empty recommendations array");
  for (const r of recs.recommendations) {
    if (r.laptop.isUpcoming) throw new Error("Advisor recommended an upcoming unreleased laptop");
  }
});

// 18. Compare uses real catalog products
test("18. Compare uses real catalog products", () => {
  const compareSource = fs.readFileSync(path.join(__dirname, "../src/app/compare/page.tsx"), "utf-8");
  if (!compareSource.includes("!l.isUpcoming")) {
    throw new Error("Compare page does not filter out upcoming products from suggestions");
  }
});

// 19. Mobile-safe result cards
test("19. Mobile-safe result cards", () => {
  const cardSource = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"), "utf-8");
  if (cardSource.includes("w-[800px]") || cardSource.includes("min-w-[500px]")) {
    throw new Error("Hardcoded rigid pixel widths detected in LaptopCard.tsx");
  }
  if (!cardSource.includes("truncate") && !cardSource.includes("line-clamp")) {
    throw new Error("Missing text overflow protection in LaptopCard.tsx");
  }
});

// 20. No unnecessary retailer calls
test("20. No unnecessary retailer calls", () => {
  const catalogPageSource = fs.readFileSync(path.join(__dirname, "../src/app/laptops/page.tsx"), "utf-8");
  if (catalogPageSource.includes("getRetailerOffers")) {
    throw new Error("Catalog list page triggers unnecessary live retailer API calls for each item");
  }
});

console.log("\n==================================================");
console.log(`PHASE 30 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
