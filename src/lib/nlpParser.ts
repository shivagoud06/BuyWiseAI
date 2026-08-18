import {
  PriceRangeFilter,
  UseCaseType,
  PriorityType,
  RamPreferenceType,
  GpuPreferenceType,
  CurrencyCode,
  CountryCode,
  BudgetMode,
  BrandType,
} from "@/types";

export interface ParsedRequirements {
  rawQuery: string;
  budget: PriceRangeFilter;
  rawBudgetAmount?: number;
  budgetMode: BudgetMode;
  currency: CurrencyCode;
  country: CountryCode;
  isAmbiguousCurrency?: boolean;
  isUnsupportedMarket?: boolean;
  unsupportedMessage?: string;
  primaryUse: UseCaseType;
  priorities: PriorityType[];
  ramPreference: RamPreferenceType;
  gpuPreference: GpuPreferenceType;
  preferredBrands?: BrandType[];
  minRam?: number;
  minStorage?: number;
  storagePreference?: "256GB" | "512GB" | "1TB" | "no-preference";
  minCpu?: string;
  minGpuTier?: "integrated" | "any-dedicated" | "rtx-3050" | "rtx-4050" | "rtx-4060" | "rtx-4070";
  displayRequirements?: "high-refresh" | "oled-color-accurate" | "standard" | "no-preference";
  confidence: {
    hasBudget: boolean;
    hasUseCase: boolean;
    hasPriorities: boolean;
    hasRam: boolean;
    hasGpu: boolean;
    hasStorage: boolean;
    hasCpu: boolean;
    hasBrand: boolean;
    isSufficient: boolean;
  };
}

/**
 * Local Rule-Based NLP Parser for extracting user requirements from natural language.
 * Automatically detects Currency, Country/Region, Budget Amount, Budget Mode, Use Case,
 * Hardware Specs (RAM, Storage, CPU, GPU tier, Display), and Brand Preferences.
 */
export function parseUserRequirements(text: string): ParsedRequirements {
  const normalized = text.toLowerCase().trim();

  // 1. Currency & Country Detection (Preserves user-entered currency)
  let currency: CurrencyCode = "INR";
  let country: CountryCode = "IN";
  let isAmbiguousCurrency = false;
  let isUnsupportedMarket = false;
  let unsupportedMessage: string | undefined;

  if (
    normalized.includes("aed") ||
    normalized.includes("dirham") ||
    normalized.includes("dubai") ||
    normalized.includes("uae")
  ) {
    isUnsupportedMarket = true;
    currency = "OTHER";
    country = "OTHER";
    unsupportedMessage =
      "BuyWise doesn't have verified laptop pricing for the UAE (AED) market yet. We currently have verified catalog coverage for India (₹ INR), the United States ($ USD), the United Kingdom (£ GBP), and Europe (€ EUR).";
  } else if (
    normalized.includes("aud") ||
    normalized.includes("australia") ||
    normalized.includes("cad") ||
    normalized.includes("canada") ||
    normalized.includes("sgd") ||
    normalized.includes("singapore") ||
    normalized.includes("jpy") ||
    normalized.includes("yen") ||
    normalized.includes("japan") ||
    normalized.includes("nzd") ||
    normalized.includes("new zealand")
  ) {
    isUnsupportedMarket = true;
    currency = "OTHER";
    country = "OTHER";
    unsupportedMessage =
      "BuyWise doesn't have verified laptop pricing for this market yet. We currently have verified catalog coverage for India (₹ INR), the United States ($ USD), the United Kingdom (£ GBP), and Europe (€ EUR).";
  } else if (
    normalized.includes("£") ||
    normalized.includes("gbp") ||
    normalized.includes("pound") ||
    normalized.includes("pounds") ||
    normalized.includes("in uk") ||
    normalized.includes("in the uk") ||
    normalized.includes("england") ||
    normalized.includes("britain")
  ) {
    currency = "GBP";
    country = "UK";
  } else if (
    normalized.includes("€") ||
    normalized.includes("eur") ||
    normalized.includes("euro") ||
    normalized.includes("euros") ||
    normalized.includes("in europe") ||
    normalized.includes("germany") ||
    normalized.includes("france") ||
    normalized.includes("spain") ||
    normalized.includes("italy")
  ) {
    currency = "EUR";
    country = "EU";
  } else if (
    normalized.includes("$") ||
    normalized.includes("usd") ||
    normalized.includes("dollar") ||
    normalized.includes("dollars") ||
    normalized.includes("in us") ||
    normalized.includes("in the us") ||
    normalized.includes("in usa") ||
    normalized.includes("america")
  ) {
    currency = "USD";
    country = "US";
    if (
      normalized.includes("$") &&
      !normalized.includes("us") &&
      !normalized.includes("usa") &&
      !normalized.includes("usd") &&
      !normalized.includes("america")
    ) {
      isAmbiguousCurrency = true;
    }
  } else if (
    normalized.includes("₹") ||
    normalized.includes("rs") ||
    normalized.includes("inr") ||
    normalized.includes("rupee") ||
    normalized.includes("rupees") ||
    normalized.includes("lakh") ||
    normalized.includes("lac") ||
    normalized.includes("crore") ||
    normalized.includes("india")
  ) {
    currency = "INR";
    country = "IN";
  }

  // 2. Budget Mode (under / around / above)
  let budgetMode: BudgetMode = "under";
  if (
    normalized.includes("around") ||
    normalized.includes("approx") ||
    normalized.includes("about") ||
    normalized.includes("roughly") ||
    normalized.includes("close to")
  ) {
    budgetMode = "around";
  } else if (
    normalized.includes("above") ||
    normalized.includes("over") ||
    normalized.includes("more than") ||
    normalized.includes("greater than") ||
    normalized.includes("starting from") ||
    normalized.includes("min")
  ) {
    budgetMode = "above";
  }

  // 3. Budget Extraction
  let hasBudget = false;
  let rawBudgetAmount: number | undefined;
  let budget: PriceRangeFilter = "50k-75k";

  if (currency === "INR") {
    const lakhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
    const kMatch = normalized.match(/(?:under|below|around|approx|about|above|within|upto|up to|₹|rs\.?|inr)?\s*(\d{2,3})\s*k/i);
    const numMatch = normalized.match(/(?:under|below|around|approx|about|above|within|upto|up to|₹|rs\.?|inr)?\s*₹?\s*(\d{2,3}(?:,\d{3})+|\d{5,6})/i);

    if (lakhMatch) {
      hasBudget = true;
      rawBudgetAmount = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else if (kMatch) {
      hasBudget = true;
      rawBudgetAmount = parseInt(kMatch[1], 10) * 1000;
    } else if (numMatch) {
      hasBudget = true;
      const cleanNum = numMatch[1].replace(/,/g, "");
      rawBudgetAmount = parseInt(cleanNum, 10);
    }

    if (rawBudgetAmount !== undefined) {
      if (rawBudgetAmount < 40000) budget = "under-40k";
      else if (rawBudgetAmount <= 50000) budget = "40k-50k";
      else if (rawBudgetAmount <= 75000) budget = "50k-75k";
      else if (rawBudgetAmount <= 100000) budget = "75k-100k";
      else budget = "above-100k";
    }
  } else if (currency === "USD") {
    const usdMatch = normalized.match(/(?:\$|usd|dollars?)?\s*(\d{1,2}(?:,\d{3})*|\d{3,4})\s*(?:\$|usd|dollars?)?/i);
    if (usdMatch) {
      const clean = usdMatch[1].replace(/,/g, "");
      const val = parseInt(clean, 10);
      if (val >= 200 && val <= 10000) {
        hasBudget = true;
        rawBudgetAmount = val;
        if (val < 500) budget = "under-40k";
        else if (val <= 750) budget = "40k-50k";
        else if (val <= 1000) budget = "50k-75k";
        else if (val <= 1400) budget = "75k-100k";
        else budget = "above-100k";
      }
    }
  } else if (currency === "GBP") {
    const gbpMatch = normalized.match(/(?:£|gbp|pounds?)?\s*(\d{1,2}(?:,\d{3})*|\d{3,4})\s*(?:£|gbp|pounds?)?/i);
    if (gbpMatch) {
      const clean = gbpMatch[1].replace(/,/g, "");
      const val = parseInt(clean, 10);
      if (val >= 150 && val <= 10000) {
        hasBudget = true;
        rawBudgetAmount = val;
        if (val < 450) budget = "under-40k";
        else if (val <= 650) budget = "40k-50k";
        else if (val <= 900) budget = "50k-75k";
        else if (val <= 1200) budget = "75k-100k";
        else budget = "above-100k";
      }
    }
  } else if (currency === "EUR") {
    const eurMatch = normalized.match(/(?:€|eur|euros?)?\s*(\d{1,2}(?:,\d{3})*|\d{3,4})\s*(?:€|eur|euros?)?/i);
    if (eurMatch) {
      const clean = eurMatch[1].replace(/,/g, "");
      const val = parseInt(clean, 10);
      if (val >= 150 && val <= 10000) {
        hasBudget = true;
        rawBudgetAmount = val;
        if (val < 500) budget = "under-40k";
        else if (val <= 750) budget = "40k-50k";
        else if (val <= 1000) budget = "50k-75k";
        else if (val <= 1500) budget = "75k-100k";
        else budget = "above-100k";
      }
    }
  }

  // 4. Primary Use Case Extraction
  let hasUseCase = false;
  let primaryUse: UseCaseType = "Programming";

  if (
    normalized.includes("gaming") ||
    normalized.includes("games") ||
    normalized.includes("gamer") ||
    normalized.includes("play gta") ||
    normalized.includes("valorant") ||
    normalized.includes("cyberpunk") ||
    normalized.includes("fps")
  ) {
    primaryUse = "Gaming";
    hasUseCase = true;
  } else if (
    normalized.includes("program") ||
    normalized.includes("coding") ||
    normalized.includes("code") ||
    normalized.includes("developer") ||
    normalized.includes("python") ||
    normalized.includes("web dev") ||
    normalized.includes("software") ||
    normalized.includes("compil")
  ) {
    primaryUse = "Programming";
    hasUseCase = true;
  } else if (
    normalized.includes("student") ||
    normalized.includes("college") ||
    normalized.includes("school") ||
    normalized.includes("study") ||
    normalized.includes("lectures") ||
    normalized.includes("assignments")
  ) {
    primaryUse = "Student";
    hasUseCase = true;
  } else if (
    normalized.includes("video edit") ||
    normalized.includes("content creation") ||
    normalized.includes("editing") ||
    normalized.includes("render") ||
    normalized.includes("photoshop") ||
    normalized.includes("premiere") ||
    normalized.includes("creator") ||
    normalized.includes("3d")
  ) {
    primaryUse = "Content Creation";
    hasUseCase = true;
  } else if (
    normalized.includes("office") ||
    normalized.includes("work") ||
    normalized.includes("business") ||
    normalized.includes("excel") ||
    normalized.includes("meetings") ||
    normalized.includes("corporate")
  ) {
    primaryUse = "Office";
    hasUseCase = true;
  }

  // 5. Priorities Extraction
  const priorities: PriorityType[] = [];
  let hasPriorities = false;

  if (
    normalized.includes("battery") ||
    normalized.includes("all day") ||
    normalized.includes("unplugged") ||
    normalized.includes("backup")
  ) {
    priorities.push("Battery");
    hasPriorities = true;
  }

  if (
    normalized.includes("display") ||
    normalized.includes("screen") ||
    normalized.includes("oled") ||
    normalized.includes("color accurate") ||
    normalized.includes("retina") ||
    normalized.includes("bright")
  ) {
    priorities.push("Display");
    hasPriorities = true;
  }

  if (
    normalized.includes("lightweight") ||
    normalized.includes("portable") ||
    normalized.includes("portability") ||
    normalized.includes("slim") ||
    normalized.includes("thin") ||
    normalized.includes("light")
  ) {
    priorities.push("Portability");
    hasPriorities = true;
  }

  if (
    normalized.includes("performance") ||
    normalized.includes("fast") ||
    normalized.includes("powerful") ||
    normalized.includes("speed") ||
    normalized.includes("heavy")
  ) {
    priorities.push("Performance");
    hasPriorities = true;
  }

  if (
    normalized.includes("value") ||
    normalized.includes("vfm") ||
    normalized.includes("budget friendly") ||
    normalized.includes("worth") ||
    normalized.includes("cheap")
  ) {
    priorities.push("Value for Money");
    hasPriorities = true;
  }

  if (priorities.length === 0) {
    if (primaryUse === "Gaming" || primaryUse === "Programming") {
      priorities.push("Performance", "Value for Money");
    } else if (primaryUse === "Student") {
      priorities.push("Battery", "Value for Money");
    } else if (primaryUse === "Content Creation") {
      priorities.push("Display", "Performance");
    } else {
      priorities.push("Value for Money");
    }
  }

  // 6. RAM Preference & Min RAM Extraction
  let hasRam = false;
  let ramPreference: RamPreferenceType = "16GB";
  let minRam: number | undefined;

  if (normalized.includes("32gb") || normalized.includes("32 gb") || normalized.includes("32 ram")) {
    ramPreference = "32GB";
    minRam = 32;
    hasRam = true;
  } else if (normalized.includes("16gb") || normalized.includes("16 gb") || normalized.includes("16 ram")) {
    ramPreference = "16GB";
    minRam = 16;
    hasRam = true;
  } else if (normalized.includes("8gb") || normalized.includes("8 gb") || normalized.includes("8 ram")) {
    ramPreference = "8GB";
    minRam = 8;
    hasRam = true;
  } else {
    if (primaryUse === "Programming" || primaryUse === "Gaming" || primaryUse === "Content Creation") {
      ramPreference = "16GB";
    } else {
      ramPreference = "8GB";
    }
  }

  // 7. GPU Preference & GPU Tier Extraction
  let hasGpu = false;
  let gpuPreference: GpuPreferenceType = "no-preference";
  let minGpuTier: "integrated" | "any-dedicated" | "rtx-3050" | "rtx-4050" | "rtx-4060" | "rtx-4070" | undefined;

  if (normalized.includes("rtx 4070") || normalized.includes("rtx4070")) {
    gpuPreference = "gaming-required";
    minGpuTier = "rtx-4070";
    hasGpu = true;
  } else if (normalized.includes("rtx 4060") || normalized.includes("rtx4060") || normalized.includes("4060 or better")) {
    gpuPreference = "gaming-required";
    minGpuTier = "rtx-4060";
    hasGpu = true;
  } else if (normalized.includes("rtx 4050") || normalized.includes("rtx4050")) {
    gpuPreference = "gaming-required";
    minGpuTier = "rtx-4050";
    hasGpu = true;
  } else if (normalized.includes("rtx 3050") || normalized.includes("rtx3050")) {
    gpuPreference = "gaming-required";
    minGpuTier = "rtx-3050";
    hasGpu = true;
  } else if (
    normalized.includes("gaming gpu") ||
    normalized.includes("rtx") ||
    normalized.includes("gtx") ||
    (primaryUse === "Gaming" && !normalized.includes("integrated"))
  ) {
    gpuPreference = "gaming-required";
    minGpuTier = "any-dedicated";
    hasGpu = true;
  } else if (
    normalized.includes("dedicated gpu") ||
    normalized.includes("dedicated graphics") ||
    normalized.includes("discrete gpu") ||
    normalized.includes("graphics card") ||
    primaryUse === "Content Creation"
  ) {
    gpuPreference = "dedicated-preferred";
    minGpuTier = "any-dedicated";
    hasGpu = true;
  } else if (
    normalized.includes("integrated") ||
    normalized.includes("no gpu") ||
    normalized.includes("iris") ||
    normalized.includes("no gaming")
  ) {
    gpuPreference = "integrated";
    minGpuTier = "integrated";
    hasGpu = true;
  }

  // 8. Storage Preference Extraction
  let hasStorage = false;
  let storagePreference: "256GB" | "512GB" | "1TB" | "no-preference" = "no-preference";
  let minStorage: number | undefined;

  if (
    normalized.includes("1tb") ||
    normalized.includes("1 tb") ||
    normalized.includes("1000gb") ||
    normalized.includes("1024gb")
  ) {
    storagePreference = "1TB";
    minStorage = 1024;
    hasStorage = true;
  } else if (normalized.includes("512gb") || normalized.includes("512 gb")) {
    storagePreference = "512GB";
    minStorage = 512;
    hasStorage = true;
  } else if (normalized.includes("256gb") || normalized.includes("256 gb")) {
    storagePreference = "256GB";
    minStorage = 256;
    hasStorage = true;
  }

  // 9. CPU Preference Extraction
  let hasCpu = false;
  let minCpu: string | undefined;

  if (normalized.includes("i9") || normalized.includes("ryzen 9")) {
    minCpu = "i9";
    hasCpu = true;
  } else if (
    normalized.includes("i7") ||
    normalized.includes("core i7") ||
    normalized.includes("ryzen 7") ||
    normalized.includes("ultra 7")
  ) {
    minCpu = "i7";
    hasCpu = true;
  } else if (
    normalized.includes("i5") ||
    normalized.includes("core i5") ||
    normalized.includes("ryzen 5")
  ) {
    minCpu = "i5";
    hasCpu = true;
  } else if (
    normalized.includes("m1") ||
    normalized.includes("m2") ||
    normalized.includes("m3") ||
    normalized.includes("m-series") ||
    normalized.includes("apple silicon") ||
    normalized.includes("macbook")
  ) {
    minCpu = "Apple M-series";
    hasCpu = true;
  }

  // 10. Preferred Brands Extraction
  const preferredBrands: BrandType[] = [];
  let hasBrand = false;

  const brandKeywords: { name: BrandType; patterns: string[] }[] = [
    { name: "Lenovo", patterns: ["lenovo", "thinkpad", "ideapad", "legion", "loq"] },
    { name: "HP", patterns: ["hp", "victus", "omen", "pavilion", "envy"] },
    { name: "Dell", patterns: ["dell", "alienware", "xps", "inspiron"] },
    { name: "ASUS", patterns: ["asus", "rog", "tuf", "zenbook", "vivobook"] },
    { name: "Acer", patterns: ["acer", "predator", "nitro", "aspire", "swift"] },
    { name: "MSI", patterns: ["msi", "katana", "cyborg", "bravo", "modern"] },
    { name: "Apple", patterns: ["apple", "macbook", "mac"] },
  ];

  for (const b of brandKeywords) {
    if (b.patterns.some((p) => normalized.includes(p))) {
      preferredBrands.push(b.name);
      hasBrand = true;
    }
  }

  // 11. Display Requirements Extraction
  let displayRequirements: "high-refresh" | "oled-color-accurate" | "standard" | "no-preference" = "no-preference";
  if (
    normalized.includes("144hz") ||
    normalized.includes("120hz") ||
    normalized.includes("165hz") ||
    normalized.includes("240hz") ||
    normalized.includes("high refresh")
  ) {
    displayRequirements = "high-refresh";
  } else if (
    normalized.includes("oled") ||
    normalized.includes("100% srgb") ||
    normalized.includes("dci-p3") ||
    normalized.includes("retina") ||
    normalized.includes("color accurate")
  ) {
    displayRequirements = "oled-color-accurate";
  }

  const isSufficient =
    normalized.length >= 4 &&
    (hasBudget || hasUseCase || hasPriorities || hasRam || hasGpu || hasStorage || hasCpu || hasBrand);

  return {
    rawQuery: text,
    budget,
    rawBudgetAmount,
    budgetMode,
    currency,
    country,
    isAmbiguousCurrency,
    isUnsupportedMarket,
    unsupportedMessage,
    primaryUse,
    priorities,
    ramPreference,
    gpuPreference,
    preferredBrands: preferredBrands.length > 0 ? preferredBrands : undefined,
    minRam,
    minStorage,
    storagePreference: storagePreference !== "no-preference" ? storagePreference : undefined,
    minCpu,
    minGpuTier,
    displayRequirements: displayRequirements !== "no-preference" ? displayRequirements : undefined,
    confidence: {
      hasBudget,
      hasUseCase,
      hasPriorities,
      hasRam,
      hasGpu,
      hasStorage,
      hasCpu,
      hasBrand,
      isSufficient,
    },
  };
}

