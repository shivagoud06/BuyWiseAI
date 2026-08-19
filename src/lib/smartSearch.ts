import { Laptop, FilterState, SortOption, SmartSearchResult, PriceRangeFilter } from "@/types";

/**
 * GPU Tier Hierarchy for proximity calculation
 */
const GPU_TIERS: Record<string, number> = {
  "rtx 4090": 10,
  "rtx 4080": 9,
  "rtx 4070": 8,
  "rtx 4060": 7,
  "rtx 4050": 6,
  "rtx 3050": 5,
  "rtx 2050": 4,
  "gtx 1650": 3,
  "apple": 6,
  "arc": 4,
  "radeon 780m": 4,
  "radeon 680m": 3,
  "radeon 610m": 2,
  "iris xe": 2,
  "intel uhd": 1,
  "integrated": 1,
};

function getGpuTierScore(gpuText: string): number {
  const g = gpuText.toLowerCase();
  for (const [key, score] of Object.entries(GPU_TIERS)) {
    if (g.includes(key)) return score;
  }
  return 1;
}

/**
 * CPU Tier Hierarchy for proximity calculation
 */
const CPU_TIERS: Record<string, number> = {
  "core i9": 9,
  "ryzen 9": 9,
  "m3 max": 9,
  "m3 pro": 8,
  "core i7": 7,
  "core ultra 7": 7,
  "ryzen 7": 7,
  "m3": 6,
  "m2": 6,
  "snapdragon x": 6,
  "core i5": 5,
  "ryzen 5": 5,
  "core i3": 3,
  "ryzen 3": 3,
};

function getCpuTierScore(cpuText: string): number {
  const c = cpuText.toLowerCase();
  for (const [key, score] of Object.entries(CPU_TIERS)) {
    if (c.includes(key)) return score;
  }
  return 4;
}

/**
 * Maps price range string to min and max boundaries
 */
function getPriceRangeBounds(range: PriceRangeFilter): { min: number; max: number } {
  switch (range) {
    case "under-40k":
      return { min: 0, max: 40000 };
    case "40k-50k":
      return { min: 40000, max: 50000 };
    case "50k-75k":
      return { min: 50000, max: 75000 };
    case "75k-100k":
      return { min: 75000, max: 100000 };
    case "above-100k":
      return { min: 100000, max: 1000000 };
    default:
      return { min: 0, max: 1000000 };
  }
}

/**
 * Evaluates whether a candidate laptop exactly matches the user query and filters
 */
export function matchesExactFilters(laptop: Laptop, filters: FilterState): boolean {
  // 1. Search Query: Laptop name, fullName, model, sku, brand, processor, gpu, battery, useCases
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const q = filters.searchQuery.toLowerCase().trim();
    const matchesName = laptop.name.toLowerCase().includes(q);
    const matchesFullName = laptop.fullName.toLowerCase().includes(q);
    const matchesModel = laptop.model.toLowerCase().includes(q);
    const matchesSku = laptop.sku?.toLowerCase().includes(q) || false;
    const matchesBrand = laptop.brand.toLowerCase().includes(q);
    const matchesProc = laptop.processor.toLowerCase().includes(q);
    const matchesProcFamily = laptop.processorFamily.toLowerCase().includes(q);
    const matchesGpu = laptop.gpu.toLowerCase().includes(q);
    const matchesBattery = laptop.battery.toLowerCase().includes(q);
    const matchesUseCase = laptop.useCases.some((uc) => uc.toLowerCase().includes(q));

    if (
      !matchesName &&
      !matchesFullName &&
      !matchesModel &&
      !matchesSku &&
      !matchesBrand &&
      !matchesProc &&
      !matchesProcFamily &&
      !matchesGpu &&
      !matchesBattery &&
      !matchesUseCase
    ) {
      return false;
    }
  }

  // 2. Brand Filter
  if (filters.brands.length > 0 && !filters.brands.includes(laptop.brand)) {
    return false;
  }

  // 3. Price Ranges (INR)
  if (filters.priceRanges.length > 0) {
    if (laptop.price === null || laptop.price <= 0) return false;
    const matchesPrice = filters.priceRanges.some((range) => {
      const { min, max } = getPriceRangeBounds(range);
      return laptop.price! >= min && (range === "above-100k" ? laptop.price! > 100000 : laptop.price! <= max);
    });
    if (!matchesPrice) return false;
  }

  // 4. RAM Sizes
  if (filters.ramSizes.length > 0 && !filters.ramSizes.includes(laptop.ramSize)) {
    return false;
  }

  // 5. Processor Families
  if (filters.processorFamilies.length > 0 && !filters.processorFamilies.includes(laptop.processorFamily)) {
    return false;
  }

  // 6. GPU Categories
  if (filters.gpuCategories.length > 0 && !filters.gpuCategories.includes(laptop.gpuCategory)) {
    return false;
  }

  // 7. Use Cases
  if (filters.useCases.length > 0 && !filters.useCases.some((uc) => laptop.useCases.includes(uc))) {
    return false;
  }

  return true;
}

/**
 * Calculates a multi-dimensional proximity distance score (0 to 100)
 * between the user's requested filters/search terms and a candidate laptop.
 */
export function calculateProximityScore(laptop: Laptop, filters: FilterState): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const query = filters.searchQuery.toLowerCase().trim();

  // 1. Brand Alignment (up to 25 points)
  if (filters.brands.length > 0) {
    if (filters.brands.includes(laptop.brand)) {
      score += 25;
      reasons.push(`Same brand (${laptop.brand})`);
    }
  } else if (query && query.includes(laptop.brand.toLowerCase())) {
    score += 25;
    reasons.push(`Brand match (${laptop.brand})`);
  }

  // 2. GPU Tier Alignment (up to 25 points)
  const targetGpuScore = query.includes("4070")
    ? 8
    : query.includes("4060")
    ? 7
    : query.includes("4050")
    ? 6
    : query.includes("3050")
    ? 5
    : query.includes("2050")
    ? 4
    : filters.gpuCategories.includes("NVIDIA")
    ? 6
    : filters.gpuCategories.includes("Integrated")
    ? 1
    : null;

  if (targetGpuScore !== null) {
    const candidateGpuScore = getGpuTierScore(laptop.gpu);
    const diff = Math.abs(candidateGpuScore - targetGpuScore);
    if (diff === 0) {
      score += 25;
      reasons.push(`Matching GPU class (${laptop.gpu})`);
    } else if (diff === 1) {
      score += 18;
      reasons.push(`Nearest adjacent GPU (${laptop.gpu})`);
    } else if (diff === 2) {
      score += 10;
      reasons.push(`Comparable GPU category`);
    }
  }

  // 3. CPU Family & Performance Alignment (up to 20 points)
  const targetCpuScore = query.includes("i9") || query.includes("ryzen 9")
    ? 9
    : query.includes("i7") || query.includes("ryzen 7") || query.includes("ultra 7")
    ? 7
    : query.includes("i5") || query.includes("ryzen 5")
    ? 5
    : query.includes("i3") || query.includes("ryzen 3")
    ? 3
    : filters.processorFamilies.length > 0
    ? getCpuTierScore(filters.processorFamilies[0])
    : null;

  if (targetCpuScore !== null) {
    const candidateCpuScore = getCpuTierScore(laptop.processorFamily);
    const diff = Math.abs(candidateCpuScore - targetCpuScore);
    if (diff === 0) {
      score += 20;
      reasons.push(`Same processor tier (${laptop.processorFamily})`);
    } else if (diff <= 2) {
      score += 14;
      reasons.push(`Closest processor performance tier (${laptop.processorFamily})`);
    }
  }

  // 4. RAM & Storage Capacity Proximity (up to 15 points)
  let targetRam: number | null = null;
  if (filters.ramSizes.length > 0) {
    targetRam = filters.ramSizes[0];
  } else if (query.includes("32gb") || query.includes("32 gb")) {
    targetRam = 32;
  } else if (query.includes("16gb") || query.includes("16 gb")) {
    targetRam = 16;
  } else if (query.includes("8gb") || query.includes("8 gb")) {
    targetRam = 8;
  }

  if (targetRam !== null) {
    const diff = Math.abs(laptop.ramSize - targetRam);
    if (diff === 0) {
      score += 15;
      reasons.push(`Exact ${laptop.ramSize}GB RAM`);
    } else if (diff <= 8) {
      score += 10;
      reasons.push(`Nearby ${laptop.ramSize}GB RAM capacity`);
    } else if (diff <= 16) {
      score += 6;
      reasons.push(`Usable ${laptop.ramSize}GB RAM capacity`);
    }
  }

  // 5. Budget & Price Proximity (up to 15 points)
  if (filters.priceRanges.length > 0 && laptop.price) {
    const { min, max } = getPriceRangeBounds(filters.priceRanges[0]);
    if (laptop.price >= min && laptop.price <= max) {
      score += 15;
      reasons.push("Within requested budget");
    } else {
      const mid = (min + (max === 1000000 ? 120000 : max)) / 2;
      const priceDeltaPct = Math.abs(laptop.price - mid) / mid;
      if (priceDeltaPct <= 0.25) {
        score += 10;
        reasons.push("Closest available price bracket");
      } else if (priceDeltaPct <= 0.4) {
        score += 5;
        reasons.push("Reasonable budget alternative");
      }
    }
  }

  // 6. Use Case Overlap (bonus up to 10 points)
  if (filters.useCases.length > 0) {
    const overlap = laptop.useCases.some((uc) => filters.useCases.includes(uc));
    if (overlap) {
      score += 10;
      reasons.push("Optimized for same workload");
    }
  }

  // 7. General Quality baseline (BuyWise score weight)
  score += Math.round(laptop.buyWiseScore * 0.1);

  return { score, reasons };
}

/**
 * Performs Smart Search with Automatic Proximity Fallback & Upcoming Laptop Separation
 */
export function findSmartSearchResults(
  catalog: Laptop[],
  filters: FilterState,
  sortOption: SortOption = "recommended"
): SmartSearchResult {
  // 1. Separate upcoming laptops from current market catalog
  const currentCatalog = catalog.filter((l) => !l.isUpcoming);
  const upcomingCatalog = catalog.filter((l) => l.isUpcoming);

  // 2. Perform Exact Match on Current Catalog
  const exactMatches = currentCatalog.filter((l) => matchesExactFilters(l, filters));

  // Sort exact matches
  const sortedExact = sortLaptops(exactMatches, sortOption);

  // Filter relevant upcoming products matching search query
  const relevantUpcoming = upcomingCatalog.filter((l) => {
    if (!filters.searchQuery.trim()) return false;
    const q = filters.searchQuery.toLowerCase().trim();
    return (
      l.name.toLowerCase().includes(q) ||
      l.fullName.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      l.processorFamily.toLowerCase().includes(q) ||
      l.gpu.toLowerCase().includes(q)
    );
  });

  // If exact matches exist, return them directly
  if (sortedExact.length > 0) {
    return {
      exactMatches: sortedExact,
      fallbackMatches: [],
      upcomingMatches: relevantUpcoming,
      isFallback: false,
      fallbackReason: null,
      hasBroadSuggestions: false,
      broadSuggestions: [],
      totalAvailableCount: sortedExact.length,
    };
  }

  // 3. Fallback: If 0 exact matches exist, calculate proximity score for available alternatives
  const scoredLaptops = currentCatalog
    .map((laptop) => {
      const { score, reasons } = calculateProximityScore(laptop, filters);
      return { laptop, score, reasons };
    })
    .filter((item) => item.score >= 20) // Filter out unrelated products
    .sort((a, b) => b.score - a.score || b.laptop.buyWiseScore - a.laptop.buyWiseScore);

  const fallbackMatches = scoredLaptops.slice(0, 6).map((item) => item.laptop);
  const fallbackExplanations: Record<string, string> = {};
  scoredLaptops.slice(0, 6).forEach((item) => {
    if (item.reasons.length > 0) {
      fallbackExplanations[item.laptop.id] = item.reasons.slice(0, 2).join(", ") + ".";
    } else {
      fallbackExplanations[item.laptop.id] = `${item.laptop.brand} alternative for ${item.laptop.useCases[0] || "Everyday"} workloads.`;
    }
  });

  if (fallbackMatches.length > 0) {
    return {
      exactMatches: [],
      fallbackMatches,
      fallbackExplanations,
      upcomingMatches: relevantUpcoming,
      isFallback: true,
      fallbackReason: "Exact model unavailable. These are the closest available alternatives.",
      hasBroadSuggestions: false,
      broadSuggestions: [],
      totalAvailableCount: fallbackMatches.length,
    };
  }

  // 4. Broad Suggestions when neither exact nor reasonable alternatives exist
  const broadSuggestions = [
    "Laptops with NVIDIA RTX 4060 GPU",
    "High performance Intel Core i5 & Ryzen 5 under ₹75,000",
    "16GB RAM Everyday & Office Laptops",
    "OLED Display Content Creation Laptops",
    "Best Battery Life Laptops for Students",
  ];

  return {
    exactMatches: [],
    fallbackMatches: [],
    upcomingMatches: relevantUpcoming,
    isFallback: false,
    fallbackReason: null,
    hasBroadSuggestions: true,
    broadSuggestions,
    totalAvailableCount: 0,
  };
}

/**
 * Sorts laptops based on the selected user sort option
 */
export function sortLaptops(laptops: Laptop[], sortOption: SortOption): Laptop[] {
  return [...laptops].sort((a, b) => {
    const priceA = a.price ?? 999999999;
    const priceB = b.price ?? 999999999;

    switch (sortOption) {
      case "recommended":
      case "best-match":
        return b.buyWiseScore - a.buyWiseScore;
      case "lowest-listed-price":
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "score-desc":
        return b.buyWiseScore - a.buyWiseScore;
      case "best-value":
        return b.scoreBreakdown.priceValue - a.scoreBreakdown.priceValue;
      case "rating-desc":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
}
