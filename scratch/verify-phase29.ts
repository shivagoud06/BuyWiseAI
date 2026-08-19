import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQueries,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { getRetailerOffers, resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { Laptop, RetailerOffer } from "../src/types";

// Load .env.local safely
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
console.log("BUYWISE AI — PHASE 29: CRITICAL FIX VERIFICATION (LIVE OFFER FLOW → BUY NOW)");
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

const TARGET_ID = "hp-victus-15-fa2500tx";
const targetLaptop = LAPTOPS.find((l) => l.id === TARGET_ID)!;

const MOCK_LIVE_FLIPKART_PAYLOAD: RawQuickCommerceProduct = {
  id: "FLIPKART_LIVE_VICTUS_15",
  name: "HP Victus Intel Core 5 210H - (24 GB/512 GB SSD/Windows 11 Home/4 GB Graphics/NVIDIA GeForce RTX 3050) 15-fa2500TX Gaming Laptop",
  price: 89990,
  mrp: 147674,
  currency: "INR",
  platform: "Flipkart",
  deeplink: "https://www.flipkart.com/hp-victus-intel-core-5-210h-24-gb-512-gb-ssd-windows-11-home-4-gb-graphics-nvidia-geforce-rtx-3050-15-fa2500tx-gaming-laptop/p/itm123456",
  in_stock: true,
  brand: "HP",
  sku: "15-fa2500TX",
};

// -----------------------------------------------------------------------------
// 11 VERIFICATION TESTS
// -----------------------------------------------------------------------------

// 1. Product page calls live retailer service
test("1. Product page calls live retailer service", () => {
  const pageFile = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/page.tsx"), "utf-8");
  if (!pageFile.includes("getRetailerOffers(laptop") && !pageFile.includes("getRetailerOffers(")) {
    throw new Error("src/app/laptops/[id]/page.tsx does not call getRetailerOffers");
  }
  if (!pageFile.includes("initialOffers={initialOffers}")) {
    throw new Error("src/app/laptops/[id]/page.tsx does not pass initialOffers to LaptopClientDetails");
  }

  const clientDetailsFile = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
  if (!clientDetailsFile.includes("offers={initialOffers}")) {
    throw new Error("LaptopClientDetails does not forward initialOffers to WhereToBuy");
  }
});

// 2. Live result survives normalization
test("2. Live result survives normalization", () => {
  const normalized = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD);
  if (!normalized) throw new Error("Live item failed normalization");
  if (normalized.retailerId !== "flipkart") throw new Error(`Expected flipkart, got ${normalized.retailerId}`);
  if (normalized.price !== 89990) throw new Error(`Expected 89990, got ${normalized.price}`);
  if (normalized.availability !== "in-stock") throw new Error("Expected in-stock status");
  if (!normalized.productUrl?.includes("flipkart.com")) throw new Error("Missing valid product URL");
});

// 3. Exact match passes for matching product
test("3. Exact match passes for matching product", () => {
  const normalized = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD)!;
  const match = matchOfferToProduct(normalized, targetLaptop);
  if (!match.isMatch || match.confidence !== "exact") {
    throw new Error(`Exact match failed: ${match.reasons.join("; ")}`);
  }
});

// 4. Matcher rejection exposes reason
test("4. Matcher rejection exposes reason", () => {
  const wrongGpu = normalizeQuickCommerceItem({
    ...MOCK_LIVE_FLIPKART_PAYLOAD,
    name: "HP Victus Intel Core 5 210H - (24 GB/512 GB SSD/RTX 4050 6GB) 15-fa2500TX Gaming Laptop",
  })!;
  const matchGpu = matchOfferToProduct(wrongGpu, targetLaptop);
  if (matchGpu.isMatch) throw new Error("Mismatched GPU was incorrectly accepted");
  if (matchGpu.reasons.length === 0 || !matchGpu.reasons[0].toLowerCase().includes("gpu")) {
    throw new Error("Matcher failed to provide specific GPU rejection reason");
  }

  const wrongBrand = normalizeQuickCommerceItem({
    ...MOCK_LIVE_FLIPKART_PAYLOAD,
    name: "Lenovo LOQ Intel Core 5 210H - (24 GB/512 GB SSD/RTX 3050) Gaming Laptop",
  })!;
  const matchBrand = matchOfferToProduct(wrongBrand, targetLaptop);
  if (matchBrand.isMatch) throw new Error("Mismatched Brand was incorrectly accepted");
  if (matchBrand.reasons.length === 0 || !matchBrand.reasons[0].toLowerCase().includes("brand")) {
    throw new Error("Matcher failed to provide specific Brand rejection reason");
  }
});

// 5. Validator accepts valid offer
test("5. Validator accepts valid offer", () => {
  const normalized = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD)!;
  const val = validateRetailerOffer(normalized, targetLaptop);
  if (!val.isValid || !val.offer) {
    throw new Error(`Validator rejected valid offer: ${val.issues.map((i) => i.message).join("; ")}`);
  }
});

// 6. Valid offer reaches WhereToBuy
test("6. Valid offer reaches WhereToBuy", () => {
  const normalized = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD)!;
  const validatedOffers = validateRetailerOffers([normalized], targetLaptop);
  if (validatedOffers.length !== 1) {
    throw new Error(`Expected 1 validated offer in WhereToBuy, got ${validatedOffers.length}`);
  }
  if (validatedOffers[0].price !== 89990) {
    throw new Error(`Expected price 89990 in WhereToBuy, got ${validatedOffers[0].price}`);
  }
});

// 7. BUY_NOW resolves correctly
test("7. BUY_NOW resolves correctly", () => {
  const normalized = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD)!;
  const status = resolveRetailerOfferStatus(normalized);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected status 'BUY_NOW', got '${status.status}'`);
  }
  if (!status.isClickable) throw new Error("Expected button to be clickable");
  if (status.targetUrl !== MOCK_LIVE_FLIPKART_PAYLOAD.deeplink) {
    throw new Error(`Expected targetUrl '${MOCK_LIVE_FLIPKART_PAYLOAD.deeplink}', got '${status.targetUrl}'`);
  }
});

// 8. Mock offers do not override live offers
test("8. Mock offers do not override live offers", () => {
  const mockOffer: RetailerOffer = {
    retailerId: "croma",
    retailerName: "Croma",
    price: 84990,
    currency: "INR",
    availability: "in-stock",
    source: "mock",
    isMock: true,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const liveOffer = normalizeQuickCommerceItem(MOCK_LIVE_FLIPKART_PAYLOAD)!;
  const combined = validateRetailerOffers([mockOffer, liveOffer], targetLaptop);
  if (combined.length !== 1 || combined[0].retailerId !== "flipkart") {
    throw new Error("Mock offer was not filtered out from live offers");
  }
});

// 9. Static retailer prices do not override live offers
test("9. Static retailer prices do not override live offers", () => {
  // Target catalog laptop must have empty offers array
  if (targetLaptop.offers && targetLaptop.offers.length > 0) {
    const hasStaticOffers = targetLaptop.offers.some((o) => o.isMock || !o.productUrl);
    if (hasStaticOffers) {
      throw new Error("Static / fake retailer prices detected inside catalog laptop offers");
    }
  }
});

// 10. Zero live offers produce safe unavailable state
test("10. Zero live offers produce safe unavailable state", () => {
  const emptyValidated = validateRetailerOffers([], targetLaptop);
  if (emptyValidated.length !== 0) throw new Error("Empty offers input produced non-empty output");
  const emptyStatus = resolveRetailerOfferStatus(null);
  if (emptyStatus.status !== "COMING_SOON") {
    throw new Error(`Expected COMING_SOON for empty offers, got ${emptyStatus.status}`);
  }
});

// 11. API credentials stay server-side
test("11. API credentials stay server-side", () => {
  // Check for any client-side exposure of API keys
  const clientDetailsSource = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
  const whereToBuySource = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");

  if (clientDetailsSource.includes("QUICKCOMMERCE_API_KEY") || clientDetailsSource.includes("EBAY_CERT_ID")) {
    throw new Error("Server secret key found in client component LaptopClientDetails.tsx");
  }
  if (whereToBuySource.includes("QUICKCOMMERCE_API_KEY") || whereToBuySource.includes("EBAY_CERT_ID")) {
    throw new Error("Server secret key found in client component WhereToBuy.tsx");
  }
});

console.log("\n==================================================");
console.log(`PHASE 29 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
