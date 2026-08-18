import { LAPTOPS } from "../src/data/laptops";
import { findSmartSearchResults, matchesExactFilters } from "../src/lib/smartSearch";
import { FilterState } from "../src/types";

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
console.log("BUYWISE AI — CATALOG INITIAL RENDER & FILTER AUDIT");
console.log("==================================================");

// 1. Initial State: Empty filters returns all available catalog laptops
test("1. Initial state (empty filters) returns >0 available catalog laptops", () => {
  const defaultFilters: FilterState = {
    searchQuery: "",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };

  const result = findSmartSearchResults(LAPTOPS, defaultFilters, "recommended");

  if (result.exactMatches.length === 0) {
    throw new Error("Initial /laptops page returned 0 exact matches");
  }

  const expectedCount = LAPTOPS.filter((l) => !l.isUpcoming).length;
  if (result.exactMatches.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} laptops, got ${result.exactMatches.length}`);
  }

  if (result.isFallback) {
    throw new Error("Initial render was marked as fallback");
  }

  if (result.hasBroadSuggestions) {
    throw new Error("Initial render showed broad suggestions empty state");
  }
});

// 2. Search query is NOT required for initial catalog render
test("2. Initial catalog does not require user search query to display laptops", () => {
  const defaultFilters: FilterState = {
    searchQuery: "",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };

  const unupcoming = LAPTOPS.filter((l) => !l.isUpcoming);
  const matched = unupcoming.filter((l) => matchesExactFilters(l, defaultFilters));

  if (matched.length !== unupcoming.length) {
    throw new Error("Some catalog laptops were excluded with empty search query");
  }
});

// 3. Brand filters return active laptops
test("3. Brand filters return matching laptops for each major brand", () => {
  const brands = ["Lenovo", "HP", "ASUS", "Apple", "Dell", "Acer", "MSI"] as const;
  for (const brand of brands) {
    const filters: FilterState = {
      searchQuery: "",
      brands: [brand],
      priceRanges: [],
      ramSizes: [],
      processorFamilies: [],
      gpuCategories: [],
      useCases: [],
    };
    const result = findSmartSearchResults(LAPTOPS, filters);
    const count = result.exactMatches.length + result.fallbackMatches.length;
    if (count === 0) {
      throw new Error(`Brand filter for '${brand}' returned 0 laptops`);
    }
  }
});

// 4. Price range filters return active laptops
test("4. Price range filters return laptops without dropping catalog", () => {
  const priceRanges = ["under-40k", "40k-50k", "50k-75k", "75k-100k", "above-100k"] as const;
  for (const range of priceRanges) {
    const filters: FilterState = {
      searchQuery: "",
      brands: [],
      priceRanges: [range],
      ramSizes: [],
      processorFamilies: [],
      gpuCategories: [],
      useCases: [],
    };
    const result = findSmartSearchResults(LAPTOPS, filters);
    const count = result.exactMatches.length + result.fallbackMatches.length;
    if (count === 0) {
      throw new Error(`Price range filter '${range}' returned 0 laptops`);
    }
  }
});

// 5. Workload / Use Case filters return active laptops
test("5. Workload use-case filters return matching laptops", () => {
  const useCases = ["Gaming", "Programming", "Student", "Content Creation", "Office"] as const;
  for (const uc of useCases) {
    const filters: FilterState = {
      searchQuery: "",
      brands: [],
      priceRanges: [],
      ramSizes: [],
      processorFamilies: [],
      gpuCategories: [],
      useCases: [uc as any],
    };
    const result = findSmartSearchResults(LAPTOPS, filters);
    if (result.exactMatches.length === 0) {
      throw new Error(`Use case '${uc}' returned 0 exact matches`);
    }
  }
});

console.log("--------------------------------------------------");
console.log(`Unit Test Summary: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
