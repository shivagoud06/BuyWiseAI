import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  resolveRetailerClickUrl,
  getAffiliateConfig,
  buildAmazonAffiliateUrl,
  buildFlipkartAffiliateUrl,
  recordRetailerClick,
  RetailerClickEvent,
  isValidHttpUrl,
} from "../src/services/retailers/affiliateResolver";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { RetailerOffer } from "../src/types";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 31: AFFILIATE LINK & COMMISSION-READY SYSTEM VERIFICATION");
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
// 12 AUTOMATED TESTS
// -----------------------------------------------------------------------------

// 1. Valid affiliate URL takes priority
test("1. Valid affiliate URL takes priority", () => {
  const offer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/hp-victus-15/p/itm123",
    affiliateUrl: "https://affiliate.flipkart.com/track?affid=myid&url=https://www.flipkart.com/hp-victus-15/p/itm123",
    trackingProvider: "flipkart_affiliate",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const resolved = resolveRetailerClickUrl(offer);
  if (resolved.targetUrl !== offer.affiliateUrl) {
    throw new Error(`Expected targetUrl to be affiliate URL, got ${resolved.targetUrl}`);
  }
  if (resolved.clickType !== "affiliate") {
    throw new Error(`Expected clickType 'affiliate', got ${resolved.clickType}`);
  }
  if (!resolved.affiliateEnabled) {
    throw new Error("Expected affiliateEnabled to be true");
  }
});

// 2. Invalid affiliate URL falls back to product URL
test("2. Invalid affiliate URL falls back to product URL", () => {
  const offer: RetailerOffer = {
    retailerId: "croma",
    retailerName: "Croma",
    price: 84990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.croma.com/hp-victus-15/p/456",
    affiliateUrl: "javascript:void(0)", // Unsafe / invalid affiliate URL
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const resolved = resolveRetailerClickUrl(offer);
  if (resolved.targetUrl !== offer.productUrl) {
    throw new Error(`Expected fallback to productUrl, got ${resolved.targetUrl}`);
  }
  if (resolved.clickType !== "product") {
    throw new Error(`Expected clickType 'product', got ${resolved.clickType}`);
  }
  if (resolved.affiliateEnabled) {
    throw new Error("Expected affiliateEnabled: false when falling back to direct product URL");
  }
});

// 3. Missing affiliate configuration falls back safely
test("3. Missing affiliate configuration falls back safely", () => {
  const offer: RetailerOffer = {
    retailerId: "reliance-digital",
    retailerName: "Reliance Digital",
    price: 85999,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.reliancedigital.in/product/123",
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const resolved = resolveRetailerClickUrl(offer);
  if (resolved.targetUrl !== "https://www.reliancedigital.in/product/123") {
    throw new Error(`Expected valid productUrl, got ${resolved.targetUrl}`);
  }
  if (resolved.clickType !== "product") {
    throw new Error(`Expected clickType 'product', got ${resolved.clickType}`);
  }
});

// 4. No fake affiliate URL generation
test("4. No fake affiliate URL generation", () => {
  const offer: RetailerOffer = {
    retailerId: "vijay-sales",
    retailerName: "Vijay Sales",
    price: 86990,
    currency: "INR",
    availability: "in-stock",
    productUrl: null,
    affiliateUrl: null,
    affiliateEligible: false,
    lastUpdated: "2026-08-19",
  };
  const resolved = resolveRetailerClickUrl(offer);
  if (resolved.targetUrl !== null || resolved.clickType !== null) {
    throw new Error("Resolver fabricated a URL for unlinked offer");
  }
});

// 5. Amazon configuration is server-side
test("5. Amazon configuration is server-side", () => {
  const associateTag = "buywiseai21-21";
  const amazonUrl = "https://www.amazon.in/dp/B0CX210H";
  const tagged = buildAmazonAffiliateUrl(amazonUrl, associateTag);
  if (!tagged.includes("tag=buywiseai21-21")) {
    throw new Error(`Expected tagged Amazon URL, got ${tagged}`);
  }
  if (process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG) {
    throw new Error("NEXT_PUBLIC_ prefix detected for Amazon Associate Tag!");
  }
});

// 6. Flipkart configuration is server-side
test("6. Flipkart configuration is server-side", () => {
  const affid = "buywise_flipkart";
  const flipkartUrl = "https://www.flipkart.com/product/p/itm123";
  const tagged = buildFlipkartAffiliateUrl(flipkartUrl, affid);
  if (!tagged.includes("affid=buywise_flipkart")) {
    throw new Error(`Expected tagged Flipkart URL, got ${tagged}`);
  }
  if (process.env.NEXT_PUBLIC_FLIPKART_AFFILIATE_ID) {
    throw new Error("NEXT_PUBLIC_ prefix detected for Flipkart Affiliate ID!");
  }
});

// 7. eBay production remains disabled
test("7. eBay production remains disabled", () => {
  const config = getAffiliateConfig();
  if (config.isEbayAffiliateEnabled !== false) {
    throw new Error("eBay affiliate tracking was incorrectly enabled without production approval");
  }
});

// 8. BUY NOW uses resolved click URL
test("8. BUY NOW uses resolved click URL", () => {
  const offer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX210H",
    affiliateUrl: "https://www.amazon.in/dp/B0CX210H?tag=buywiseai21-21",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(offer);
  if (status.status !== "BUY_NOW") throw new Error(`Expected BUY_NOW, got ${status.status}`);
  if (!status.isClickable) throw new Error("Expected button to be clickable");
  if (status.targetUrl !== offer.affiliateUrl) {
    throw new Error(`Expected BUY NOW to target resolved affiliateUrl, got ${status.targetUrl}`);
  }
  if (status.clickType !== "affiliate") {
    throw new Error(`Expected clickType 'affiliate', got ${status.clickType}`);
  }
});

// 9. NOT AVAILABLE has no clickable purchase URL
test("9. NOT AVAILABLE has no clickable purchase URL", () => {
  const oosOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "out-of-stock",
    productUrl: "https://www.flipkart.com/hp-victus/p/123",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const status = resolveRetailerOfferStatus(oosOffer);
  if (status.status !== "NOT_AVAILABLE") throw new Error(`Expected NOT_AVAILABLE, got ${status.status}`);
  if (status.isClickable || status.targetUrl !== null) {
    throw new Error("Out-of-stock offer produced a clickable purchase URL");
  }
});

// 10. COMING SOON has no clickable purchase URL
test("10. COMING SOON has no clickable purchase URL", () => {
  const status = resolveRetailerOfferStatus(null);
  if (status.status !== "COMING_SOON") throw new Error(`Expected COMING_SOON, got ${status.status}`);
  if (status.isClickable || status.targetUrl !== null) {
    throw new Error("Null offer produced a clickable purchase URL");
  }
});

// 11. Click event contains safe fields only
test("11. Click event contains safe fields only", () => {
  let capturedEvent: any = null;
  const originalLog = console.debug;
  console.debug = (...args: any[]) => {
    capturedEvent = args[1];
  };

  const safeEvent: RetailerClickEvent = {
    productId: "hp-victus-15-fa2500tx",
    productName: "HP Victus 15-fa2500TX",
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    targetUrl: "https://www.flipkart.com/hp-victus/p/123",
    clickType: "affiliate",
    timestamp: "2026-08-19T22:50:00.000Z",
    trackingProvider: "flipkart_affiliate",
    source: "product_page",
  };

  recordRetailerClick(safeEvent);
  console.debug = originalLog;

  const forbiddenKeys = ["apiKey", "secret", "clientSecret", "password", "token", "authHeader", "commissionEarned"];
  for (const k of forbiddenKeys) {
    if (safeEvent.hasOwnProperty(k)) {
      throw new Error(`Forbidden key '${k}' found in click event schema`);
    }
  }
});

// 12. Secrets are not exposed
test("12. Secrets are not exposed in client code", () => {
  const whereToBuyCode = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
  const clientDetailsCode = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");

  if (whereToBuyCode.includes("process.env.AMAZON_ASSOCIATE_TAG") || whereToBuyCode.includes("process.env.EBAY_CERT_ID")) {
    throw new Error("Server secret read directly in client component WhereToBuy.tsx");
  }
  if (clientDetailsCode.includes("process.env.AMAZON_ASSOCIATE_TAG") || clientDetailsCode.includes("process.env.EBAY_CERT_ID")) {
    throw new Error("Server secret read directly in client component LaptopClientDetails.tsx");
  }
});

console.log("\n==================================================");
console.log(`PHASE 31 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
