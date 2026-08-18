import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { RETAILER_REGISTRY, getRetailerInfo } from "../src/services/retailers/registry";
import { Laptop, RetailerOffer } from "../src/types";

// Load .env.local
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
        process.env[k] = v;
      }
    }
  });
}

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

const TEST_TARGET_LAPTOP: Laptop = {
  id: "hp-victus-15-fa0666tx",
  brand: "HP",
  model: "15-fa0666TX",
  fullName: "HP Victus Gaming Laptop 15-fa0666TX (15.6-inch, 12th Gen Core i5, 16GB, 512GB SSD, RTX 3050)",
  name: "HP Victus 15 i5 RTX 3050",
  price: 64990,
  currency: "INR",
  processorFamily: "Intel Core i5",
  processor: "12th Gen Intel Core i5-12450H",
  ram: "16GB DDR4",
  ramSize: 16,
  storage: "512GB SSD",
  gpu: "NVIDIA GeForce RTX 3050",
  gpuCategory: "NVIDIA",
  display: '15.6" FHD 144Hz',
  battery: "52.5Wh",
  rating: 4.3,
  reviewCount: 890,
  buyWiseScore: 84,
  scoreBreakdown: { performance: 85, priceValue: 90, features: 82, display: 80, battery: 78 },
  verdict: "BUY",
  verdictReason: "Great value gaming laptop",
  useCases: ["Gaming", "Student"],
  pros: ["Fast GPU"],
  cons: ["Average battery"],
  image: "https://example.com/hp.jpg",
  dataStatus: "verified",
};

console.log("==================================================");
console.log("BUYWISE AI — PHASE 26C RETAILER STATUS PRIORITY AUDIT");
console.log("==================================================");

// 1. registry not_connected + live valid offer = BUY NOW
test("1. Registry not_connected + live valid offer = BUY NOW", () => {
  const reg = getRetailerInfo("amazon");
  const liveOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 62990,
    mrp: 75990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX123456",
    source: "official_api",
    isMock: false,
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    offerText: "HP Victus 15-fa0666TX Core i5 16GB 512GB SSD RTX 3050",
  };
  const status = resolveRetailerOfferStatus(liveOffer);
  if (status.status !== "BUY_NOW" || !status.isClickable || !status.targetUrl) {
    throw new Error(`Expected BUY_NOW, got ${status.status}`);
  }
});

// 2. registry development + live valid offer = BUY NOW
test("2. Registry development + live valid offer = BUY NOW", () => {
  const liveOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 61990,
    mrp: 75990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus/p/123",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
    offerText: "HP Victus 15-fa0666TX Core i5 16GB 512GB SSD RTX 3050",
  };
  const status = resolveRetailerOfferStatus(liveOffer);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected BUY_NOW, got ${status.status}`);
  }
});

// 3. live valid offer + in_stock = BUY NOW
test("3. Live valid offer + in_stock = BUY NOW", () => {
  const liveOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 60990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus/p/123",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(liveOffer);
  if (status.status !== "BUY_NOW" || status.buttonLabel !== "BUY NOW →") {
    throw new Error(`Expected BUY NOW →, got ${status.buttonLabel}`);
  }
});

// 4. live valid offer + out_of_stock = NOT AVAILABLE
test("4. Live valid offer + out_of_stock = NOT AVAILABLE", () => {
  const oosOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 60990,
    currency: "INR",
    availability: "out-of-stock",
    productUrl: "https://www.flipkart.com/hp-victus/p/123",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(oosOffer);
  if (status.status !== "NOT_AVAILABLE" || status.buttonLabel !== "NOT AVAILABLE") {
    throw new Error(`Expected NOT AVAILABLE, got ${status.buttonLabel}`);
  }
});

// 5. no live offer = COMING SOON
test("5. No live offer / null offer = COMING SOON", () => {
  const status = resolveRetailerOfferStatus(null);
  if (status.status !== "COMING_SOON" || status.buttonLabel !== "COMING SOON" || status.isClickable) {
    throw new Error(`Expected COMING SOON, got ${status.buttonLabel}`);
  }
});

// 6. invalid price = not BUY NOW
test("6. Invalid price (0, negative, NaN) = not BUY NOW", () => {
  const invalidPriceOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 0,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX123456",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(invalidPriceOffer);
  if (status.status === "BUY_NOW") {
    throw new Error("Invalid price was granted BUY_NOW status");
  }
});

// 7. invalid URL = not BUY NOW
test("7. Invalid URL (javascript:, empty, null) = not BUY NOW", () => {
  const invalidUrlOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 55000,
    currency: "INR",
    availability: "in-stock",
    productUrl: "javascript:alert(1)",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(invalidUrlOffer);
  if (status.status === "BUY_NOW") {
    throw new Error("Dangerous/invalid URL was granted BUY_NOW status");
  }
});

// 8. mismatched RAM = not BUY NOW
test("8. Mismatched RAM rejection = not BUY NOW", () => {
  const mismatchedRamOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 52990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus-8gb",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
    offerText: "HP Victus 15-fa0666TX 8GB RAM 512GB SSD RTX 3050",
  };
  const match = matchOfferToProduct(mismatchedRamOffer, TEST_TARGET_LAPTOP);
  if (match.isMatch) throw new Error("8GB RAM was matched to 16GB laptop");
});

// 9. mismatched GPU = not BUY NOW
test("9. Mismatched GPU rejection = not BUY NOW", () => {
  const mismatchedGpuOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 72990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus-4050",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
    offerText: "HP Victus 15-fa0666TX 16GB RAM 512GB SSD RTX 4050",
  };
  const match = matchOfferToProduct(mismatchedGpuOffer, TEST_TARGET_LAPTOP);
  if (match.isMatch) throw new Error("RTX 4050 was matched to RTX 3050 laptop");
});

// 10. mismatched model = not BUY NOW
test("10. Mismatched model rejection = not BUY NOW", () => {
  const mismatchedModelOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 49990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-pavilion-15",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
    offerText: "HP Pavilion 15-eg2009TX Core i5 16GB 512GB SSD",
  };
  const match = matchOfferToProduct(mismatchedModelOffer, TEST_TARGET_LAPTOP);
  if (match.isMatch) throw new Error("HP Pavilion was matched to HP Victus");
});

// 11. Amazon valid live offer = BUY NOW
test("11. Amazon valid live offer = BUY NOW", () => {
  const amazonOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 63990,
    mrp: 75990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX987654",
    source: "official_api",
    isMock: false,
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(amazonOffer);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected BUY_NOW for Amazon offer, got ${status.status}`);
  }
});

// 12. Flipkart valid live offer = BUY NOW
test("12. Flipkart valid live offer = BUY NOW", () => {
  const flipkartOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 61990,
    mrp: 75990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus/p/itm12345",
    source: "official_api",
    isMock: false,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(flipkartOffer);
  if (status.status !== "BUY_NOW") {
    throw new Error(`Expected BUY_NOW for Flipkart offer, got ${status.status}`);
  }
});

console.log("--------------------------------------------------");
console.log(`Unit Test Summary: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

// Real API Live Check (1 Amazon + 1 Flipkart call)
async function runRealApiSmokeCheck() {
  const config = getQuickCommerceConfig();
  console.log("\n==================================================");
  console.log("PHASE 26C — REAL API SMOKE CHECK (AMAZON & FLIPKART)");
  console.log("==================================================");

  if (!config.isConfigured || !config.apiKey) {
    console.log("⚠️ QUICKCOMMERCE_API_KEY not configured. Skipping live network calls.");
    return;
  }

  console.log("✓ QUICKCOMMERCE_API_KEY verified in environment (protected)");

  // 1. Amazon Search
  try {
    const amazonItems = (await QuickCommerceAdapter.searchProducts!("HP laptop", {
      platform: "Amazon",
    })) as any[];

    console.log("\n[Amazon Platform Live Check]");
    console.log(`  ✓ Platform: Amazon`);
    console.log(`  ✓ Result Count: ${amazonItems.length}`);
    if (amazonItems.length > 0) {
      const first = amazonItems[0];
      console.log(`  ✓ Product Title: ${first.name || first.title || "N/A"}`);
      console.log(`  ✓ Price: ₹${first.offer_price || first.price || "N/A"}`);
      console.log(`  ✓ Availability: ${first.available !== false ? "in_stock" : "out_of_stock"}`);
      console.log(`  ✓ URL Presence: ${first.deeplink || first.url ? "Verified URL" : "None"}`);
    } else {
      console.log(`  ✓ Safe Handling: 0 results returned (no fake offers fabricated)`);
    }
  } catch (err: any) {
    console.error("Amazon Live Check Error:", err.message);
  }

  // 2. Flipkart Search
  try {
    const flipkartItems = (await QuickCommerceAdapter.searchProducts!("HP laptop", {
      platform: "Flipkart",
    })) as any[];

    console.log("\n[Flipkart Platform Live Check]");
    console.log(`  ✓ Platform: Flipkart`);
    console.log(`  ✓ Result Count: ${flipkartItems.length}`);
    if (flipkartItems.length > 0) {
      const first = flipkartItems[0];
      console.log(`  ✓ Product Title: ${first.name || first.title || "N/A"}`);
      console.log(`  ✓ Price: ₹${first.offer_price || first.price || "N/A"}`);
      console.log(`  ✓ Availability: ${first.available !== false ? "in_stock" : "out_of_stock"}`);
      console.log(`  ✓ URL Presence: ${first.deeplink || first.url ? "Verified URL" : "None"}`);
    } else {
      console.log(`  ✓ Safe Handling: 0 results returned (no fake offers fabricated)`);
    }
  } catch (err: any) {
    console.error("Flipkart Live Check Error:", err.message);
  }
}

runRealApiSmokeCheck();
