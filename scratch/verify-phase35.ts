import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  buildAmazonAffiliateUrl,
  isAmazonUrl,
  resolveRetailerClickUrl,
  getAffiliateConfig,
  isValidHttpUrl,
} from "../src/services/retailers/affiliateResolver";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { validateRetailerOffer } from "../src/services/retailers/validator";
import { RetailerOffer } from "../src/types";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 35: AMAZON ASSOCIATES AFFILIATE LINK ACTIVATION");
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
// TESTS
// -----------------------------------------------------------------------------

// 1. Valid Amazon URL recognition
test("1. Valid Amazon URL recognition", () => {
  const urls = [
    "https://www.amazon.in/dp/B0CX210H",
    "https://amazon.in/HP-Victus-Gaming-Laptop/dp/B0D12345",
    "https://www.amazon.com/dp/B09ABCDE",
    "https://amzn.to/3sample",
    "http://www.amazon.co.uk/dp/B07XYZ",
  ];
  for (const u of urls) {
    if (!isAmazonUrl(u)) {
      throw new Error(`Failed to recognize valid Amazon URL: ${u}`);
    }
  }
});

// 2. Affiliate tag added correctly
test("2. Affiliate tag added correctly", () => {
  const url = "https://www.amazon.in/dp/B0CX210H";
  const tagged = buildAmazonAffiliateUrl(url, "buywiseai06-21");
  const u = new URL(tagged);
  if (u.searchParams.get("tag") !== "buywiseai06-21") {
    throw new Error(`Expected tag=buywiseai06-21, got ${u.searchParams.get("tag")}`);
  }
  if (!tagged.startsWith("https://www.amazon.in/dp/B0CX210H")) {
    throw new Error(`Base path corrupted: ${tagged}`);
  }
});

// 3. Duplicate tag handling (replaces existing tag)
test("3. Duplicate tag handling", () => {
  const existingUrl = "https://www.amazon.in/dp/B0CX210H?tag=oldtag-20&ref=sample_ref";
  const tagged = buildAmazonAffiliateUrl(existingUrl, "buywiseai06-21");
  const u = new URL(tagged);
  if (u.searchParams.get("tag") !== "buywiseai06-21") {
    throw new Error(`Expected tag to be updated to buywiseai06-21, got ${u.searchParams.get("tag")}`);
  }
  if (u.searchParams.get("ref") !== "sample_ref") {
    throw new Error("Other query parameters were lost during tag replacement");
  }
  // Ensure no duplicate 'tag' keys
  const tagParams = u.searchParams.getAll("tag");
  if (tagParams.length !== 1) {
    throw new Error(`Expected exactly 1 tag parameter, found ${tagParams.length}`);
  }
});

// 4. Invalid URL rejection
test("4. Invalid URL rejection", () => {
  const unsafeUrls = [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox",
    "",
    "not-a-url",
  ];
  for (const u of unsafeUrls) {
    if (isValidHttpUrl(u)) {
      throw new Error(`isValidHttpUrl failed to reject unsafe URL: ${u}`);
    }
    const res = buildAmazonAffiliateUrl(u, "buywiseai06-21");
    if (res.startsWith("javascript:") || res.startsWith("data:")) {
      throw new Error(`buildAmazonAffiliateUrl failed to reject unsafe URL: ${u}`);
    }
  }
});

// 5. Non-Amazon URL unchanged
test("5. Non-Amazon URL unchanged", () => {
  const flipkartUrl = "https://www.flipkart.com/hp-victus-15/p/itm123";
  const cromaUrl = "https://www.croma.com/lenovo-ideapad-1/p/234";
  const relianceUrl = "https://www.reliancedigital.in/acer-aspire/p/345";

  if (buildAmazonAffiliateUrl(flipkartUrl, "buywiseai06-21") !== flipkartUrl) {
    throw new Error("buildAmazonAffiliateUrl modified a Flipkart URL!");
  }
  if (buildAmazonAffiliateUrl(cromaUrl, "buywiseai06-21") !== cromaUrl) {
    throw new Error("buildAmazonAffiliateUrl modified a Croma URL!");
  }
  if (buildAmazonAffiliateUrl(relianceUrl, "buywiseai06-21") !== relianceUrl) {
    throw new Error("buildAmazonAffiliateUrl modified a Reliance Digital URL!");
  }
});

// 6. No affiliate config fallback
test("6. No affiliate config fallback", () => {
  const cleanUrl = "https://www.amazon.in/dp/B0CX210H";
  const res = buildAmazonAffiliateUrl(cleanUrl, "");
  // When tag is empty string or unconfigured, falls back safely to original product URL or default tag
  if (!isValidHttpUrl(res)) {
    throw new Error("Fallback failed to return a valid URL");
  }
});

// 7. No fake offer generation from catalog reference price
test("7. No fake offer generation from catalog reference price", () => {
  const laptop = LAPTOPS[0];
  const nullOfferRes = resolveRetailerClickUrl(null);
  if (nullOfferRes.targetUrl !== null || nullOfferRes.clickType !== null) {
    throw new Error("resolveRetailerClickUrl generated a URL for null offer");
  }
  const status = resolveRetailerOfferStatus(null);
  if (status.status !== "COMING_SOON" || status.isClickable) {
    throw new Error("Missing offer produced clickable BUY NOW");
  }
});

// 8. BUY NOW requires a validated live offer
test("8. BUY NOW requires a validated live offer", () => {
  const validLiveAmazonOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX210H",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
    source: "official_api",
    isMock: false,
  };

  const validation = validateRetailerOffer(validLiveAmazonOffer);
  if (!validation.isValid) {
    throw new Error("Valid live Amazon offer failed validator schema checks");
  }

  const status = resolveRetailerOfferStatus(validLiveAmazonOffer);
  if (status.status !== "BUY_NOW" || !status.isClickable) {
    throw new Error("Valid live offer did not resolve to BUY_NOW");
  }
  if (!status.targetUrl?.includes("tag=buywiseai06-21")) {
    throw new Error(`Expected BUY NOW URL to include affiliate tag buywiseai06-21, got ${status.targetUrl}`);
  }
});

// 9. Associates ID stays server-side (no NEXT_PUBLIC_)
test("9. Associates ID stays server-side (no NEXT_PUBLIC_)", () => {
  if (process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_ID) {
    throw new Error("Amazon Associates ID exposed in NEXT_PUBLIC_ environment variable!");
  }
});

// 10. Default server config uses buywiseai06-21
test("10. Default server config uses buywiseai06-21", () => {
  const config = getAffiliateConfig();
  if (config.amazonAssociateTag !== "buywiseai06-21") {
    throw new Error(`Expected default Amazon Associate Tag 'buywiseai06-21', got '${config.amazonAssociateTag}'`);
  }
});

console.log("\n==================================================");
console.log(`PHASE 35 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
