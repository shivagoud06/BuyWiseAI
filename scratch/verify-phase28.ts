import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  EbayAdapter,
  getEbayConfig,
  getEbayAccessToken,
  buildEbaySearchQuery,
  normalizeEbayItem,
  EbayRawItemSummary,
} from "../src/services/retailers/adapters/ebay";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { Laptop, RetailerOffer } from "../src/types";

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
console.log("BUYWISE AI — PHASE 28: EBAY BROWSE API SANDBOX INTEGRATION");
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
// Test Target Product & Offline Mock Fixtures for Schema Verification
// -----------------------------------------------------------------------------
const TARGET_ID = "hp-victus-15-fa2500tx";
const targetLaptop = LAPTOPS.find((l) => l.id === TARGET_ID)!;

const MOCK_EBAY_EXACT_SUMMARY: EbayRawItemSummary = {
  itemId: "v1|123456789012|0",
  title: "HP Victus 15-fa2500TX 15.6 inch Intel Core 5 210H 24GB RAM 512GB SSD RTX 3050 Gaming Laptop",
  price: {
    value: "899.99",
    currency: "USD",
  },
  originalPrice: {
    value: "1099.99",
    currency: "USD",
  },
  itemWebUrl: "https://www.sandbox.ebay.com/itm/123456789012",
  itemAffiliateWebUrl: "https://rover.ebay.com/rover/1/711-53200-19255-0/1?mpre=https://www.sandbox.ebay.com/itm/123456789012",
  buyingOptions: ["FIXED_PRICE"],
  condition: "New",
  estimatedAvailabilities: [
    {
      estimatedAvailabilityStatus: "IN_STOCK",
      estimatedAvailableQuantity: 5,
    },
  ],
  shippingOptions: [
    {
      shippingCost: {
        value: "0.00",
        currency: "USD",
      },
      shippingCostType: "FREE",
    },
  ],
  mpn: "15-fa2500TX",
  itemLocation: {
    country: "US",
  },
};

// -----------------------------------------------------------------------------
// 12 AUTOMATED TESTS
// -----------------------------------------------------------------------------

// 1. Config environment reading
test("1. Config environment reading", () => {
  const config = getEbayConfig();
  if (typeof config.isConfigured !== "boolean") throw new Error("Expected boolean isConfigured");
  if (config.environment !== "sandbox" && config.environment !== "production") {
    throw new Error(`Unexpected environment: ${config.environment}`);
  }
  if (!config.oauthEndpoint.includes("ebay.com")) {
    throw new Error("Invalid OAuth endpoint URL");
  }
  if (!config.browseEndpoint.includes("ebay.com")) {
    throw new Error("Invalid Browse API endpoint URL");
  }
});

// 2. Credential security (Never expose to client or NEXT_PUBLIC_)
test("2. Credential security", () => {
  if (process.env.NEXT_PUBLIC_EBAY_APP_ID || process.env.NEXT_PUBLIC_EBAY_CERT_ID || process.env.NEXT_PUBLIC_EBAY_DEV_ID) {
    throw new Error("NEXT_PUBLIC_ prefix detected for eBay credentials! This exposes secrets to the browser.");
  }
  const config = getEbayConfig();
  const rawAppId = config.appId || "";
  const rawCert = config.certId || "";
  const query = buildEbaySearchQuery(targetLaptop);
  if (rawAppId && query.includes(rawAppId)) throw new Error("App ID leaked in search query");
  if (rawCert && query.includes(rawCert)) throw new Error("Cert ID leaked in search query");
});

// 3. Clean search query generation
test("3. Clean search query generation", () => {
  const query = buildEbaySearchQuery(targetLaptop);
  if (query !== "HP Victus 15-fa2500tx") {
    throw new Error(`Expected 'HP Victus 15-fa2500tx', got '${query}'`);
  }
  if (query.toLowerCase().includes("hp hp")) {
    throw new Error("Redundant brand prefix detected");
  }
});

// 4. Response normalization
test("4. Response normalization", () => {
  const normalized = normalizeEbayItem(MOCK_EBAY_EXACT_SUMMARY);
  if (!normalized) throw new Error("Normalization returned null");
  if (normalized.retailerId !== "ebay") throw new Error(`Expected retailerId 'ebay', got '${normalized.retailerId}'`);
  if (normalized.price !== 899.99) throw new Error(`Expected price 899.99, got ${normalized.price}`);
  if (normalized.mrp !== 1099.99) throw new Error(`Expected MRP 1099.99, got ${normalized.mrp}`);
  if (normalized.currency !== "USD") throw new Error(`Expected currency 'USD', got '${normalized.currency}'`);
  if (normalized.availability !== "in-stock") throw new Error(`Expected 'in-stock', got '${normalized.availability}'`);
  if (!normalized.productUrl?.includes("ebay.com")) throw new Error("Missing valid productUrl");
  if (normalized.isMock) throw new Error("Offer was incorrectly marked as mock");
  if (normalized.source !== "official_api") throw new Error("Expected source 'official_api'");
});

// 5. Shipping cost inclusion in total price
test("5. Shipping cost inclusion in total price", () => {
  const itemWithShipping: EbayRawItemSummary = {
    ...MOCK_EBAY_EXACT_SUMMARY,
    price: { value: "850.00", currency: "USD" },
    shippingOptions: [{ shippingCost: { value: "25.00", currency: "USD" } }],
  };
  const normalized = normalizeEbayItem(itemWithShipping);
  if (!normalized || normalized.price !== 875.00) {
    throw new Error(`Expected total price 875.00, got ${normalized?.price}`);
  }
});

// 6. Exact match passes for correct configuration
test("6. Exact match passes for correct configuration", () => {
  const offer = normalizeEbayItem(MOCK_EBAY_EXACT_SUMMARY)!;
  const matchResult = matchOfferToProduct(offer, targetLaptop);
  if (!matchResult.isMatch) {
    throw new Error(`Exact match failed: ${matchResult.reasons.join("; ")}`);
  }
  if (matchResult.confidence !== "exact") {
    throw new Error(`Expected confidence 'exact', got '${matchResult.confidence}'`);
  }
});

// 7. RAM mismatch rejection
test("7. RAM mismatch rejection", () => {
  const wrongRamItem: EbayRawItemSummary = {
    ...MOCK_EBAY_EXACT_SUMMARY,
    title: "HP Victus 15-fa2500TX Intel Core 5 16GB RAM 512GB SSD RTX 3050",
  };
  const offer = normalizeEbayItem(wrongRamItem)!;
  const matchResult = matchOfferToProduct(offer, targetLaptop);
  if (matchResult.isMatch) {
    throw new Error("16GB RAM offer was not rejected for 24GB laptop");
  }
});

// 8. GPU mismatch rejection
test("8. GPU mismatch rejection", () => {
  const wrongGpuItem: EbayRawItemSummary = {
    ...MOCK_EBAY_EXACT_SUMMARY,
    title: "HP Victus 15-fa2500TX Intel Core 5 24GB RAM 512GB SSD RTX 4050 6GB",
  };
  const offer = normalizeEbayItem(wrongGpuItem)!;
  const matchResult = matchOfferToProduct(offer, targetLaptop);
  if (matchResult.isMatch) {
    throw new Error("RTX 4050 GPU offer was not rejected for RTX 3050 laptop");
  }
});

// 9. Invalid price rejection
test("9. Invalid price rejection", () => {
  const zeroPriceItem: EbayRawItemSummary = {
    ...MOCK_EBAY_EXACT_SUMMARY,
    price: { value: "0.00", currency: "USD" },
  };
  const normalizedZero = normalizeEbayItem(zeroPriceItem);
  if (normalizedZero !== null) {
    throw new Error("Zero price item was not rejected during normalization");
  }
});

// 10. Invalid URL rejection
test("10. Invalid URL rejection", () => {
  const invalidUrlOffer: RetailerOffer = {
    retailerId: "ebay",
    retailerName: "eBay",
    price: 899.99,
    currency: "USD",
    availability: "in-stock",
    productUrl: "ftp://unsafe-link.com",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };
  const val = validateRetailerOffer(invalidUrlOffer, targetLaptop);
  if (val.isValid) {
    throw new Error("Invalid ftp URL was not rejected by validator");
  }
});

// 11. Retailer status resolution (BUY NOW vs NOT AVAILABLE vs COMING SOON)
test("11. Retailer status resolution", () => {
  const liveExact = normalizeEbayItem(MOCK_EBAY_EXACT_SUMMARY)!;
  const statusBuyNow = resolveRetailerOfferStatus(liveExact);
  if (statusBuyNow.status !== "BUY_NOW" || !statusBuyNow.isClickable || !statusBuyNow.targetUrl) {
    throw new Error(`Expected BUY_NOW, got ${statusBuyNow.status}`);
  }

  const oosItem: EbayRawItemSummary = {
    ...MOCK_EBAY_EXACT_SUMMARY,
    buyingOptions: ["OUT_OF_STOCK"],
    estimatedAvailabilities: [{ estimatedAvailabilityStatus: "OUT_OF_STOCK", estimatedAvailableQuantity: 0 }],
  };
  const oosOffer = normalizeEbayItem(oosItem)!;
  const statusOos = resolveRetailerOfferStatus(oosOffer);
  if (statusOos.status !== "NOT_AVAILABLE" || statusOos.isClickable) {
    throw new Error(`Expected NOT_AVAILABLE for out-of-stock offer, got ${statusOos.status}`);
  }

  const statusNull = resolveRetailerOfferStatus(null);
  if (statusNull.status !== "COMING_SOON") {
    throw new Error(`Expected COMING_SOON for null offer, got ${statusNull.status}`);
  }
});

// 12. No fake offer generation when unconfigured / empty
test("12. No fake offer generation when unconfigured / empty", () => {
  const validated = validateRetailerOffers([], targetLaptop);
  if (validated.length !== 0) {
    throw new Error("validateRetailerOffers generated fake offers on empty input");
  }
});

// -----------------------------------------------------------------------------
// STEP 10: REAL SANDBOX API TEST (Minimal test without logging credentials)
// -----------------------------------------------------------------------------
async function runRealApiTest() {
  console.log("\n==================================================");
  console.log("STEP 10: REAL EBAY SANDBOX API TEST");
  console.log("==================================================");

  const config = getEbayConfig();
  console.log(`Environment      : ${config.environment.toUpperCase()}`);
  console.log(`Configured       : ${config.isConfigured}`);
  console.log(`OAuth Endpoint   : ${config.oauthEndpoint}`);
  console.log(`Browse Endpoint  : ${config.browseEndpoint}`);

  let tokenSuccess = false;
  let searchResultCount = 0;
  let firstSafeTitle = "N/A";
  let firstSafePrice = "N/A";
  let isNormalized = false;
  let exactMatchResult = false;

  if (config.isConfigured) {
    try {
      console.log("\n[OAuth Token Flow]");
      const token = await getEbayAccessToken();
      tokenSuccess = Boolean(token);
      console.log(`OAuth Token Obtained: ${tokenSuccess}`);

      if (token) {
        console.log("\n[Browse API Search]");
        const query = buildEbaySearchQuery(targetLaptop);
        console.log(`Query: "${query}"`);
        let rawItems = (await EbayAdapter.searchProducts!(query, { limit: 5 })) as EbayRawItemSummary[];
        searchResultCount = rawItems.length;
        console.log(`Results Returned: ${searchResultCount}`);

        // If specific model has 0 sandbox results, try 1 minimal generic query to test sandbox Browse response
        if (searchResultCount === 0) {
          console.log("  (0 specific model listings found in sandbox environment; testing generic query 'laptop')...");
          rawItems = (await EbayAdapter.searchProducts!("laptop", { limit: 3 })) as EbayRawItemSummary[];
          searchResultCount = rawItems.length;
          console.log(`Generic Sandbox Results: ${searchResultCount}`);
        }

        if (rawItems.length > 0) {
          const first: EbayRawItemSummary = rawItems[0];
          firstSafeTitle = first.title || "N/A";
          firstSafePrice = `${first.price?.currency || "USD"} ${first.price?.value || "N/A"}`;
          console.log(`First Item Title : ${firstSafeTitle}`);
          console.log(`First Item Price : ${firstSafePrice}`);

          const normalized = normalizeEbayItem(first);
          if (normalized) {
            isNormalized = true;
            const match = matchOfferToProduct(normalized, targetLaptop);
            exactMatchResult = match.isMatch;
            console.log(`Normalized Price : $${normalized.price}`);
            console.log(`Exact Match Pass : ${exactMatchResult}`);
          }
        }
      }
    } catch (err: any) {
      console.log(`API Test Note: ${err.message}`);
    }
  } else {
    console.log("\n(eBay credentials not configured in local environment; offline unit tests validated)");
  }

  console.log("\n==================================================");
  console.log("EBAY SANDBOX EXECUTION SUMMARY");
  console.log("==================================================");
  console.log(`- OAuth Result       : ${tokenSuccess ? "SUCCESS" : config.isConfigured ? "FAILED" : "SKIPPED (No Credentials)"}`);
  console.log(`- Search Result Count: ${searchResultCount}`);
  console.log(`- First Product Title: ${firstSafeTitle}`);
  console.log(`- First Product Price: ${firstSafePrice}`);
  console.log(`- Normalization Pass : ${isNormalized}`);
  console.log(`- Exact Match Result : ${exactMatchResult}`);

  console.log("\n==================================================");
  console.log(`PHASE 28 AUTOMATED TESTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRealApiTest();
