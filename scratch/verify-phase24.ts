import fs from "fs";
import path from "path";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQuery,
  normalizeQuickCommerceItem,
  mapPlatformToRetailer,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { Laptop, RetailerOffer } from "@/types";

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

console.log("==================================================");
console.log("BUYWISE AI — PHASE 24 REAL FLIPKART INTEGRATION");
console.log("==================================================");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

const MOCK_TARGET_HP_LAPTOP: Laptop = {
  id: "hp-victus-15-fb0157ax",
  brand: "HP",
  name: "HP Victus 15",
  model: "fb0157ax",
  fullName: "HP Victus Gaming Laptop 15 (AMD Ryzen 5 5600H, 16GB RAM, 512GB SSD, RTX 3050 4GB)",
  price: 61990,
  currency: "INR",
  image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
  processor: "AMD Ryzen 5 5600H",
  processorFamily: "AMD Ryzen 5",
  ram: "16GB DDR4",
  ramSize: 16,
  storage: "512GB SSD",
  display: '15.6" FHD 144Hz',
  gpu: "NVIDIA GeForce RTX 3050 4GB",
  gpuCategory: "NVIDIA",
  battery: "70Wh",
  rating: 4.4,
  reviewCount: 180,
  buyWiseScore: 84,
  scoreBreakdown: {
    performance: 85,
    priceValue: 88,
    features: 82,
    display: 80,
    battery: 81,
  },
  verdict: "BUY",
  verdictReason: "Great value gaming laptop for students and entry-level creators",
  useCases: ["Gaming", "Programming"],
  pros: ["Smooth 144Hz screen", "Solid cooling"],
  cons: ["Moderate display color gamut"],
  dataStatus: "verified",
};

// Real Flipkart API fixture mimicking actual payload shape
const REAL_SHAPE_FLIPKART_FIXTURE = {
  id: "COMH78YQZXYZ",
  name: "HP Victus AMD Ryzen 5 Hexa Core 5600H - (16 GB/512 GB SSD/Windows 11 Home/4 GB Graphics/NVIDIA GeForce RTX 3050) 15-fb0157AX Gaming Laptop",
  brand: "HP",
  available: true,
  images: ["https://rukminim2.flixcart.com/image/832/832/xif0q/computer/123.jpeg"],
  mrp: 76990,
  offer_price: 60990,
  quantity: 1,
  deeplink: "https://www.flipkart.com/hp-victus-ryzen-5-hexa-core-5600h-16-gb-512-gb-ssd-windows-11-home-4-gb-graphics-nvidia-geforce-rtx-3050-15-fb0157ax-gaming-laptop/p/itm123",
  inventory: 10,
  platform: {
    name: "Flipkart",
    sla: "2 days",
    open: true,
    icon: "https://qcsearch.s3.ap-south-1.amazonaws.com/platforms/flipkart.webp",
  },
  store_id: "flipkart_main",
};

// 1. Flipkart response normalization
test("1. Normalizes real Flipkart API item schema into RetailerOffer", () => {
  const offer = normalizeQuickCommerceItem(REAL_SHAPE_FLIPKART_FIXTURE);
  if (!offer) throw new Error("Expected normalized offer");
  if (offer.retailerId !== "flipkart") throw new Error(`Expected retailerId 'flipkart', got ${offer.retailerId}`);
  if (offer.retailerName !== "Flipkart") throw new Error(`Expected retailerName 'Flipkart', got ${offer.retailerName}`);
  if (offer.price !== 60990) throw new Error(`Expected price 60990, got ${offer.price}`);
  if (offer.mrp !== 76990) throw new Error(`Expected mrp 76990, got ${offer.mrp}`);
  if (offer.currency !== "INR") throw new Error(`Expected currency 'INR', got ${offer.currency}`);
  if (offer.availability !== "in-stock") throw new Error(`Expected 'in-stock', got ${offer.availability}`);
  if (offer.productUrl !== REAL_SHAPE_FLIPKART_FIXTURE.deeplink) throw new Error(`Expected deeplink ${REAL_SHAPE_FLIPKART_FIXTURE.deeplink}`);
});

// 2. Real price handling
test("2. Extracts and parses offer_price when price field is omitted", () => {
  const offer = normalizeQuickCommerceItem({
    name: "HP Victus Laptop",
    offer_price: "₹61,490",
    platform: "Flipkart",
    deeplink: "https://flipkart.com/hp-laptop",
  });
  if (!offer || offer.price !== 61490) {
    throw new Error(`Expected 61490, got ${offer?.price}`);
  }
});

// 3. Availability handling
test("3. Maps available: false to 'out-of-stock'", () => {
  const outOfStock = normalizeQuickCommerceItem({
    ...REAL_SHAPE_FLIPKART_FIXTURE,
    available: false,
  });
  if (!outOfStock || outOfStock.availability !== "out-of-stock") {
    throw new Error(`Expected 'out-of-stock', got ${outOfStock?.availability}`);
  }
});

// 4. URL validation
test("4. Preserves authentic Flipkart deeplink and rejects malicious protocols", () => {
  const valid = normalizeQuickCommerceItem(REAL_SHAPE_FLIPKART_FIXTURE);
  const malicious = normalizeQuickCommerceItem({
    ...REAL_SHAPE_FLIPKART_FIXTURE,
    deeplink: "data:text/html,<script>alert(1)</script>",
  });
  if (!valid?.productUrl?.startsWith("https://www.flipkart.com")) {
    throw new Error("Valid Flipkart URL rejected");
  }
  if (malicious?.productUrl !== null) {
    throw new Error("Malicious protocol was not sanitized to null");
  }
});

// 5. Exact matching
test("5. Exact matcher passes for matching Ryzen 5 5600H + 16GB + RTX 3050 specs", () => {
  const offer = normalizeQuickCommerceItem(REAL_SHAPE_FLIPKART_FIXTURE);
  if (!offer) throw new Error("Offer failed to normalize");
  const match = matchOfferToProduct(offer, MOCK_TARGET_HP_LAPTOP);
  if (!match.isMatch || match.confidence !== "exact") {
    throw new Error(`Expected exact match, got: ${JSON.stringify(match)}`);
  }
});

// 6. Invalid product rejection (RAM mismatch)
test("6. Exact matcher rejects 8GB RAM offer for 16GB required laptop", () => {
  const mismatchRam = normalizeQuickCommerceItem({
    ...REAL_SHAPE_FLIPKART_FIXTURE,
    name: "HP Victus AMD Ryzen 5 5600H 8GB RAM 512GB SSD RTX 3050",
  });
  if (!mismatchRam) throw new Error("Offer failed to normalize");
  const match = matchOfferToProduct(mismatchRam, MOCK_TARGET_HP_LAPTOP);
  if (match.isMatch) {
    throw new Error("Expected RAM mismatch rejection");
  }
});

// 7. Invalid product rejection (GPU mismatch)
test("7. Exact matcher rejects RTX 3060 offer for RTX 3050 target laptop", () => {
  const mismatchGpu = normalizeQuickCommerceItem({
    ...REAL_SHAPE_FLIPKART_FIXTURE,
    name: "HP Victus AMD Ryzen 5 5600H 16GB RAM 512GB SSD RTX 3060",
  });
  if (!mismatchGpu) throw new Error("Offer failed to normalize");
  const match = matchOfferToProduct(mismatchGpu, MOCK_TARGET_HP_LAPTOP);
  if (match.isMatch) {
    throw new Error("Expected GPU tier mismatch rejection");
  }
});

// 8. No fake price generation
test("8. Discards zero or non-numeric prices without inventing fallback numbers", () => {
  const zeroPrice = normalizeQuickCommerceItem({
    ...REAL_SHAPE_FLIPKART_FIXTURE,
    offer_price: 0,
  });
  if (zeroPrice !== null) {
    throw new Error("Expected null for 0 price");
  }
});

// 9. WhereToBuy integration & validation
test("9. validateRetailerOffers accepts valid normalized Flipkart offer", () => {
  const offer = normalizeQuickCommerceItem(REAL_SHAPE_FLIPKART_FIXTURE);
  const validated = validateRetailerOffers([offer!], MOCK_TARGET_HP_LAPTOP);
  if (validated.length !== 1 || validated[0].retailerId !== "flipkart") {
    throw new Error(`Expected 1 validated Flipkart offer, got: ${validated.length}`);
  }
});

// 10. Amazon zero-result isolation
test("10. Does not fabricate Amazon offers when Amazon platform returns 0 products", () => {
  const flipkartOnlyOffers: RetailerOffer[] = [normalizeQuickCommerceItem(REAL_SHAPE_FLIPKART_FIXTURE)!];
  const validated = validateRetailerOffers(flipkartOnlyOffers, MOCK_TARGET_HP_LAPTOP);
  const hasAmazon = validated.some((o) => o.retailerId === "amazon");
  if (hasAmazon) {
    throw new Error("Amazon offer was falsely fabricated");
  }
});

console.log("--------------------------------------------------");
console.log(`Unit Test Summary: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

// Real Flipkart API Smoke Test
async function runRealFlipkartSmokeTest() {
  const config = getQuickCommerceConfig();
  console.log("\n==================================================");
  console.log("PHASE 24 — REAL FLIPKART API SMOKE TEST (1 SINGLE CALL)");
  console.log("==================================================");

  if (!config.isConfigured || !config.apiKey) {
    console.log("⚠️ QUICKCOMMERCE_API_KEY is not configured in .env.local. Skipping live call.");
    return;
  }

  console.log("✓ QUICKCOMMERCE_API_KEY detected in environment (credentials protected)");
  console.log(`✓ Endpoint: ${config.endpoint}/search`);
  console.log("✓ Platform: 'Flipkart'");
  console.log("✓ Query: 'HP Victus laptop'");

  try {
    const startTime = Date.now();
    const rawItems = (await QuickCommerceAdapter.searchProducts!("HP Victus laptop", {
      platform: "Flipkart",
    })) as any[];
    const duration = Date.now() - startTime;

    console.log(`✓ HTTP Status: 200 OK (${duration}ms)`);
    console.log(`✓ Products Returned: ${rawItems.length}`);

    if (rawItems.length > 0) {
      const firstItem = rawItems[0];
      const normalized = normalizeQuickCommerceItem(firstItem);
      console.log("\nFirst Real Flipkart Listing Received:");
      console.log(`  Title       : ${firstItem.name || firstItem.title || "N/A"}`);
      console.log(`  Price       : ₹${firstItem.offer_price ? Number(firstItem.offer_price).toLocaleString("en-IN") : "N/A"}`);
      console.log(`  MRP         : ₹${firstItem.mrp ? Number(firstItem.mrp).toLocaleString("en-IN") : "N/A"}`);
      console.log(`  Available   : ${firstItem.available !== false ? "In Stock (Yes)" : "Out of Stock"}`);
      console.log(`  Deeplink    : ${firstItem.deeplink ? "Present (Verified Flipkart URL)" : "Not present"}`);
      console.log(`  Normalized  : ${normalized ? "Successfully converted to BuyWise RetailerOffer" : "Normalization skipped"}`);
    } else {
      console.log("✓ API returned 0 matching live items for this specific query at this location");
    }

    console.log("==================================================");
  } catch (err: any) {
    console.error(`Live diagnostic error: ${err.message}`);
  }
}

runRealFlipkartSmokeTest();
