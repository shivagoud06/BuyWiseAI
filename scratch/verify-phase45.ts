import assert from "assert";
import fs from "fs";
import path from "path";
import {
  retailerProvider,
  resolveRetailerOfferStatus,
  getRetailerOfferState,
  validateRetailerOffer,
  normalizeRetailerOffer,
  ALL_RETAILER_ADAPTERS,
  ALL_AFFILIATE_ADAPTERS,
  convertProductUrlToAffiliateUrl,
  getAffiliateConfig,
  EbayAdapter,
  AmazonAdapter,
  FlipkartAdapter,
  CuelinksAffiliateAdapter,
  RETAILER_REGISTRY,
} from "../src/services/retailers";
import { RetailerOffer, Laptop } from "../src/types";
import { LAPTOPS } from "../src/data/laptops";

console.log("==================================================");
console.log("PHASE 45 VERIFICATION: RETAILER OFFER ARCHITECTURE");
console.log("==================================================\n");

const sampleLaptop: Laptop = LAPTOPS[0];

// ----------------------------------------------------
// 1. Valid verified LIVE offer displays BUY NOW
// ----------------------------------------------------
console.log("[TEST 1] Valid verified LIVE offer displays BUY NOW...");
const validLiveOffer: RetailerOffer = {
  retailerId: "amazon",
  retailerName: "Amazon India",
  retailer: "Amazon India",
  productId: sampleLaptop.id,
  price: 31990,
  currency: "INR",
  availability: "in-stock",
  productUrl: "https://www.amazon.in/dp/B0CX9W969B",
  affiliateUrl: "https://www.amazon.in/dp/B0CX9W969B?tag=buywiseai06-21",
  seller: "Appario Retail",
  lastVerified: "2026-08-20",
  lastUpdated: "2026-08-20",
  isVerified: true,
  affiliateEligible: true,
  source: "official_api",
  matchedSku: sampleLaptop.sku,
  matchedModel: sampleLaptop.model,
};

const valResult = validateRetailerOffer(validLiveOffer, sampleLaptop);
assert.strictEqual(valResult.isValid, true, "Valid offer should pass schema & match validation");
assert.strictEqual(valResult.offer?.isVerified, true, "Validated offer must have isVerified = true");

const status1 = resolveRetailerOfferStatus(valResult.offer);
assert.strictEqual(status1.status, "BUY_NOW", "Valid in-stock verified offer must resolve to BUY_NOW");
assert.strictEqual(status1.state, "LIVE", "Valid in-stock verified offer must have state LIVE");
assert.strictEqual(status1.isClickable, true, "Valid in-stock verified offer must be clickable");
assert.strictEqual(status1.buttonLabel, "BUY NOW →", "Button label must be 'BUY NOW →'");
assert(status1.targetUrl?.includes("amazon.in"), "Target URL must be authentic Amazon URL");
console.log("✓ Valid verified LIVE offer correctly displays 'BUY NOW →' (state: LIVE)");

// ----------------------------------------------------
// 2. Unverified offer does not display BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 2] Unverified / Mock offer does not display BUY NOW...");
const unverifiedMockOffer: RetailerOffer = {
  ...validLiveOffer,
  isMock: true,
  source: "mock",
  isVerified: false,
};

const status2 = resolveRetailerOfferStatus(unverifiedMockOffer);
assert.notStrictEqual(status2.status, "BUY_NOW", "Unverified/mock offer must NOT display BUY NOW");
assert.strictEqual(status2.isClickable, false, "Unverified/mock offer must NOT be clickable");

const invalidPriceOffer = {
  ...validLiveOffer,
  price: 0,
};
const valResultInvalid = validateRetailerOffer(invalidPriceOffer, sampleLaptop);
assert.strictEqual(valResultInvalid.isValid, false, "Zero or negative price must fail validation");
const status2b = resolveRetailerOfferStatus(valResultInvalid.offer);
assert.notStrictEqual(status2b.status, "BUY_NOW", "Invalid price offer must NOT display BUY NOW");
console.log("✓ Unverified, mock, and invalid offers do NOT display BUY NOW");

// ----------------------------------------------------
// 3. Missing affiliate/product URL does not display BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 3] Missing product/affiliate URL does not display BUY NOW...");
const missingUrlOffer: RetailerOffer = {
  ...validLiveOffer,
  productUrl: null,
  affiliateUrl: null,
};

const status3 = resolveRetailerOfferStatus(missingUrlOffer);
assert.notStrictEqual(status3.status, "BUY_NOW", "Offer with no URL must NOT display BUY NOW");
assert.strictEqual(status3.isClickable, false, "Offer with no URL must NOT be clickable");
assert.strictEqual(status3.status, "COMING_SOON", "Offer with no URL should resolve to COMING_SOON");
console.log("✓ Missing URL offers do NOT display BUY NOW (resolve to COMING_SOON)");

// ----------------------------------------------------
// 4. Unavailable (out-of-stock) offer does not display BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 4] Unavailable (out-of-stock) offer does not display BUY NOW...");
const outOfStockOffer: RetailerOffer = {
  ...validLiveOffer,
  availability: "out-of-stock",
};

const status4 = resolveRetailerOfferStatus(outOfStockOffer);
assert.strictEqual(status4.status, "NOT_AVAILABLE", "Out of stock offer must resolve to NOT_AVAILABLE");
assert.strictEqual(status4.state, "UNAVAILABLE", "Out of stock offer must have state UNAVAILABLE");
assert.strictEqual(status4.isClickable, false, "Out of stock offer must NOT be clickable");
assert.strictEqual(status4.buttonLabel, "NOT AVAILABLE", "Button label must be 'NOT AVAILABLE'");
console.log("✓ Out-of-stock offer does NOT display BUY NOW (displays disabled 'NOT AVAILABLE')");

// ----------------------------------------------------
// 5. Credentials never reach client
// ----------------------------------------------------
console.log("\n[TEST 5] Verifying credentials never reach client bundles...");
const clientFiles = [
  "src/components/laptops/WhereToBuy.tsx",
  "src/components/laptops/LaptopCard.tsx",
  "src/app/laptops/[id]/LaptopClientDetails.tsx",
  "src/components/advisor/AdvisorResults.tsx",
  "src/app/compare/page.tsx",
];

clientFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(__dirname, "..", file), "utf-8");
  assert(!content.includes("process.env.CUELINKS_API_KEY"), `${file} must not reference CUELINKS_API_KEY`);
  assert(!content.includes("process.env.EBAY_CLIENT_SECRET"), `${file} must not reference EBAY_CLIENT_SECRET`);
  assert(!content.includes("NEXT_PUBLIC_CUELINKS"), `${file} must not reference NEXT_PUBLIC_CUELINKS`);
  assert(!content.includes("NEXT_PUBLIC_EBAY_SECRET"), `${file} must not reference NEXT_PUBLIC_EBAY_SECRET`);
});

const config = getAffiliateConfig();
assert(!("apiKey" in config), "AffiliateSystemConfig must not expose API secrets");
console.log("✓ Client isolation verified. No API keys or server credentials accessible client-side.");

// ----------------------------------------------------
// 6. Existing retailer logic remains intact & Cuelinks future flow ready
// ----------------------------------------------------
console.log("\n[TEST 6] Verifying existing retailer logic, Cuelinks adapter, and provider interface...");
assert(ALL_RETAILER_ADAPTERS.length >= 8, `Expected at least 8 retailer adapters, found ${ALL_RETAILER_ADAPTERS.length}`);
assert(ALL_AFFILIATE_ADAPTERS.length >= 3, `Expected at least 3 affiliate adapters, found ${ALL_AFFILIATE_ADAPTERS.length}`);

// Provider interface methods
assert(typeof retailerProvider.searchOffers === "function", "retailerProvider.searchOffers must exist");
assert(typeof retailerProvider.getOffer === "function", "retailerProvider.getOffer must exist");
assert(typeof retailerProvider.validateOffer === "function", "retailerProvider.validateOffer must exist");

// Cuelinks Adapter Architecture
assert.strictEqual(CuelinksAffiliateAdapter.id, "cuelinks", "Cuelinks adapter must be registered");
assert.strictEqual(typeof CuelinksAffiliateAdapter.isConfigured, "function", "Cuelinks isConfigured must be a function");
assert.strictEqual(typeof CuelinksAffiliateAdapter.convertProductUrlToAffiliateUrl, "function", "Cuelinks convertProductUrlToAffiliateUrl must be a function");

// eBay Adapter integrity
assert.strictEqual(EbayAdapter.id, "ebay", "EbayAdapter must exist");
assert.strictEqual(EbayAdapter.dataSourceType, "api", "EbayAdapter dataSourceType must be api");

// Flipkart Adapter integrity (no fake live offers)
assert.strictEqual(FlipkartAdapter.isLiveApiConnected, false, "FlipkartAdapter must remain un-faked while approval pending");

console.log("✓ Existing retailer adapters, provider interface, and Cuelinks architecture intact.");

console.log("\n==================================================");
console.log("ALL PHASE 45 TESTS PASSED SUCCESSFULLY! ✓");
console.log("==================================================");
