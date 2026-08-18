import {
  Laptop,
  AdvisorInput,
  RecommendationResult,
  PriceRangeFilter,
  CurrencyCode,
  RetailerOffer,
  BudgetMode,
  UseCaseType,
  BrandType,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Dynamic Scoring Weights Configuration by Use Case
 */
export interface UseCaseWeights {
  budget: number;
  gpu: number;
  cpu: number;
  ram: number;
  storage: number;
  display: number;
  battery: number;
  portability: number;
  buyWiseScore: number;
  priorities: number;
}

export const USE_CASE_WEIGHTS: Record<UseCaseType, UseCaseWeights> = {
  Gaming: {
    budget: 0.15,
    gpu: 0.35,
    cpu: 0.15,
    ram: 0.10,
    storage: 0.05,
    display: 0.10,
    battery: 0.03,
    portability: 0.02,
    buyWiseScore: 0.05,
    priorities: 0.00,
  },
  Programming: {
    budget: 0.20,
    gpu: 0.05,
    cpu: 0.25,
    ram: 0.25,
    storage: 0.05,
    display: 0.05,
    battery: 0.05,
    portability: 0.05,
    buyWiseScore: 0.05,
    priorities: 0.00,
  },
  Student: {
    budget: 0.30,
    gpu: 0.05,
    cpu: 0.10,
    ram: 0.10,
    storage: 0.05,
    display: 0.05,
    battery: 0.20,
    portability: 0.10,
    buyWiseScore: 0.05,
    priorities: 0.00,
  },
  "Content Creation": {
    budget: 0.10,
    gpu: 0.25,
    cpu: 0.20,
    ram: 0.15,
    storage: 0.05,
    display: 0.20,
    battery: 0.02,
    portability: 0.03,
    buyWiseScore: 0.05,
    priorities: 0.00,
  },
  Office: {
    budget: 0.25,
    gpu: 0.05,
    cpu: 0.15,
    ram: 0.15,
    storage: 0.05,
    display: 0.05,
    battery: 0.20,
    portability: 0.05,
    buyWiseScore: 0.05,
    priorities: 0.00,
  },
};

interface PriceTierConfig {
  min: number;
  max: number;
  label: string;
  rank: number;
}

export const REGIONAL_PRICE_TIERS: Record<CurrencyCode, Record<PriceRangeFilter, PriceTierConfig>> = {
  INR: {
    "under-40k": { min: 0, max: 40000, label: "Under ₹40,000", rank: 1 },
    "40k-50k": { min: 40000, max: 50000, label: "₹40,000 – ₹50,000", rank: 2 },
    "50k-75k": { min: 50000, max: 75000, label: "₹50,000 – ₹75,000", rank: 3 },
    "75k-100k": { min: 75000, max: 100000, label: "₹75,000 – ₹1,00,000", rank: 4 },
    "above-100k": { min: 100000, max: Infinity, label: "Above ₹1,00,000", rank: 5 },
  },
  USD: {
    "under-40k": { min: 0, max: 500, label: "Under $500", rank: 1 },
    "40k-50k": { min: 500, max: 750, label: "$500 – $750", rank: 2 },
    "50k-75k": { min: 750, max: 1000, label: "$750 – $1,000", rank: 3 },
    "75k-100k": { min: 1000, max: 1400, label: "$1,000 – $1,400", rank: 4 },
    "above-100k": { min: 1400, max: Infinity, label: "Above $1,400", rank: 5 },
  },
  GBP: {
    "under-40k": { min: 0, max: 450, label: "Under £450", rank: 1 },
    "40k-50k": { min: 450, max: 650, label: "£450 – £650", rank: 2 },
    "50k-75k": { min: 650, max: 900, label: "£650 – £900", rank: 3 },
    "75k-100k": { min: 900, max: 1200, label: "£900 – £1,200", rank: 4 },
    "above-100k": { min: 1200, max: Infinity, label: "Above £1,200", rank: 5 },
  },
  EUR: {
    "under-40k": { min: 0, max: 500, label: "Under €500", rank: 1 },
    "40k-50k": { min: 500, max: 750, label: "€500 – €750", rank: 2 },
    "50k-75k": { min: 750, max: 1000, label: "€750 – €1,000", rank: 3 },
    "75k-100k": { min: 1000, max: 1500, label: "€1,000 – €1,500", rank: 4 },
    "above-100k": { min: 1500, max: Infinity, label: "Above €1,500", rank: 5 },
  },
  OTHER: {
    "under-40k": { min: 0, max: 500, label: "Budget", rank: 1 },
    "40k-50k": { min: 500, max: 750, label: "Mid-Range", rank: 2 },
    "50k-75k": { min: 750, max: 1000, label: "Upper Mid-Range", rank: 3 },
    "75k-100k": { min: 1000, max: 1400, label: "Premium", rank: 4 },
    "above-100k": { min: 1400, max: Infinity, label: "Flagship", rank: 5 },
  },
};

export function getLaptopPriceTier(price: number | null | undefined, currency: CurrencyCode): PriceRangeFilter {
  const tiers = REGIONAL_PRICE_TIERS[currency] || REGIONAL_PRICE_TIERS.INR;
  if (!price || price <= 0) return "50k-75k";

  if (price < tiers["under-40k"].max) return "under-40k";
  if (price <= tiers["40k-50k"].max) return "40k-50k";
  if (price <= tiers["50k-75k"].max) return "50k-75k";
  if (price <= tiers["75k-100k"].max) return "75k-100k";
  return "above-100k";
}

/**
 * Extracts storage size in GB from storage spec string (e.g. "512GB PCIe..." -> 512, "1TB NVMe..." -> 1024)
 */
export function extractStorageSizeGB(storageStr: string): number {
  const normalized = storageStr.toLowerCase();
  if (normalized.includes("2tb") || normalized.includes("2 tb")) return 2048;
  if (normalized.includes("1tb") || normalized.includes("1 tb") || normalized.includes("1024gb")) return 1024;
  if (normalized.includes("512gb") || normalized.includes("512 gb")) return 512;
  if (normalized.includes("256gb") || normalized.includes("256 gb")) return 256;
  if (normalized.includes("128gb") || normalized.includes("128 gb")) return 128;
  return 512;
}

/**
 * GPU Tier Classification for hard requirement evaluation
 */
export function getGpuTierLevel(gpuStr: string, gpuCategory: string): number {
  const normalized = gpuStr.toLowerCase();
  if (normalized.includes("4090") || normalized.includes("4080")) return 90;
  if (normalized.includes("4070")) return 70;
  if (normalized.includes("4060")) return 60;
  if (normalized.includes("4050")) return 50;
  if (normalized.includes("3050") || normalized.includes("2050") || normalized.includes("1650")) return 35;
  if (gpuCategory === "Apple") {
    if (normalized.includes("max") || normalized.includes("m3 pro") || normalized.includes("m2 pro")) return 70;
    return 40;
  }
  if (gpuCategory === "NVIDIA" || gpuCategory === "AMD") return 35;
  return 10;
}

/**
 * CPU Level Classification for hard and soft requirement evaluation
 */
export function getCpuLevel(processorStr: string, processorFamily: string): number {
  const normalized = processorStr.toLowerCase();
  if (normalized.includes("i9") || normalized.includes("ryzen 9") || normalized.includes("m3 max") || normalized.includes("m2 max")) return 90;
  if (normalized.includes("i7") || normalized.includes("ryzen 7") || normalized.includes("ultra 7") || normalized.includes("m3 pro") || normalized.includes("m2 pro")) return 75;
  if (normalized.includes("i5") || normalized.includes("ryzen 5") || normalized.includes("ultra 5") || normalized.includes("m1") || normalized.includes("m2") || normalized.includes("m3")) return 60;
  if (normalized.includes("i3") || normalized.includes("ryzen 3")) return 40;
  return 50;
}

/**
 * Core Deterministic Recommendation Engine for BuyWise AI (Phase 17)
 * 
 * Separates Hard Requirements from Soft Preferences, computes use-case-weighted
 * match percentages, evaluates all qualifying catalog laptops, generates truthful
 * explanations, and warns on relaxed near-matches.
 */
export function getLaptopRecommendations(
  input: AdvisorInput,
  laptops: Laptop[]
): {
  recommendations: RecommendationResult[];
  isRelaxed: boolean;
  relaxedReason?: string;
  totalMatches: number;
  isUnsupportedMarket?: boolean;
  unsupportedMessage?: string;
} {
  const currency: CurrencyCode = input.currency || "INR";
  const budgetMode: BudgetMode = input.budgetMode || "under";

  // Unsupported market check (preserves entered currency without fake rates)
  if (currency === "OTHER") {
    return {
      recommendations: [],
      isRelaxed: false,
      totalMatches: 0,
      isUnsupportedMarket: true,
      unsupportedMessage:
        "BuyWise doesn't have verified laptop pricing for this market yet. We currently have verified catalog coverage for India (₹ INR), the United States ($ USD), the United Kingdom (£ GBP), and Europe (€ EUR).",
    };
  }

  const tiers = REGIONAL_PRICE_TIERS[currency] || REGIONAL_PRICE_TIERS.INR;
  const targetTier = tiers[input.budget];

  // Derive Hard Requirements
  const requiredMinRam = input.minRam || (input.ramPreference === "32GB" ? 32 : input.ramPreference === "16GB" ? 16 : 8);
  const requiredMinStorage = input.minStorage || (input.storagePreference === "1TB" ? 1024 : input.storagePreference === "512GB" ? 512 : 256);
  const strictGamingGpuRequired = input.gpuPreference === "gaming-required" || !!input.minGpuTier;
  const targetMinGpuTierLevel = input.minGpuTier === "rtx-4070" ? 70
    : input.minGpuTier === "rtx-4060" ? 60
    : input.minGpuTier === "rtx-4050" ? 50
    : input.minGpuTier === "rtx-3050" ? 35
    : strictGamingGpuRequired ? 30 : 0;

  // Use-case specific weights
  const baseWeights = { ...USE_CASE_WEIGHTS[input.primaryUse] };

  // Adjust weights dynamically based on user-selected priorities
  if (input.priorities && input.priorities.length > 0) {
    if (input.priorities.includes("Battery")) baseWeights.battery += 0.08;
    if (input.priorities.includes("Display")) baseWeights.display += 0.08;
    if (input.priorities.includes("Portability")) baseWeights.portability += 0.08;
    if (input.priorities.includes("Performance")) {
      baseWeights.cpu += 0.05;
      baseWeights.gpu += 0.05;
    }
    if (input.priorities.includes("Value for Money")) baseWeights.budget += 0.08;

    // Normalize weights so they sum to 1.0
    const totalWeight = Object.values(baseWeights).reduce((sum, w) => sum + w, 0);
    for (const key of Object.keys(baseWeights) as (keyof UseCaseWeights)[]) {
      baseWeights[key] = baseWeights[key] / totalWeight;
    }
  }

  interface EvaluatedCandidate {
    laptop: Laptop;
    effectivePrice: number | null;
    effectiveOffers: RetailerOffer[];
    budgetScore: number;
    gpuScore: number;
    cpuScore: number;
    ramScore: number;
    storageScore: number;
    displayScore: number;
    batteryScore: number;
    portabilityScore: number;
    brandScore: number;
    buyWiseScoreFactor: number;
    finalScore: number;
    matchPercentage: number;
    passesHardBudget: boolean;
    passesHardRam: boolean;
    passesHardGpu: boolean;
    passesHardStorage: boolean;
    passesHardCpu: boolean;
    passesHardBrand: boolean;
    passesAllHardFilters: boolean;
    hardFailReasons: string[];
    tierDiff: number;
  }

  const candidatePool: EvaluatedCandidate[] = [];

  for (const laptop of laptops) {
    let effectivePrice: number | null = null;
    let effectiveOffers: RetailerOffer[] = [];

    if (currency === "INR") {
      effectivePrice = laptop.price;
      effectiveOffers = laptop.offers || [];
    } else {
      const reg = laptop.regionalPricing?.[currency];
      if (reg && reg.price) {
        effectivePrice = reg.price;
        effectiveOffers = reg.offers || [];
      } else {
        continue;
      }
    }

    const laptopTier = getLaptopPriceTier(effectivePrice, currency);
    const tierDiff = tiers[laptopTier].rank - targetTier.rank;
    const storageGB = extractStorageSizeGB(laptop.storage);
    const gpuTierLevel = getGpuTierLevel(laptop.gpu, laptop.gpuCategory);
    const cpuLevel = getCpuLevel(laptop.processor, laptop.processorFamily);

    const hardFailReasons: string[] = [];

    // 1. HARD REQUIREMENT: Budget
    let budgetScore = 80;
    let passesHardBudget = true;

    if (input.rawBudgetAmount && effectivePrice) {
      if (budgetMode === "under") {
        if (effectivePrice <= input.rawBudgetAmount) {
          budgetScore = 100;
          passesHardBudget = true;
        } else if (effectivePrice <= input.rawBudgetAmount * 1.05) {
          budgetScore = 75;
          passesHardBudget = false;
          hardFailReasons.push(`Priced at ${formatCurrency(effectivePrice, currency)}, exceeding budget ${formatCurrency(input.rawBudgetAmount, currency)}`);
        } else {
          budgetScore = Math.max(10, 100 - ((effectivePrice - input.rawBudgetAmount) / input.rawBudgetAmount) * 100);
          passesHardBudget = false;
          hardFailReasons.push(`Priced at ${formatCurrency(effectivePrice, currency)}, exceeding budget ${formatCurrency(input.rawBudgetAmount, currency)}`);
        }
      } else if (budgetMode === "around") {
        const diffRatio = Math.abs(effectivePrice - input.rawBudgetAmount) / input.rawBudgetAmount;
        budgetScore = Math.max(20, 100 - diffRatio * 100);
        passesHardBudget = diffRatio <= 0.20;
      } else if (budgetMode === "above") {
        if (effectivePrice >= input.rawBudgetAmount) {
          budgetScore = 100;
          passesHardBudget = true;
        } else {
          budgetScore = Math.max(20, 100 - ((input.rawBudgetAmount - effectivePrice) / input.rawBudgetAmount) * 100);
          passesHardBudget = effectivePrice >= input.rawBudgetAmount * 0.85;
        }
      }
    } else {
      // Tier-based evaluation
      if (budgetMode === "under") {
        if (tierDiff <= 0) {
          budgetScore = 100;
          passesHardBudget = true;
        } else if (tierDiff === 1) {
          budgetScore = 55;
          passesHardBudget = false;
          hardFailReasons.push(`Priced 1 tier above target budget`);
        } else {
          budgetScore = 20;
          passesHardBudget = false;
          hardFailReasons.push(`Priced significantly above target budget`);
        }
      } else if (budgetMode === "around") {
        const absDiff = Math.abs(tierDiff);
        if (absDiff === 0) budgetScore = 100;
        else if (absDiff === 1) budgetScore = 75;
        else budgetScore = 30;
        passesHardBudget = absDiff <= 1;
      } else if (budgetMode === "above") {
        if (tierDiff >= 0) budgetScore = 100;
        else if (tierDiff === -1) budgetScore = 65;
        else budgetScore = 30;
        passesHardBudget = tierDiff >= -1;
      }
    }

    // 2. HARD REQUIREMENT: RAM
    let ramScore = 100;
    let passesHardRam = true;

    if (input.ramPreference === "32GB" || input.minRam === 32) {
      if (laptop.ramSize >= 32) {
        ramScore = 100;
      } else if (laptop.ramSize >= 16) {
        ramScore = 50;
        passesHardRam = false;
        hardFailReasons.push(`Has ${laptop.ramSize}GB RAM while 32GB was requested`);
      } else {
        ramScore = 20;
        passesHardRam = false;
        hardFailReasons.push(`Has ${laptop.ramSize}GB RAM while 32GB was requested`);
      }
    } else if (input.ramPreference === "16GB" || input.minRam === 16) {
      if (laptop.ramSize >= 16) {
        ramScore = 100;
      } else {
        ramScore = 35;
        passesHardRam = false;
        hardFailReasons.push(`Has ${laptop.ramSize}GB RAM while 16GB was requested`);
      }
    } else {
      ramScore = laptop.ramSize >= 16 ? 100 : 90;
    }

    // 3. HARD REQUIREMENT: GPU
    let gpuScore = 80;
    let passesHardGpu = true;

    if (targetMinGpuTierLevel > 0) {
      if (gpuTierLevel >= targetMinGpuTierLevel) {
        gpuScore = 100;
      } else {
        passesHardGpu = false;
        gpuScore = Math.max(15, Math.round((gpuTierLevel / targetMinGpuTierLevel) * 70));
        if (targetMinGpuTierLevel >= 60) {
          hardFailReasons.push(`Equipped with ${laptop.gpu}, below RTX 4060/equivalent requirement`);
        } else {
          hardFailReasons.push(`Equipped with ${laptop.gpu}, lacks dedicated gaming graphics`);
        }
      }
    } else if (input.gpuPreference === "dedicated-preferred") {
      gpuScore = (laptop.gpuCategory === "NVIDIA" || laptop.gpuCategory === "AMD" || laptop.gpuCategory === "Apple") ? 100 : 60;
    } else if (input.gpuPreference === "integrated") {
      gpuScore = (laptop.gpuCategory === "Integrated" || laptop.gpuCategory === "Apple") ? 100 : 70;
    }

    // 4. HARD REQUIREMENT: Storage
    let storageScore = 85;
    let passesHardStorage = true;

    if (input.minStorage || input.storagePreference === "1TB") {
      if (storageGB >= requiredMinStorage) {
        storageScore = 100;
      } else {
        passesHardStorage = false;
        storageScore = 40;
        hardFailReasons.push(`Has ${laptop.storage.split(" ")[0]} storage while ${requiredMinStorage >= 1024 ? "1TB" : requiredMinStorage + "GB"} was requested`);
      }
    } else {
      storageScore = storageGB >= 1024 ? 100 : storageGB >= 512 ? 90 : 75;
    }

    // 5. HARD REQUIREMENT: CPU
    let cpuScore = cpuLevel;
    let passesHardCpu = true;

    if (input.minCpu) {
      const targetCpuNorm = input.minCpu.toLowerCase();
      if (targetCpuNorm.includes("apple") && laptop.brand !== "Apple") {
        passesHardCpu = false;
        hardFailReasons.push(`Apple M-series was requested`);
      } else if (targetCpuNorm.includes("i7") || targetCpuNorm.includes("ryzen 7")) {
        if (cpuLevel < 70) {
          passesHardCpu = false;
          hardFailReasons.push(`Processor ${laptop.processor.split("(")[0].trim()} does not meet i7/Ryzen 7 tier`);
        }
      }
    }

    // 6. HARD REQUIREMENT: Brand
    let brandScore = 80;
    let passesHardBrand = true;

    if (input.preferredBrands && input.preferredBrands.length > 0) {
      if (input.preferredBrands.includes(laptop.brand)) {
        brandScore = 100;
      } else {
        brandScore = 40;
      }
    }

    // 7. Display Score
    let displayScore = laptop.scoreBreakdown.display;
    if (input.displayRequirements === "high-refresh") {
      displayScore = (laptop.display.includes("144Hz") || laptop.display.includes("120Hz") || laptop.display.includes("165Hz") || laptop.display.includes("240Hz")) ? 100 : 50;
    } else if (input.displayRequirements === "oled-color-accurate") {
      displayScore = (laptop.display.includes("OLED") || laptop.display.includes("Retina") || laptop.display.includes("100% sRGB") || laptop.display.includes("DCI-P3")) ? 100 : 60;
    }

    // 8. Battery Score
    const batteryScore = laptop.scoreBreakdown.battery;

    // 9. Portability Score
    let portabilityScore = 75;
    if (laptop.weight) {
      const weightKg = parseFloat(laptop.weight);
      if (weightKg <= 1.45) portabilityScore = 100;
      else if (weightKg <= 1.7) portabilityScore = 88;
      else if (weightKg <= 2.0) portabilityScore = 75;
      else portabilityScore = 60;
    }

    // 10. BuyWise Score factor
    const buyWiseScoreFactor = laptop.buyWiseScore;

    // Weighted Overall Score (Deterministic formula)
    const finalScore =
      budgetScore * baseWeights.budget +
      gpuScore * baseWeights.gpu +
      cpuScore * baseWeights.cpu +
      ramScore * baseWeights.ram +
      storageScore * baseWeights.storage +
      displayScore * baseWeights.display +
      batteryScore * baseWeights.battery +
      portabilityScore * baseWeights.portability +
      buyWiseScoreFactor * baseWeights.buyWiseScore +
      (brandScore - 80) * 0.05;

    const matchPercentage = Math.min(99, Math.max(55, Math.round(finalScore)));

    const passesAllHardFilters =
      passesHardBudget &&
      passesHardRam &&
      passesHardGpu &&
      passesHardStorage &&
      passesHardCpu &&
      passesHardBrand;

    candidatePool.push({
      laptop,
      effectivePrice,
      effectiveOffers,
      budgetScore,
      gpuScore,
      cpuScore,
      ramScore,
      storageScore,
      displayScore,
      batteryScore,
      portabilityScore,
      brandScore,
      buyWiseScoreFactor,
      finalScore,
      matchPercentage,
      passesHardBudget,
      passesHardRam,
      passesHardGpu,
      passesHardStorage,
      passesHardCpu,
      passesHardBrand,
      passesAllHardFilters,
      hardFailReasons,
      tierDiff: Math.abs(tierDiff),
    });
  }

  // 2. Strict Filter: Products that pass all hard requirements
  let qualifyingList = candidatePool.filter((c) => c.passesAllHardFilters && c.matchPercentage >= 60);

  // 3. Graceful Relaxation if 0 exact qualifying laptops match
  let isRelaxed = false;
  let relaxedReason: string | undefined;

  if (qualifyingList.length === 0 && candidatePool.length > 0) {
    isRelaxed = true;

    if (strictGamingGpuRequired && (input.budget === "under-40k" || (input.rawBudgetAmount && input.rawBudgetAmount < 45000))) {
      relaxedReason = `No laptops under ₹40,000 meet your dedicated-GPU gaming requirement. Showing the closest high-performance alternatives.`;
    } else if (input.ramPreference === "32GB" && (input.budget === "under-40k" || input.budget === "40k-50k")) {
      relaxedReason = `32GB RAM configurations typically start in higher price tiers. Showing the best upgradeable alternatives closest to your budget.`;
    } else if (requiredMinStorage >= 1024 && (input.budget === "under-40k" || input.budget === "40k-50k")) {
      relaxedReason = `1TB NVMe configurations typically start above ₹55,000. Showing 512GB alternatives closest to your budget.`;
    } else {
      relaxedReason = `No laptops simultaneously met all chosen constraints. Relaxed secondary constraints to present the closest matching configurations in ${currency}.`;
    }

    // Sort candidate pool by final score and pick top alternatives
    qualifyingList = [...candidatePool]
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 6);
  }

  // 4. Deterministic Sort: Rank ALL matching products descending by match score, then BuyWise score
  qualifyingList.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return b.laptop.buyWiseScore - a.laptop.buyWiseScore;
  });

  // 5. Generate structured results for ALL qualifying laptops
  const rankLabels = ["BEST MATCH", "STRONG CONTENDER", "GREAT ALTERNATIVE"];

  const recommendations: RecommendationResult[] = qualifyingList.map((item, index) => {
    const { laptop, effectivePrice, effectiveOffers, matchPercentage, hardFailReasons } = item;

    // Deterministic factual "Why it matches" based strictly on real catalog specifications
    const whyItMatches: string[] = [];

    // Reason 1: Budget
    if (item.budgetScore >= 95) {
      if (input.rawBudgetAmount) {
        whyItMatches.push(`Fits within your ${formatCurrency(input.rawBudgetAmount, currency)} budget (${formatCurrency(effectivePrice, currency)})`);
      } else {
        whyItMatches.push(`Fits your ${targetTier.label} budget perfectly (${formatCurrency(effectivePrice, currency)})`);
      }
    } else if (effectivePrice) {
      whyItMatches.push(`Solid value in the ${formatCurrency(effectivePrice, currency)} bracket`);
    }

    // Reason 2: RAM & Multitasking
    if (laptop.ramSize >= 16) {
      whyItMatches.push(`${laptop.ram.split(" ")[0]} memory ensures seamless multitasking & development`);
    } else {
      whyItMatches.push(`Responsive ${laptop.processor.split("(")[0].trim()} processor with fast SSD storage`);
    }

    // Reason 3: Workload & GPU
    if (input.primaryUse === "Gaming" && (laptop.gpuCategory === "NVIDIA" || laptop.gpuCategory === "AMD")) {
      whyItMatches.push(`Dedicated ${laptop.gpu.replace("NVIDIA GeForce ", "")} delivers high gaming frame rates`);
    } else if (input.primaryUse === "Programming") {
      whyItMatches.push(`Multi-core ${laptop.processor.split("(")[0].trim()} accelerates compilation and containers`);
    } else if (laptop.useCases.includes(input.primaryUse)) {
      whyItMatches.push(`Optimized specifically for ${input.primaryUse} workflows`);
    }

    // Reason 4: Display / Battery / Build
    if (laptop.display.includes("144Hz") || laptop.display.includes("120Hz")) {
      whyItMatches.push(`Smooth ${laptop.display.split(" ")[0]} ${laptop.display.includes("144Hz") ? "144Hz" : "120Hz"} high-refresh display`);
    } else if (laptop.scoreBreakdown.battery >= 85) {
      whyItMatches.push(`Long battery endurance (${laptop.battery.split("(")[0].trim()})`);
    } else if (laptop.scoreBreakdown.display >= 88) {
      whyItMatches.push(`Crisp, color-accurate ${laptop.display.split("(")[0].trim()} screen`);
    } else if (laptop.buyWiseScore >= 85) {
      whyItMatches.push(`High overall BuyWise score (${laptop.buyWiseScore}/100)`);
    }

    // Deterministic Drawback
    let potentialDrawback = "Standard battery life under sustained heavy compute workloads";
    if (laptop.cons && laptop.cons.length > 0) {
      potentialDrawback = laptop.cons[0];
    } else if (laptop.gpuCategory === "Integrated" && input.primaryUse === "Gaming") {
      potentialDrawback = "Integrated graphics limits high-FPS AAA gaming performance";
    } else if (laptop.ramSize === 8 && input.primaryUse === "Programming") {
      potentialDrawback = "8GB RAM may need upgrading for heavy virtualization";
    } else if (laptop.weight && parseFloat(laptop.weight) >= 2.2) {
      potentialDrawback = `Heavier chassis (${laptop.weight}) designed primarily for desktop use`;
    }

    // Warning note if near-match
    let warningNote: string | undefined;
    if (isRelaxed && hardFailReasons.length > 0) {
      warningNote = `Near-match note: ${hardFailReasons.join("; ")}.`;
    }

    return {
      laptop,
      rank: index + 1,
      rankLabel: index < 3 ? rankLabels[index] : `MATCH #${index + 1}`,
      matchPercentage,
      whyItMatches: whyItMatches.slice(0, 4),
      potentialDrawback,
      warningNote,
      isRelaxedMatch: isRelaxed,
      relaxedReason,
      displayPrice: effectivePrice ?? undefined,
      displayCurrency: currency,
      displayOffers: effectiveOffers,
      matchScoreBreakdown: {
        budgetScore: Math.round(item.budgetScore),
        useCaseScore: Math.round(item.gpuScore * 0.5 + item.cpuScore * 0.5),
        specScore: Math.round(item.ramScore * 0.5 + item.storageScore * 0.5),
        priorityScore: Math.round(item.batteryScore * 0.5 + item.displayScore * 0.5),
        buyWiseScore: item.buyWiseScoreFactor,
      },
    };
  });

  return {
    recommendations,
    isRelaxed,
    relaxedReason,
    totalMatches: recommendations.length,
  };
}
