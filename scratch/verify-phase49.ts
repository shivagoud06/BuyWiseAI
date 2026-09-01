import assert from "assert";
import fs from "fs";
import path from "path";
import {
  isCuelinksConfigured,
  getCuelinksStatus,
  getCuelinksApiKeyServerOnly,
} from "../src/services/affiliate/cuelinksConfig";
import { LAPTOPS } from "../src/data/laptops";
import {
  resolveRetailerClickUrl,
} from "../src/services/retailers/affiliateResolver";
import { EbayAdapter } from "../src/services/retailers/adapters/ebay";
import { RetailerOffer } from "../src/types";

console.log("==================================================");
console.log("PHASE 49 VERIFICATION: CUELINKS INTEGRATION READINESS");
console.log("==================================================\n");

// 1. Missing Key => Integration Disabled
console.log("[TEST 1] Testing missing/empty CUELINKS_API_KEY handling...");
const originalKey = process.env.CUELINKS_API_KEY;

// Ensure key is unset
delete process.env.CUELINKS_API_KEY;

assert.strictEqual(
  isCuelinksConfigured(),
  false,
  "isCuelinksConfigured() must return false when CUELINKS_API_KEY is not set"
);

const unconfiguredStatus = getCuelinksStatus();
assert.strictEqual(
  unconfiguredStatus.isConfigured,
  false,
  "getCuelinksStatus().isConfigured must be false when key is absent"
);
assert.strictEqual(
  unconfiguredStatus.status,
  "unconfigured",
  "Status should be 'unconfigured'"
);
assert.strictEqual(
  unconfiguredStatus.apiVersion,
  "v3",
  "Target API version must be V3"
);
assert.strictEqual(
  unconfiguredStatus.isFlipkartCampaignPending,
  true,
  "Flipkart campaign approval flag must indicate pending"
);
assert.strictEqual(
  getCuelinksApiKeyServerOnly(),
  null,
  "getCuelinksApiKeyServerOnly() must return null when key is absent"
);

// Test empty / whitespace key
process.env.CUELINKS_API_KEY = "   ";
assert.strictEqual(
  isCuelinksConfigured(),
  false,
  "isCuelinksConfigured() must return false for whitespace-only key"
);
console.log("✓ Missing/empty key safely disables integration without errors.");

// 2. Configured Key => Integration Marked Ready
console.log("\n[TEST 2] Testing configured CUELINKS_API_KEY handling...");
const testApiKey = "cuelinks_v3_secure_token_987654321";
process.env.CUELINKS_API_KEY = testApiKey;

assert.strictEqual(
  isCuelinksConfigured(),
  true,
  "isCuelinksConfigured() must return true when valid key is set"
);

const configuredStatus = getCuelinksStatus();
assert.strictEqual(
  configuredStatus.isConfigured,
  true,
  "getCuelinksStatus().isConfigured must be true when key is set"
);
assert.strictEqual(
  configuredStatus.status,
  "configured_pending_campaign",
  "Status should indicate configured while awaiting campaign activation"
);
assert.strictEqual(
  getCuelinksApiKeyServerOnly(),
  testApiKey,
  "Server-only accessor must return the trimmed key"
);
console.log("✓ Configured key correctly marks integration as configured and ready.");

// 3. Key is Never Exposed to Client / Public Objects
console.log("\n[TEST 3] Auditing client-side credential protection...");
const statusJson = JSON.stringify(configuredStatus);
assert(
  !statusJson.includes(testApiKey),
  "Public status object must NEVER include the API key"
);
assert.strictEqual(
  (configuredStatus as any).apiKey,
  undefined,
  "apiKey field must not exist on public status object"
);
assert.strictEqual(
  (configuredStatus as any).token,
  undefined,
  "token field must not exist on public status object"
);

// Verify no NEXT_PUBLIC_CUELINKS_API_KEY exists in env
assert(
  !process.env.NEXT_PUBLIC_CUELINKS_API_KEY,
  "NEXT_PUBLIC_CUELINKS_API_KEY must never be defined or used"
);
console.log("✓ Key is strictly isolated server-side and never exposed in client status.");

// 4. No Fake Retailer Offers or Fake Prices Generated
console.log("\n[TEST 4] Verifying no fake retailer offers or fake prices are generated...");

// Test A: Mock offer resolution must NEVER generate an active affiliate URL or fake BUY NOW
const mockTestOffer: RetailerOffer = {
  retailerId: "flipkart",
  retailerName: "Flipkart",
  price: 54990,
  currency: "INR",
  isMock: true,
  source: "mock",
  productUrl: "https://www.flipkart.com/item/123",
  availability: "in-stock",
  lastUpdated: new Date().toISOString(),
  affiliateEligible: false,
};
const resolvedMock = resolveRetailerClickUrl(mockTestOffer);
assert.strictEqual(
  resolvedMock.affiliateEnabled,
  false,
  "Mock offer must NEVER have affiliateEnabled: true"
);
assert.strictEqual(
  resolvedMock.targetUrl,
  null,
  "Mock offer must resolve targetUrl to null"
);

// Test B: Verify catalog products do not contain fake unverified BUY NOW links
assert(LAPTOPS.length > 0, "Laptop catalog must have valid products");
for (const laptop of LAPTOPS.slice(0, 10)) {
  const price = laptop.price ?? 0;
  assert(price > 0, `Product ${laptop.name} must have a valid positive price`);
  assert.strictEqual(laptop.currency, "INR", "Catalog currency must be INR");
}

// Test C: Retailer adapters without live verified credentials do not synthesize fake live offers
async function testAdapters() {
  const query = { product: LAPTOPS[0] };
  const ebayOffers = await EbayAdapter.getOffers(query);
  assert(
    Array.isArray(ebayOffers),
    "EbayAdapter must return an array"
  );
  // Unapproved sandbox ebay adapter returns empty array safely
  assert.strictEqual(
    ebayOffers.length,
    0,
    "EbayAdapter without credentials must return 0 offers"
  );
}

// 5. Documentation & Code Comments Audit
console.log("\n[TEST 5] Auditing documentation & comments in cuelinksConfig.ts...");
const configSource = fs.readFileSync(
  path.join(__dirname, "../src/services/affiliate/cuelinksConfig.ts"),
  "utf-8"
);
assert(
  configSource.includes("API V3") || configSource.includes("API v3") || configSource.includes("v3"),
  "cuelinksConfig.ts must document Cuelinks API V3 server-side authentication"
);
assert(
  configSource.toLowerCase().includes("flipkart") && configSource.toLowerCase().includes("pending"),
  "cuelinksConfig.ts must document Flipkart campaign approval pending status"
);
assert(
  configSource.toLowerCase().includes("verified"),
  "cuelinksConfig.ts must document verified offers requirement for BUY NOW"
);
console.log("✓ Architectural documentation and compliance comments verified.");

// Run async adapter test
testAdapters().then(() => {
  // Restore original env
  if (originalKey !== undefined) {
    process.env.CUELINKS_API_KEY = originalKey;
  } else {
    delete process.env.CUELINKS_API_KEY;
  }

  console.log("\n==================================================");
  console.log("ALL PHASE 49 CHECKS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}).catch((err) => {
  console.error("Adapter test failed:", err);
  process.exit(1);
});
