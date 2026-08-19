import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQuery,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { findSmartSearchResults } from "../src/lib/smartSearch";
import { Laptop, RetailerOffer, FilterState } from "../src/types";

// Load environment variables safely
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
console.log("BUYWISE AI — PHASE 27B: REAL PRODUCT END-TO-END BUY NOW VERIFICATION");
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

// -----------------------------------------------------------------------------
// Real Product Definition & Fixtures
// -----------------------------------------------------------------------------
const TARGET_ID = "hp-victus-15-fa2500tx";
const targetLaptop = LAPTOPS.find((l) => l.id === TARGET_ID);

const REAL_FLIPKART_PAYLOAD: RawQuickCommerceProduct = {
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
// 15 AUTOMATED TESTS
// -----------------------------------------------------------------------------

// 1. Product exists in catalog
test("1. Product exists in catalog", () => {
  if (!targetLaptop) {
    throw new Error(`Catalog product '${TARGET_ID}' was not found in LAPTOPS catalog`);
  }
  if (targetLaptop.brand !== "HP") throw new Error(`Expected brand 'HP', got '${targetLaptop.brand}'`);
  if (!targetLaptop.model.toLowerCase().includes("15-fa2500tx")) {
    throw new Error(`Expected model to contain '15-fa2500TX', got '${targetLaptop.model}'`);
  }
  if (targetLaptop.ramSize !== 24) throw new Error(`Expected 24GB RAM, got ${targetLaptop.ramSize}GB`);
  if (targetLaptop.gpuCategory !== "NVIDIA") throw new Error(`Expected NVIDIA GPU category`);
  if (!targetLaptop.gpu.includes("3050")) throw new Error(`Expected RTX 3050 GPU, got '${targetLaptop.gpu}'`);
});

// 2. Product appears in catalog search
test("2. Product appears in catalog search", () => {
  const filterState: FilterState = {
    searchQuery: "HP Victus 15-fa2500tx",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  };
  const results = findSmartSearchResults(LAPTOPS, filterState);
  const found = results.exactMatches.some((l) => l.id === TARGET_ID) ||
                results.fallbackMatches.some((l) => l.id === TARGET_ID);
  if (!found) {
    throw new Error(`Search for 'HP Victus 15-fa2500tx' did not return '${TARGET_ID}'`);
  }
});

// 3. Product route exists
test("3. Product route exists", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const detailsPagePath = path.join(__dirname, "../src/app/laptops/[id]/page.tsx");
  if (!fs.existsSync(detailsPagePath)) {
    throw new Error("Laptops dynamic route src/app/laptops/[id]/page.tsx not found");
  }
});

// 4. Query generation is correct
test("4. Query generation is correct", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const query = buildQuickCommerceSearchQuery(targetLaptop);
  if (query !== "HP Victus 15-fa2500tx") {
    throw new Error(`Expected query 'HP Victus 15-fa2500tx', got '${query}'`);
  }
  if (query.toLowerCase().includes("hp hp")) {
    throw new Error("Query contains redundant brand prefix 'HP HP'");
  }
});

// 5. Real Flipkart payload normalizes
test("5. Real Flipkart payload normalizes", () => {
  const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_PAYLOAD);
  if (!normalized) throw new Error("Normalization returned null");
  if (normalized.retailerId !== "flipkart") throw new Error(`Expected retailerId 'flipkart', got '${normalized.retailerId}'`);
  if (normalized.price !== 89990) throw new Error(`Expected price 89990, got ${normalized.price}`);
  if (normalized.mrp !== 147674) throw new Error(`Expected MRP 147674, got ${normalized.mrp}`);
  if (normalized.availability !== "in-stock") throw new Error(`Expected 'in-stock', got '${normalized.availability}'`);
  if (!normalized.productUrl?.startsWith("https://www.flipkart.com/")) {
    throw new Error(`Expected valid Flipkart product URL, got '${normalized.productUrl}'`);
  }
  if (normalized.isMock) throw new Error("Offer was incorrectly flagged as mock");
});

// 6. Exact match passes for the correct configuration
test("6. Exact match passes for the correct configuration", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_PAYLOAD)!;
  const matchResult = matchOfferToProduct(normalized, targetLaptop);
  if (!matchResult.isMatch) {
    throw new Error(`Exact match failed: ${matchResult.reasons.join("; ")}`);
  }
  if (matchResult.confidence !== "exact") {
    throw new Error(`Expected exact confidence, got '${matchResult.confidence}'`);
  }
});

// 7. Wrong RAM is rejected
test("7. Wrong RAM is rejected", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const wrongRam16Payload: RawQuickCommerceProduct = {
    ...REAL_FLIPKART_PAYLOAD,
    name: "HP Victus Intel Core 5 210H - (16 GB/512 GB SSD/RTX 3050) 15-fa2500TX Gaming Laptop",
  };
  const wrongRam16Offer = normalizeQuickCommerceItem(wrongRam16Payload)!;
  const matchResult16 = matchOfferToProduct(wrongRam16Offer, targetLaptop);
  if (matchResult16.isMatch) {
    throw new Error("Wrong RAM (16GB) was incorrectly accepted for 24GB target laptop");
  }

  const wrongRam8Payload: RawQuickCommerceProduct = {
    ...REAL_FLIPKART_PAYLOAD,
    name: "HP Victus Intel Core 5 210H - (8 GB RAM/512 GB SSD/RTX 3050) 15-fa2500TX Gaming Laptop",
  };
  const wrongRam8Offer = normalizeQuickCommerceItem(wrongRam8Payload)!;
  const matchResult8 = matchOfferToProduct(wrongRam8Offer, targetLaptop);
  if (matchResult8.isMatch) {
    throw new Error("Wrong RAM (8GB) was incorrectly accepted for 24GB target laptop");
  }
});

// 8. Wrong GPU is rejected
test("8. Wrong GPU is rejected", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const wrongGpu4050Payload: RawQuickCommerceProduct = {
    ...REAL_FLIPKART_PAYLOAD,
    name: "HP Victus Intel Core 5 210H - (24 GB/512 GB SSD/RTX 4050 6GB) 15-fa2500TX Gaming Laptop",
  };
  const wrongGpu4050Offer = normalizeQuickCommerceItem(wrongGpu4050Payload)!;
  const matchResult4050 = matchOfferToProduct(wrongGpu4050Offer, targetLaptop);
  if (matchResult4050.isMatch) {
    throw new Error("Wrong GPU (RTX 4050) was incorrectly accepted for RTX 3050 target laptop");
  }
});

// 9. Invalid price rejected
test("9. Invalid price rejected", () => {
  const zeroPricePayload: RawQuickCommerceProduct = {
    ...REAL_FLIPKART_PAYLOAD,
    price: 0,
  };
  const normalizedZero = normalizeQuickCommerceItem(zeroPricePayload);
  if (normalizedZero !== null) {
    throw new Error("Zero price payload was not rejected during normalization");
  }

  if (targetLaptop) {
    const invalidPriceOffer: RetailerOffer = {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: -500,
      currency: "INR",
      availability: "in-stock",
      productUrl: "https://www.flipkart.com/hp-victus/p/123",
      affiliateEligible: true,
      lastUpdated: "2026-08-19",
      source: "official_api",
      isMock: false,
    };
    const validation = validateRetailerOffer(invalidPriceOffer, targetLaptop);
    if (validation.isValid) {
      throw new Error("Negative price offer was not rejected during validation");
    }
  }
});

// 10. Invalid URL rejected
test("10. Invalid URL rejected", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  const invalidUrlOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "javascript:alert(1)",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };
  const validation = validateRetailerOffer(invalidUrlOffer, targetLaptop);
  if (validation.isValid) {
    throw new Error("Unsafe javascript: URL was not rejected during validation");
  }
});

// 11. Exact in-stock offer resolves to BUY_NOW
test("11. Exact in-stock offer resolves to BUY_NOW", () => {
  const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_PAYLOAD)!;
  const status = resolveRetailerOfferStatus(normalized);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected status 'BUY_NOW', got '${status.status}'`);
  }
  if (!status.isClickable) throw new Error("Expected button to be clickable");
  if (!status.targetUrl || !status.targetUrl.startsWith("https://www.flipkart.com/")) {
    throw new Error(`Expected valid Flipkart targetUrl, got '${status.targetUrl}'`);
  }
});

// 12. Exact out-of-stock resolves to NOT_AVAILABLE
test("12. Exact out-of-stock resolves to NOT_AVAILABLE", () => {
  const outOfStockPayload: RawQuickCommerceProduct = {
    ...REAL_FLIPKART_PAYLOAD,
    in_stock: false,
  };
  const normalizedOos = normalizeQuickCommerceItem(outOfStockPayload)!;
  const status = resolveRetailerOfferStatus(normalizedOos);
  if (status.status !== "NOT_AVAILABLE") {
    throw new Error(`Expected status 'NOT_AVAILABLE', got '${status.status}'`);
  }
  if (status.isClickable) throw new Error("Expected out-of-stock button to not be clickable");
});

// 13. No live offer resolves to COMING_SOON
test("13. No live offer resolves to COMING_SOON", () => {
  const statusNull = resolveRetailerOfferStatus(null);
  if (statusNull.status !== "COMING_SOON") {
    throw new Error(`Expected status 'COMING_SOON' for null offer, got '${statusNull.status}'`);
  }

  const mockOffer: RetailerOffer = {
    retailerId: "croma",
    retailerName: "Croma",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: null,
    source: "mock",
    isMock: true,
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const statusMock = resolveRetailerOfferStatus(mockOffer);
  if (statusMock.status !== "COMING_SOON") {
    throw new Error(`Expected status 'COMING_SOON' for mock offer, got '${statusMock.status}'`);
  }
});

// 14. Unsupported/sample retailer has no fake price
test("14. Unsupported/sample retailer has no fake price", () => {
  if (!targetLaptop) throw new Error("Target laptop not found");
  // Ensure the target laptop in LAPTOPS catalog has no hardcoded sample offers leaked
  const laptopOffers = targetLaptop.offers || [];
  const hasMockPrices = laptopOffers.some((o) => o.isMock || o.source === "mock");
  if (hasMockPrices) {
    throw new Error("Sample / mock offers detected in catalog laptop entry");
  }

  // WhereToBuy validation layer filters out unvalidated offers
  const validated = validateRetailerOffers(laptopOffers, targetLaptop);
  if (validated.length > 0 && validated.some((o) => o.isMock)) {
    throw new Error("Mock offers leaked through validateRetailerOffers");
  }
});

// 15. Buy Now URL is the authentic retailer URL
test("15. Buy Now URL is the authentic retailer URL", () => {
  const normalized = normalizeQuickCommerceItem(REAL_FLIPKART_PAYLOAD)!;
  const status = resolveRetailerOfferStatus(normalized);
  if (status.targetUrl !== REAL_FLIPKART_PAYLOAD.deeplink) {
    throw new Error(`Expected authentic URL '${REAL_FLIPKART_PAYLOAD.deeplink}', got '${status.targetUrl}'`);
  }
});

// -----------------------------------------------------------------------------
// STEP 10: REAL LIVE API TEST (Without exposing secrets)
// -----------------------------------------------------------------------------
async function runRealApiTest() {
  console.log("\n==================================================");
  console.log("STEP 10: REAL FLIPKART API LIVE REQUEST TEST");
  console.log("==================================================");

  const config = getQuickCommerceConfig();
  const query = "HP Victus 15-fa2500tx";
  console.log(`Query: "${query}"`);
  console.log(`Platform: Flipkart`);
  console.log(`API Configured: ${config.isConfigured}`);

  let liveResultCount = 0;
  let liveTitle = "N/A";
  let livePrice = "N/A";
  let liveAvailability = "N/A";
  let liveUrlPresence = false;
  let liveExactMatch = false;

  if (config.isConfigured) {
    try {
      const liveResults = (await QuickCommerceAdapter.searchProducts!(query, { platform: "Flipkart", limit: 5 })) as RawQuickCommerceProduct[];
      liveResultCount = liveResults.length;
      console.log(`Live API Result Count: ${liveResultCount}`);

      if (liveResults.length > 0) {
        const topItem: RawQuickCommerceProduct = liveResults[0];
        liveTitle = topItem.name || topItem.title || "N/A";
        livePrice = `₹${topItem.price || topItem.offer_price || "N/A"}`;
        liveAvailability = topItem.in_stock ? "In Stock" : "Out of Stock";
        liveUrlPresence = Boolean(topItem.deeplink || topItem.url || topItem.product_url);

        const normalizedTop = normalizeQuickCommerceItem(topItem);
        if (normalizedTop && targetLaptop) {
          const matchTop = matchOfferToProduct(normalizedTop, targetLaptop);
          liveExactMatch = matchTop.isMatch;
        }
      }
    } catch (err: any) {
      console.log(`Live API Note: ${err.message}`);
    }
  }

  // Report the diagnostic findings cleanly
  console.log("\nLive API Execution Summary:");
  console.log(`- Result count      : ${liveResultCount}`);
  console.log(`- Returned title    : ${liveTitle}`);
  console.log(`- Price             : ${livePrice}`);
  console.log(`- Availability      : ${liveAvailability}`);
  console.log(`- URL presence      : ${liveUrlPresence}`);
  console.log(`- Exact-match result: ${liveExactMatch}`);

  console.log("\n==================================================");
  console.log(`PHASE 27B AUTOMATED TESTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRealApiTest();
