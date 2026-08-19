import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQueries,
  buildQuickCommerceSearchQuery,
  cleanQueryString,
  getOfferDeduplicationKey,
  MAX_QUERIES_PER_PLATFORM,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { Laptop, RetailerOffer } from "../src/types";

// 1. Safely load environment variables without exposing any keys
const envLocalPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  });
}

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 27C: MULTI-QUERY RETAILER RETRIEVAL + EXACT MATCHING");
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

// Target Test Product
const TARGET_ID = "hp-victus-15-fa2500tx";
const targetLaptop = LAPTOPS.find((l) => l.id === TARGET_ID)!;

const REAL_FLIPKART_EXACT_PAYLOAD: RawQuickCommerceProduct = {
  id: "FLIPKART_VICTUS_15_FA2500TX",
  name: "HP Victus Intel Core 5 210H - (24 GB/512 GB SSD/Windows 11 Home/4 GB Graphics/NVIDIA GeForce RTX 3050) 15-fa2500TX / 15-fa2497TX Gaming Laptop",
  price: 89990,
  mrp: 147674,
  currency: "INR",
  platform: "Flipkart",
  deeplink: "https://www.flipkart.com/hp-victus-intel-core-5-210h-24-gb-512-gb-ssd-windows-11-home-4-gb-graphics-nvidia-geforce-rtx-3050-15-fa2500tx-15-fa2497tx-gaming-laptop/p/itm123456",
  in_stock: true,
  brand: "HP",
  sku: "15-fa2500TX",
};

// -----------------------------------------------------------------------------
// 17 AUTOMATED TESTS
// -----------------------------------------------------------------------------

// 1. Clean query generation
test("1. Clean query generation", () => {
  const queries = buildQuickCommerceSearchQueries(targetLaptop);
  if (queries.length === 0) throw new Error("No queries generated");
  if (queries[0] !== "HP Victus 15-fa2500tx") {
    throw new Error(`Expected primary query 'HP Victus 15-fa2500tx', got '${queries[0]}'`);
  }
  queries.forEach((q) => {
    if (q.toLowerCase().includes("hp hp")) throw new Error(`Redundant brand token detected in: '${q}'`);
    if (q.includes("(") || q.includes(")")) throw new Error(`Punctuation uncleaned in: '${q}'`);
  });
});

// 2. Duplicate query removal
test("2. Duplicate query removal", () => {
  const rawWithDupes = cleanQueryString("HP HP Victus Victus 15 15");
  if (rawWithDupes !== "HP Victus 15") {
    throw new Error(`Expected 'HP Victus 15', got '${rawWithDupes}'`);
  }
  const queries = buildQuickCommerceSearchQueries(targetLaptop);
  const uniqueSet = new Set(queries.map((q) => q.toLowerCase()));
  if (uniqueSet.size !== queries.length) {
    throw new Error("Duplicate queries found in generated query list");
  }
});

// 3. Maximum query limit
test("3. Maximum query limit", () => {
  LAPTOPS.forEach((laptop) => {
    const qList = buildQuickCommerceSearchQueries(laptop);
    if (qList.length > MAX_QUERIES_PER_PLATFORM) {
      throw new Error(`Laptop ${laptop.id} produced ${qList.length} queries (limit is ${MAX_QUERIES_PER_PLATFORM})`);
    }
  });
});

// 4. Early stop after exact match
test("4. Early stop after exact match", () => {
  let queryCount = 0;
  const simulatedQueries = ["HP Victus 15-fa2500tx", "HP Victus 15", "HP Victus i5 RTX 3050", "HP Victus RTX 3050"];
  const offersFound: RetailerOffer[] = [];

  for (const q of simulatedQueries) {
    queryCount++;
    // Simulate query 1 finding exact match
    if (q === "HP Victus 15-fa2500tx") {
      const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_EXACT_PAYLOAD)!;
      const match = matchOfferToProduct(normalized, targetLaptop);
      const val = validateRetailerOffer(normalized, targetLaptop);
      if (match.isMatch && val.isValid && val.offer) {
        offersFound.push(val.offer);
        break; // Early stopping trigger
      }
    }
  }

  if (queryCount !== 1) {
    throw new Error(`Expected early stop at 1 query, but executed ${queryCount} queries`);
  }
  if (offersFound.length !== 1) throw new Error("Expected 1 exact offer found");
});

// 5. Result deduplication
test("5. Result deduplication", () => {
  const offerA = normalizeQuickCommerceItem(REAL_FLIPKART_EXACT_PAYLOAD)!;
  const offerB = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    id: "FLIPKART_VICTUS_DUP_123",
  })!;

  const keyA = getOfferDeduplicationKey(offerA);
  const keyB = getOfferDeduplicationKey(offerB);

  // Both share same canonical URL
  if (keyA !== keyB) {
    throw new Error(`Expected matching deduplication keys for same canonical URL, got '${keyA}' vs '${keyB}'`);
  }

  const seen = new Set<string>();
  const deduped: RetailerOffer[] = [];
  [offerA, offerB].forEach((o) => {
    const k = getOfferDeduplicationKey(o);
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(o);
    }
  });
  if (deduped.length !== 1) throw new Error(`Expected 1 deduplicated offer, got ${deduped.length}`);
});

// 6. Candidate discovery
test("6. Candidate discovery", () => {
  const candidatesRaw: RawQuickCommerceProduct[] = [
    REAL_FLIPKART_EXACT_PAYLOAD,
    {
      id: "QC_VICTUS_16GB",
      name: "HP Victus Intel Core 5 210H 16GB 512GB SSD RTX 3050",
      price: 84990,
      platform: "Flipkart",
      deeplink: "https://www.flipkart.com/hp-victus-16gb/p/itm123",
    },
  ];

  const normalizedCandidates = candidatesRaw
    .map((c) => normalizeQuickCommerceItem(c))
    .filter((c): c is RetailerOffer => c !== null);

  if (normalizedCandidates.length !== 2) {
    throw new Error(`Expected 2 normalized candidates, got ${normalizedCandidates.length}`);
  }
});

// 7. Exact matcher still strict
test("7. Exact matcher still strict", () => {
  const exactOffer = normalizeQuickCommerceItem(REAL_FLIPKART_EXACT_PAYLOAD)!;
  const evalResult = matchOfferToProduct(exactOffer, targetLaptop);
  if (!evalResult.isMatch || evalResult.confidence !== "exact") {
    throw new Error(`Exact match should pass with 'exact' confidence`);
  }
});

// 8. RAM mismatch rejection
test("8. RAM mismatch rejection", () => {
  const ram16Offer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Victus 15 Intel Core 5 16GB RAM 512GB SSD RTX 3050",
  })!;
  const evalResult = matchOfferToProduct(ram16Offer, targetLaptop);
  if (evalResult.isMatch) {
    throw new Error("16GB RAM offer was not rejected for 24GB laptop");
  }

  const ram8Offer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Victus 15 Intel Core 5 8GB RAM 512GB SSD RTX 3050",
  })!;
  const evalResult8 = matchOfferToProduct(ram8Offer, targetLaptop);
  if (evalResult8.isMatch) {
    throw new Error("8GB RAM offer was not rejected for 24GB laptop");
  }
});

// 9. GPU mismatch rejection
test("9. GPU mismatch rejection", () => {
  const gpu4050Offer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Victus 15 24GB RAM 512GB SSD RTX 4050 6GB",
  })!;
  const eval4050 = matchOfferToProduct(gpu4050Offer, targetLaptop);
  if (eval4050.isMatch) {
    throw new Error("RTX 4050 GPU offer was not rejected for RTX 3050 laptop");
  }

  const gpuIntegratedOffer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Victus 15 24GB RAM 512GB SSD Intel Iris Xe Integrated",
  })!;
  const evalIntegrated = matchOfferToProduct(gpuIntegratedOffer, targetLaptop);
  if (evalIntegrated.isMatch) {
    throw new Error("Integrated GPU offer was not rejected for NVIDIA dedicated laptop");
  }
});

// 10. Model mismatch rejection
test("10. Model mismatch rejection", () => {
  const omenOffer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Omen Gaming Laptop Intel Core 5 24GB RAM 512GB SSD RTX 3050",
  })!;
  const evalOmen = matchOfferToProduct(omenOffer, targetLaptop);
  if (evalOmen.isMatch) {
    throw new Error("HP Omen offer was not rejected for HP Victus laptop");
  }

  const pavilionOffer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    name: "HP Pavilion 15 Intel Core 5 24GB RAM 512GB SSD RTX 3050",
  })!;
  const evalPavilion = matchOfferToProduct(pavilionOffer, targetLaptop);
  if (evalPavilion.isMatch) {
    throw new Error("HP Pavilion offer was not rejected for HP Victus laptop");
  }
});

// 11. Valid in-stock offer → BUY_NOW
test("11. Valid in-stock offer → BUY_NOW", () => {
  const liveExact = normalizeQuickCommerceItem(REAL_FLIPKART_EXACT_PAYLOAD)!;
  const status = resolveRetailerOfferStatus(liveExact);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected BUY_NOW, got ${status.status}`);
  }
  if (!status.isClickable) throw new Error("Expected button to be clickable");
  if (!status.targetUrl?.startsWith("https://www.flipkart.com/")) {
    throw new Error("Target URL is not authentic Flipkart link");
  }
});

// 12. Out-of-stock offer → NOT_AVAILABLE
test("12. Out-of-stock offer → NOT_AVAILABLE", () => {
  const oosOffer = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    in_stock: false,
  })!;
  const status = resolveRetailerOfferStatus(oosOffer);
  if (status.status !== "NOT_AVAILABLE") {
    throw new Error(`Expected NOT_AVAILABLE, got ${status.status}`);
  }
  if (status.isClickable) throw new Error("OOS button should not be clickable");
});

// 13. No valid offer → safe unavailable state
test("13. No valid offer → safe unavailable state", () => {
  const status = resolveRetailerOfferStatus(null);
  if (status.status !== "COMING_SOON") {
    throw new Error(`Expected COMING_SOON, got ${status.status}`);
  }
  if (status.isClickable) throw new Error("Unavailable state should not be clickable");
});

// 14. No mock offers
test("14. No mock offers", () => {
  const mockOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    source: "mock",
    isMock: true,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const validated = validateRetailerOffers([mockOffer], targetLaptop);
  if (validated.length > 0) {
    throw new Error("Mock offer leaked through validateRetailerOffers");
  }
  const status = resolveRetailerOfferStatus(mockOffer);
  if (status.status !== "COMING_SOON") {
    throw new Error("Mock offer did not resolve to COMING_SOON");
  }
});

// 15. Valid URL requirement
test("15. Valid URL requirement", () => {
  // Direct invalid URL rejected by validator
  const invalidDirectOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "ftp://unsafe-link.com",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };
  const val = validateRetailerOffer(invalidDirectOffer, targetLaptop);
  if (val.isValid) {
    throw new Error("Invalid ftp: protocol URL was not rejected by validator");
  }

  // Normalizer strips invalid URL to null
  const normalizedFtp = normalizeQuickCommerceItem({
    ...REAL_FLIPKART_EXACT_PAYLOAD,
    deeplink: "ftp://unsafe-link.com",
  })!;
  if (normalizedFtp.productUrl !== null) {
    throw new Error("Normalizer failed to strip non-http URL to null");
  }
  const statusNullUrl = resolveRetailerOfferStatus(normalizedFtp);
  if (statusNullUrl.status === "BUY_NOW") {
    throw new Error("Offer with null/stripped URL unexpectedly resolved to BUY_NOW");
  }
});

// 16. API key protection
test("16. API key protection", () => {
  const cfg = getQuickCommerceConfig();
  const apiKey = cfg.apiKey || "";
  const queries = buildQuickCommerceSearchQueries(targetLaptop);
  queries.forEach((q) => {
    if (apiKey && q.includes(apiKey)) {
      throw new Error("API Key leaked inside generated search query string");
    }
  });
  const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_EXACT_PAYLOAD)!;
  const str = JSON.stringify(normalized);
  if (apiKey && str.includes(apiKey)) {
    throw new Error("API Key leaked inside normalized offer object");
  }
});

// 17. Mobile-safe UI assumptions
test("17. Mobile-safe UI assumptions", () => {
  const whereToBuyCode = fs.readFileSync(
    path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"),
    "utf-8"
  );
  if (!whereToBuyCode.includes("w-full sm:w-auto")) {
    throw new Error("WhereToBuy action button does not include responsive 'w-full sm:w-auto'");
  }
  if (!whereToBuyCode.includes("flex-col sm:flex-row")) {
    throw new Error("WhereToBuy layout does not include responsive 'flex-col sm:flex-row'");
  }
  if (whereToBuyCode.includes("w-[400px]") || whereToBuyCode.includes("w-[500px]")) {
    throw new Error("Hardcoded pixel width detected in WhereToBuy");
  }
});

// -----------------------------------------------------------------------------
// STEP 10: REAL API TEST (Minimal test against Amazon and Flipkart)
// -----------------------------------------------------------------------------
async function runRealApiTest() {
  console.log("\n==================================================");
  console.log("STEP 10: REAL MULTI-QUERY API TEST (Amazon & Flipkart)");
  console.log("==================================================");

  const config = getQuickCommerceConfig();
  const queries = buildQuickCommerceSearchQueries(targetLaptop);
  console.log(`Generated Query Variants (${queries.length}):`);
  queries.forEach((q, i) => console.log(`  ${i + 1}. "${q}"`));

  const platforms = ["Amazon", "Flipkart"];
  const platformReports: Record<string, any> = {};

  for (const platform of platforms) {
    console.log(`\n--- Testing Platform: ${platform} ---`);
    let queriesAttempted = 0;
    const resultsPerQuery: { query: string; count: number }[] = [];
    const uniqueCandidatesMap = new Map<string, RawQuickCommerceProduct>();
    let exactMatchesCount = 0;
    let firstValidOffer: RetailerOffer | null = null;
    const rejectionReasons: string[] = [];

    if (config.isConfigured) {
      for (const q of queries) {
        queriesAttempted++;
        try {
          const rawItems = (await QuickCommerceAdapter.searchProducts!(q, {
            platform,
            limit: 5,
          })) as RawQuickCommerceProduct[];

          resultsPerQuery.push({ query: q, count: rawItems.length });

          for (const item of rawItems) {
            const idKey = String(item.id || item.deeplink || item.name || "");
            if (!uniqueCandidatesMap.has(idKey)) {
              uniqueCandidatesMap.set(idKey, item);

              const normalized = normalizeQuickCommerceItem(item);
              if (normalized) {
                const match = matchOfferToProduct(normalized, targetLaptop);
                if (match.isMatch) {
                  const val = validateRetailerOffer(normalized, targetLaptop);
                  if (val.isValid && val.offer) {
                    exactMatchesCount++;
                    if (!firstValidOffer) firstValidOffer = val.offer;
                  }
                } else {
                  rejectionReasons.push(`${item.name}: ${match.reasons.join(", ")}`);
                }
              }
            }
          }

          // Early stop condition: Stop querying platform once exact match is found
          if (exactMatchesCount > 0) {
            console.log(`  [Early Stop] Exact match found for ${platform} on query #${queriesAttempted}`);
            break;
          }
        } catch (err: any) {
          resultsPerQuery.push({ query: q, count: 0 });
          rejectionReasons.push(`API note: ${err.message}`);
        }
      }
    }

    platformReports[platform] = {
      queriesAttempted,
      resultsPerQuery,
      totalUniqueCandidates: uniqueCandidatesMap.size,
      exactMatchesCount,
      firstValidOffer: firstValidOffer ? firstValidOffer.retailerName : "None",
      rejectionReasons: rejectionReasons.slice(0, 3),
    };

    console.log(`  Queries attempted : ${queriesAttempted} (max ${MAX_QUERIES_PER_PLATFORM})`);
    console.log(`  Results per query : ${JSON.stringify(resultsPerQuery)}`);
    console.log(`  Unique candidates : ${uniqueCandidatesMap.size}`);
    console.log(`  Exact matches     : ${exactMatchesCount}`);
    console.log(`  First valid offer : ${firstValidOffer ? `₹${firstValidOffer.price}` : "None"}`);
  }

  console.log("\n==================================================");
  console.log(`PHASE 27C AUTOMATED TESTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRealApiTest();
