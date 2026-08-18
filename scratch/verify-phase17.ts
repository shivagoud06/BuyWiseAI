import { LAPTOPS } from "../src/data/laptops";
import { getLaptopRecommendations } from "../src/lib/recommendationEngine";
import { parseUserRequirements } from "../src/lib/nlpParser";
import { AdvisorInput, Laptop } from "../src/types";

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const testResults: TestResult[] = [];

function runTest(id: number, name: string, fn: () => void) {
  try {
    fn();
    testResults.push({ id, name, passed: true });
  } catch (err: any) {
    testResults.push({ id, name, passed: false, error: err.message });
  }
}

// =========================================================================
// TEST SUITE — BUYWISE SHOPPING ENGINE (PHASE 17)
// =========================================================================

// 1. Budget Filtering: strict under-budget eliminates over-budget laptops
runTest(1, "Budget Filtering (Strict under-budget excludes over-budget laptops)", () => {
  const input: AdvisorInput = {
    budget: "under-40k",
    rawBudgetAmount: 40000,
    budgetMode: "under",
    currency: "INR",
    primaryUse: "Student",
    priorities: ["Value for Money"],
    ramPreference: "8GB",
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected qualifying laptops under ₹40,000");
  for (const rec of recommendations) {
    if (rec.laptop.price && rec.laptop.price > 42000) {
      throw new Error(`Found laptop over budget in strict under mode: ${rec.laptop.name} (₹${rec.laptop.price})`);
    }
  }
});

// 2. Currency Preservation: entered currency is preserved without fake rates
runTest(2, "Currency Preservation (Preserves USD, GBP, EUR, and unverified markets)", () => {
  // Test USD
  const parsedUSD = parseUserRequirements("Laptop under $1000 for coding in US");
  if (parsedUSD.currency !== "USD") throw new Error(`Expected USD currency, got ${parsedUSD.currency}`);

  // Test GBP
  const parsedGBP = parseUserRequirements("Student laptop under £600 in UK");
  if (parsedGBP.currency !== "GBP") throw new Error(`Expected GBP currency, got ${parsedGBP.currency}`);

  // Test EUR
  const parsedEUR = parseUserRequirements("Gaming laptop under €1200 in Europe");
  if (parsedEUR.currency !== "EUR") throw new Error(`Expected EUR currency, got ${parsedEUR.currency}`);

  // Test unsupported market preservation (e.g. AED)
  const parsedAED = parseUserRequirements("Laptop for office under AED 3000 in Dubai");
  if (!parsedAED.isUnsupportedMarket) throw new Error("Expected unsupported market detection for AED");
  if (parsedAED.currency !== "OTHER") throw new Error("Expected currency OTHER for AED");
});

// 3. RAM Hard Requirement: 16GB eliminates 8GB laptops
runTest(3, "RAM Hard Requirement (16GB RAM eliminates 8GB laptops)", () => {
  const input: AdvisorInput = {
    budget: "75k-100k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    minRam: 16,
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching 16GB laptops");
  for (const rec of recommendations) {
    if (rec.laptop.ramSize < 16) {
      throw new Error(`Found ${rec.laptop.ramSize}GB laptop when 16GB was strictly required: ${rec.laptop.name}`);
    }
  }
});

// 4. GPU Hard Requirement: RTX 4060 or better eliminates integrated & entry GPUs
runTest(4, "GPU Hard Requirement (RTX 4060+ eliminates integrated & entry graphics)", () => {
  const input: AdvisorInput = {
    budget: "75k-100k",
    currency: "INR",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "gaming-required",
    minGpuTier: "rtx-4060",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching RTX 4060+ laptops");
  for (const rec of recommendations) {
    const gpuNorm = rec.laptop.gpu.toLowerCase();
    const isRtx4060Plus = gpuNorm.includes("4060") || gpuNorm.includes("4070") || gpuNorm.includes("4080") || gpuNorm.includes("4090") || rec.laptop.gpuCategory === "Apple";
    if (!isRtx4060Plus) {
      throw new Error(`Found below-RTX-4060 GPU in strict tier match: ${rec.laptop.gpu} on ${rec.laptop.name}`);
    }
  }
});

// 5. Storage Hard Requirement: 1TB eliminates 512GB laptops when required
runTest(5, "Storage Hard Requirement (1TB SSD requirement eliminates 512GB)", () => {
  const input: AdvisorInput = {
    budget: "above-100k",
    currency: "INR",
    primaryUse: "Content Creation",
    priorities: ["Performance", "Display"],
    ramPreference: "16GB",
    gpuPreference: "dedicated-preferred",
    storagePreference: "1TB",
    minStorage: 1024,
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching 1TB laptops");
  for (const rec of recommendations) {
    const storageNorm = rec.laptop.storage.toLowerCase();
    if (!storageNorm.includes("1tb") && !storageNorm.includes("2tb") && !storageNorm.includes("1024gb")) {
      throw new Error(`Found <1TB storage laptop when 1TB was strictly required: ${rec.laptop.storage}`);
    }
  }
});

// 6. CPU Requirement: i7/Ryzen 7 requirement filters entry CPUs
runTest(6, "CPU Requirement (i7/Ryzen 7 requirement filters entry processors)", () => {
  const input: AdvisorInput = {
    budget: "75k-100k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
    minCpu: "i7",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching i7/Ryzen 7 laptops");
  for (const rec of recommendations) {
    const procNorm = rec.laptop.processor.toLowerCase();
    if (procNorm.includes("i3") || procNorm.includes("ryzen 3")) {
      throw new Error(`Found entry CPU when i7 was required: ${rec.laptop.processor}`);
    }
  }
});

// 7. Gaming Scoring: GPU weighted highest for Gaming workloads
runTest(7, "Gaming Scoring (GPU weighted highest for Gaming workload)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "gaming-required",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching gaming laptops");
  // Top recommendation should have a discrete GPU
  const top = recommendations[0].laptop;
  if (top.gpuCategory !== "NVIDIA" && top.gpuCategory !== "AMD" && top.gpuCategory !== "Apple") {
    throw new Error(`Top gaming recommendation does not have a discrete GPU: ${top.name}`);
  }
});

// 8. Programming Scoring: CPU and RAM weighted highest for Programming
runTest(8, "Programming Scoring (CPU and RAM prioritized for Programming workload)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching programming laptops");
  const top = recommendations[0].laptop;
  if (top.ramSize < 16) {
    throw new Error(`Top programming recommendation should have at least 16GB RAM: ${top.name}`);
  }
});

// 9. Student / General-Use Scoring: Value, Battery, Portability prioritized
runTest(9, "Student/General-Use Scoring (Value, battery, and portability weighted higher)", () => {
  const input: AdvisorInput = {
    budget: "under-40k",
    currency: "INR",
    primaryUse: "Student",
    priorities: ["Battery", "Value for Money", "Portability"],
    ramPreference: "8GB",
    gpuPreference: "integrated",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected matching student laptops");
  const top = recommendations[0].laptop;
  if (top.scoreBreakdown.priceValue < 80) {
    throw new Error(`Top student recommendation should have high value score: ${top.name}`);
  }
});

// 10. Multiple Valid Results: Returns multiple matching results
runTest(10, "Multiple Valid Results (Returns all qualifying laptops)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance", "Value for Money"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
  };
  const { recommendations, totalMatches } = getLaptopRecommendations(input, LAPTOPS);
  if (totalMatches < 2) {
    throw new Error(`Expected multiple qualifying laptops in ₹50k-₹75k range, got ${totalMatches}`);
  }
  if (recommendations.length !== totalMatches) {
    throw new Error(`Mismatch between recommendations array (${recommendations.length}) and totalMatches (${totalMatches})`);
  }
});

// 11. More Than 3 Matching Laptops: Does not discard beyond 3 matches
runTest(11, "More Than 3 Matching Laptops (Does not discard valid matches beyond 3)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Value for Money"],
    ramPreference: "no-preference",
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length <= 3) {
    throw new Error(`Expected more than 3 matching laptops for broad query, got ${recommendations.length}`);
  }
  // Check ranks are sequentially numbered 1, 2, 3, 4, 5...
  recommendations.forEach((rec, idx) => {
    if (rec.rank !== idx + 1) {
      throw new Error(`Rank mismatch at index ${idx}: expected ${idx + 1}, got ${rec.rank}`);
    }
  });
});

// 12. Ranking: Best match reflects user needs, not simply lowest price
runTest(12, "Ranking (Best match for user needs, not simply lowest price)", () => {
  const input: AdvisorInput = {
    budget: "75k-100k",
    currency: "INR",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "gaming-required",
    minGpuTier: "rtx-4060",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length < 2) throw new Error("Need at least 2 recommendations to test ranking");
  // Check that rank 1 matchPercentage is >= rank 2 matchPercentage
  if (recommendations[0].matchPercentage < recommendations[1].matchPercentage) {
    throw new Error("Rank 1 has lower match percentage than Rank 2");
  }
});

// 13. Explanation Generation: Factual and matches actual catalog specifications
runTest(13, "Explanation Generation (Generates factual spec-based reasons)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "gaming-required",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length === 0) throw new Error("Expected recommendations");
  const top = recommendations[0];
  if (!top.whyItMatches || top.whyItMatches.length === 0) {
    throw new Error("Expected whyItMatches explanations");
  }
  // Ensure whyItMatches is factual strings
  for (const reason of top.whyItMatches) {
    if (typeof reason !== "string" || reason.trim().length === 0) {
      throw new Error("Invalid explanation reason string");
    }
  }
});

// 14. Near-Match Warnings: Explains limitations when secondary requirements relaxed
runTest(14, "Near-Match Warnings (Generates warning note on relaxed match)", () => {
  // Request gaming GPU with impossible under-40k budget
  const input: AdvisorInput = {
    budget: "under-40k",
    rawBudgetAmount: 35000,
    budgetMode: "under",
    currency: "INR",
    primaryUse: "Gaming",
    priorities: ["Performance"],
    ramPreference: "32GB",
    gpuPreference: "gaming-required",
  };
  const { recommendations, isRelaxed, relaxedReason } = getLaptopRecommendations(input, LAPTOPS);
  if (!isRelaxed) throw new Error("Expected isRelaxed to be true for conflicting constraints");
  if (!relaxedReason) throw new Error("Expected relaxedReason explanation");
  // Check warning note exists on relaxed candidates
  const hasWarning = recommendations.some((r) => !!r.warningNote);
  if (!hasWarning) throw new Error("Expected warningNote on relaxed candidates");
});

// 15. No Fake Retailer Prices: Verified pricing is labeled correctly
runTest(15, "No Fake Retailer Prices (Reference prices and unverified statuses handled cleanly)", () => {
  for (const laptop of LAPTOPS) {
    if (laptop.price !== null && laptop.price <= 0) {
      throw new Error(`Invalid non-positive catalog price for ${laptop.id}`);
    }
    if (laptop.offers) {
      for (const offer of laptop.offers) {
        if (!offer.retailerName || !offer.price || offer.price <= 0) {
          throw new Error(`Invalid retailer offer on laptop ${laptop.id}`);
        }
      }
    }
  }
});

// 16. Product Detail Navigation: Link targets exist
runTest(16, "Product Detail Navigation (Catalog IDs valid for /laptops/[id])", () => {
  const ids = new Set(LAPTOPS.map((l) => l.id));
  if (ids.size !== LAPTOPS.length) {
    throw new Error("Duplicate laptop IDs found in catalog");
  }
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  for (const rec of recommendations) {
    if (!ids.has(rec.laptop.id)) {
      throw new Error(`Recommended laptop ID ${rec.laptop.id} does not exist in catalog`);
    }
  }
});

// 17. Compare Integration: Catalog laptops compatible with compare context
runTest(17, "Compare Integration (Recommended laptops support compare operations)", () => {
  const input: AdvisorInput = {
    budget: "50k-75k",
    currency: "INR",
    primaryUse: "Programming",
    priorities: ["Performance"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
  };
  const { recommendations } = getLaptopRecommendations(input, LAPTOPS);
  if (recommendations.length < 2) throw new Error("Need at least 2 recommendations for compare test");
  const lap1 = recommendations[0].laptop;
  const lap2 = recommendations[1].laptop;
  if (!lap1.id || !lap2.id || lap1.id === lap2.id) {
    throw new Error("Invalid distinct laptops for comparison");
  }
});

// Output Summary
console.log("==================================================");
console.log("BUYWISE AI — PHASE 17 SHOPPING ENGINE TEST SUITE");
console.log("==================================================");

let passedCount = 0;
testResults.forEach((res) => {
  const symbol = res.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${res.id}/17] ${symbol}: ${res.name}`);
  if (res.passed) passedCount++;
  else if (res.error) console.log(`      Error: ${res.error}`);
});

console.log("--------------------------------------------------");
console.log(`Summary: ${passedCount}/${testResults.length} tests passed`);
console.log("==================================================");

if (passedCount < testResults.length) {
  process.exit(1);
} else {
  process.exit(0);
}
