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
  RETAILER_REGISTRY,
} from "../src/services/retailers";
import { RetailerOffer, Laptop } from "../src/types";
import { LAPTOPS } from "../src/data/laptops";

console.log("==================================================");
console.log("PHASE 45A VERIFICATION: RETAILER OFFER ARCHITECTURE");
console.log("==================================================\n");

const sampleLaptop: Laptop = LAPTOPS[0];

// ----------------------------------------------------
// 1. Valid LIVE offer can render BUY NOW
// ----------------------------------------------------
console.log("[TEST 1] Valid LIVE offer resolution to BUY NOW...");
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

const validationRes1 = validateRetailerOffer(validLiveOffer, sampleLaptop);
assert.strictEqual(validationRes1.isValid, true, "Valid offer should pass validator");
assert.strictEqual(validationRes1.offer?.isVerified, true, "Validated offer should have isVerified = true");

const status1 = resolveRetailerOfferStatus(validationRes1.offer);
assert.strictEqual(status1.status, "BUY_NOW", "Valid in-stock offer must resolve to BUY_NOW");
assert.strictEqual(status1.state, "LIVE", "Valid in-stock offer must have state LIVE");
assert.strictEqual(status1.isClickable, true, "Valid in-stock offer must be clickable");
assert(status1.targetUrl?.includes("amazon.in"), "Target URL must be authentic Amazon URL");
console.log("✓ Valid LIVE offer correctly yields state 'LIVE' and button 'BUY NOW →'");

// ----------------------------------------------------
// 2. Unavailable offer cannot render BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 2] Unavailable (out-of-stock) offer resolution...");
const outOfStockOffer: RetailerOffer = {
  ...validLiveOffer,
  availability: "out-of-stock",
};

const status2 = resolveRetailerOfferStatus(outOfStockOffer);
assert.strictEqual(status2.status, "NOT_AVAILABLE", "Out of stock offer must resolve to NOT_AVAILABLE");
assert.strictEqual(status2.state, "UNAVAILABLE", "Out of stock offer must have state UNAVAILABLE");
assert.strictEqual(status2.isClickable, false, "Out of stock offer must NOT be clickable");
assert.strictEqual(status2.buttonLabel, "NOT AVAILABLE", "Button label must be 'NOT AVAILABLE'");
console.log("✓ Out-of-stock offer correctly yields state 'UNAVAILABLE' and disabled 'NOT AVAILABLE'");

// ----------------------------------------------------
// 3. Unverified offer cannot render BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 3] Unverified / Mock offer rejection...");
const mockOffer: RetailerOffer = {
  ...validLiveOffer,
  isMock: true,
  source: "mock",
};

const status3 = resolveRetailerOfferStatus(mockOffer);
assert.strictEqual(status3.status, "COMING_SOON", "Mock / unverified offer must NOT render BUY NOW");
assert.strictEqual(status3.isClickable, false, "Mock offer must NOT be clickable");

const invalidPriceOffer = {
  ...validLiveOffer,
  price: -100,
};
const valResultInvalidPrice = validateRetailerOffer(invalidPriceOffer, sampleLaptop);
assert.strictEqual(valResultInvalidPrice.isValid, false, "Negative price must fail validation");
const status3b = resolveRetailerOfferStatus(valResultInvalidPrice.offer);
assert.strictEqual(status3b.status, "COMING_SOON", "Invalid price offer must resolve to COMING_SOON");
console.log("✓ Unverified and invalid offers cannot render BUY NOW");

// ----------------------------------------------------
// 4. Missing URL cannot render BUY NOW
// ----------------------------------------------------
console.log("\n[TEST 4] Offer with missing URLs cannot render BUY NOW...");
const noUrlOffer: RetailerOffer = {
  ...validLiveOffer,
  productUrl: null,
  affiliateUrl: null,
};

const status4 = resolveRetailerOfferStatus(noUrlOffer);
assert.strictEqual(status4.status, "COMING_SOON", "Offer with no URL must resolve to COMING_SOON");
assert.strictEqual(status4.isClickable, false, "Offer with no URL must NOT be clickable");
console.log("✓ Offer with missing URLs correctly resolves to COMING_SOON without a BUY NOW button");

// ----------------------------------------------------
// 5. No secrets exposed in client code
// ----------------------------------------------------
console.log("\n[TEST 5] Verifying no secrets or API keys are exposed to client code...");
const clientFiles = [
  "src/components/laptops/WhereToBuy.tsx",
  "src/components/laptops/LaptopCard.tsx",
  "src/app/laptops/[id]/LaptopClientDetails.tsx",
];

clientFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(__dirname, "..", file), "utf-8");
  assert(!content.includes("process.env.CUELINKS_API_KEY"), `${file} must not read CUELINKS_API_KEY`);
  assert(!content.includes("process.env.EBAY_CLIENT_SECRET"), `${file} must not read EBAY_CLIENT_SECRET`);
  assert(!content.includes("NEXT_PUBLIC_CUELINKS"), `${file} must not reference NEXT_PUBLIC_CUELINKS`);
  assert(!content.includes("NEXT_PUBLIC_EBAY_SECRET"), `${file} must not reference NEXT_PUBLIC_EBAY_SECRET`);
});

const affiliateConfig = getAffiliateConfig();
assert(typeof affiliateConfig.isAmazonAffiliateConfigured === "boolean", "Affiliate config must return boolean flags");
assert(!("apiKey" in affiliateConfig), "AffiliateSystemConfig must not leak API keys");
console.log("✓ Secret isolation verified. No API keys or server credentials accessible client-side.");

// ----------------------------------------------------
// 6. Existing retailer logic remains intact
// ----------------------------------------------------
console.log("\n[TEST 6] Verifying existing retailer logic and provider interface...");
assert(ALL_RETAILER_ADAPTERS.length >= 8, `Expected at least 8 retailer adapters, found ${ALL_RETAILER_ADAPTERS.length}`);
assert(ALL_AFFILIATE_ADAPTERS.length >= 3, `Expected at least 3 affiliate adapters, found ${ALL_AFFILIATE_ADAPTERS.length}`);

// Test Provider interface
assert(typeof retailerProvider.searchOffers === "function", "retailerProvider.searchOffers must be a function");
assert(typeof retailerProvider.getOffer === "function", "retailerProvider.getOffer must be a function");
assert(typeof retailerProvider.validateOffer === "function", "retailerProvider.validateOffer must be a function");

// Test eBay Adapter exists and isolates sandbox
assert.strictEqual(EbayAdapter.id, "ebay", "EbayAdapter must exist");
assert.strictEqual(EbayAdapter.dataSourceType, "api", "EbayAdapter data source type must be api");
assert.strictEqual(EbayAdapter.source, "official_api", "EbayAdapter source must be official_api");

// Test Flipkart Adapter remains safe (no fake data)
assert.strictEqual(FlipkartAdapter.isLiveApiConnected, false, "FlipkartAdapter should not fake connection while pending");

// Test Registry
assert(RETAILER_REGISTRY.amazon !== undefined, "Amazon registry must exist");
assert(RETAILER_REGISTRY.flipkart !== undefined, "Flipkart registry must exist");
assert(RETAILER_REGISTRY.croma !== undefined, "Croma registry must exist");

console.log("✓ Existing retailer adapters, registries, and provider interfaces intact.");

console.log("\n==================================================");
console.log("ALL PHASE 45A TESTS PASSED SUCCESSFULLY! ✓");
console.log("==================================================");
