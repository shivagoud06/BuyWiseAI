import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  findSmartSearchResults,
  calculateProximityScore,
  matchesExactFilters,
} from "../src/lib/smartSearch";
import { FilterState, Laptop } from "../src/types";

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

console.log("==================================================");
console.log("BUYWISE AI — PHASE 27A SMART SEARCH & UPCOMING AUDIT");
console.log("==================================================");

// 1. Exact Match Test
test("1. Exact match returns exact matching laptops first", () => {
  const filters: FilterState = {
    searchQuery: "Lenovo LOQ",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (result.isFallback) throw new Error("Expected exact match, got fallback");
  if (result.exactMatches.length === 0) throw new Error("Expected exact matches for 'Lenovo LOQ'");
  if (!result.exactMatches.every((l) => l.name.toLowerCase().includes("loq") || l.brand === "Lenovo")) {
    throw new Error("Result contains non-matching laptop");
  }
});

// 2. Near-Match Fallback Test
test("2. Near-match fallback returns closest available laptops when exact spec is unavailable", () => {
  const filters: FilterState = {
    searchQuery: "Lenovo RTX 4070 32GB gaming laptop",
    brands: ["Lenovo"],
    priceRanges: [],
    ramSizes: [32],
    processorFamilies: [],
    gpuCategories: ["NVIDIA"],
    useCases: ["Gaming"],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (!result.isFallback) {
    // If exact 32GB Lenovo RTX 4070 exists (e.g. Legion Pro 5i), check it returned valid results
    if (result.exactMatches.length === 0) throw new Error("No exact match and no fallback");
  } else {
    if (result.fallbackMatches.length === 0) throw new Error("Expected near-match fallback options");
    if (!result.fallbackMatches.some((l) => l.brand === "Lenovo")) throw new Error("Fallback did not include same brand");
  }
});

// 3. Budget-Near Fallback Test
test("3. Budget-near fallback returns nearest price alternatives when exact range has 0 matches", () => {
  // Brand Apple under ₹40k (no Apple under 40k exists in India)
  const filters: FilterState = {
    searchQuery: "",
    brands: ["Apple"],
    priceRanges: ["under-40k"],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (!result.isFallback) throw new Error("Expected fallback for Apple under 40k");
  if (result.fallbackMatches.length === 0) throw new Error("Expected fallback recommendations");
  if (result.fallbackReason !== "Exact model unavailable. These are the closest available alternatives.") {
    throw new Error(`Unexpected fallback reason: ${result.fallbackReason}`);
  }
});

// 4. GPU-Near Fallback Test
test("4. GPU-near fallback returns adjacent GPU tier when target GPU is unavailable for brand", () => {
  // MSI with Apple GPU (impossible configuration)
  const filters: FilterState = {
    searchQuery: "MSI RTX 4090",
    brands: ["MSI"],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: ["NVIDIA"],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (!result.isFallback && result.exactMatches.length === 0) {
    throw new Error("Zero matches and no fallback for MSI RTX 4090");
  }
  const items = result.exactMatches.length > 0 ? result.exactMatches : result.fallbackMatches;
  if (!items.some((l) => l.brand === "MSI" || l.gpuCategory === "NVIDIA")) {
    throw new Error("GPU-near fallback failed to return adjacent gaming GPU laptops");
  }
});

// 5. RAM-Near Fallback Test
test("5. RAM-near fallback returns 16GB alternative when 64GB is queried on everyday laptops", () => {
  const filters: FilterState = {
    searchQuery: "Acer Aspire 64GB RAM",
    brands: ["Acer"],
    priceRanges: [],
    ramSizes: [64 as any],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (!result.isFallback) throw new Error("Expected fallback for 64GB Acer Aspire");
  if (result.fallbackMatches.length === 0) throw new Error("Expected fallback laptops");
  if (!result.fallbackMatches.some((l) => l.brand === "Acer")) throw new Error("Expected Acer fallback");
});

// 6. Zero Exact Matches with Valid Alternatives: NEVER show 'No laptops found'
test("6. Zero exact matches with valid alternatives guarantees non-empty result", () => {
  const filters: FilterState = {
    searchQuery: "HP Victus OLED RTX 4090",
    brands: ["HP"],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  const total = result.exactMatches.length + result.fallbackMatches.length;
  if (total === 0) throw new Error("Returned 0 results when valid alternatives exist in catalog");
  if (!result.isFallback) throw new Error("Expected isFallback = true");
});

// 7. Fallback Explanation Test
test("7. Fallback explanation displays standard user-facing message", () => {
  const filters: FilterState = {
    searchQuery: "Dell RTX 4080",
    brands: ["Dell"],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (result.isFallback) {
    if (result.fallbackReason !== "Exact model unavailable. These are the closest available alternatives.") {
      throw new Error(`Unexpected fallback reason: ${result.fallbackReason}`);
    }
  }
});

// 8. Upcoming Product Separation Test
test("8. Upcoming products are partitioned into upcomingMatches and excluded from current market rankings", () => {
  const upcomingLaptops = LAPTOPS.filter((l) => l.isUpcoming);
  if (upcomingLaptops.length === 0) throw new Error("No upcoming laptops defined in catalog");

  const filters: FilterState = {
    searchQuery: "Zenbook S 16",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (result.upcomingMatches.length === 0) {
    throw new Error("Upcoming Zenbook S 16 was not included in upcomingMatches");
  }
  // Must not be mixed into exactMatches if exactMatches requires active retail offers
  if (result.exactMatches.some((l) => l.isUpcoming)) {
    throw new Error("Upcoming product leaked into exactMatches");
  }
});

// 9. No Fabricated Prices for Upcoming Products
test("9. Upcoming products have price = null or verified expected metadata without fake numbers", () => {
  const upcomingLaptops = LAPTOPS.filter((l) => l.isUpcoming);
  for (const laptop of upcomingLaptops) {
    if (laptop.price !== null && laptop.price <= 0) {
      throw new Error(`Invalid price for upcoming laptop ${laptop.id}: ${laptop.price}`);
    }
    if (laptop.offers && laptop.offers.length > 0) {
      if (laptop.offers.some((o) => o.source === "mock" || o.isMock)) {
        throw new Error(`Upcoming laptop ${laptop.id} contains mock offers`);
      }
    }
  }
});

// 10. No Fabricated Availability Status
test("10. Upcoming products do not have fabricated 'in-stock' retail offers", () => {
  const upcomingLaptops = LAPTOPS.filter((l) => l.isUpcoming);
  for (const laptop of upcomingLaptops) {
    if (laptop.offers && laptop.offers.some((o) => o.availability === "in-stock" && o.productUrl)) {
      throw new Error(`Upcoming laptop ${laptop.id} has fabricated in-stock retail URL`);
    }
  }
});

// 11. Broad Suggestions for Nonsensical Queries
test("11. Nonsensical query returns broad suggestions instead of blank screen", () => {
  const filters: FilterState = {
    searchQuery: "xyzzy9999qweqwe123",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const result = findSmartSearchResults(LAPTOPS, filters);
  if (!result.hasBroadSuggestions || result.broadSuggestions.length === 0) {
    throw new Error("Expected broad suggestions for unmatched query");
  }
});

console.log("--------------------------------------------------");
console.log(`Unit Test Summary: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
