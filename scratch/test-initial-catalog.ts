import { LAPTOPS } from "../src/data/laptops";
import { findSmartSearchResults, matchesExactFilters } from "../src/lib/smartSearch";
import { FilterState } from "../src/types";

const defaultFilters: FilterState = {
  searchQuery: "",
  brands: [],
  priceRanges: [],
  ramSizes: [],
  processorFamilies: [],
  gpuCategories: [],
  useCases: [],
};

console.log("Total LAPTOPS in data:", LAPTOPS.length);
const unupcoming = LAPTOPS.filter(l => !l.isUpcoming);
console.log("Unupcoming LAPTOPS:", unupcoming.length);

const matched = unupcoming.filter(l => matchesExactFilters(l, defaultFilters));
console.log("Matched with default filters:", matched.length);

const searchResult = findSmartSearchResults(LAPTOPS, defaultFilters, "recommended");
console.log("Exact matches count:", searchResult.exactMatches.length);
console.log("Fallback matches count:", searchResult.fallbackMatches.length);
console.log("Upcoming matches count:", searchResult.upcomingMatches.length);
console.log("Is fallback:", searchResult.isFallback);
console.log("Has broad suggestions:", searchResult.hasBroadSuggestions);
