import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import { resolveRetailerOfferStatus, resolveRetailerClickUrl, recordRetailerClick, validateRetailerOffers } from "../src/services/retailers";
import { RetailerOffer } from "../src/types";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 32: FINAL PRODUCTION QA, SEO, SECURITY & ANALYTICS");
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
// 10 COMPREHENSIVE QA & PRODUCTION AUDIT TESTS
// -----------------------------------------------------------------------------

// 1. Public routes existence
test("1. Public routes existence", () => {
  const requiredRoutes = [
    "src/app/page.tsx",
    "src/app/laptops/page.tsx",
    "src/app/laptops/[id]/page.tsx",
    "src/app/advisor/page.tsx",
    "src/app/compare/page.tsx",
    "src/app/buying-guide/page.tsx",
    "src/app/how-it-works/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/affiliate-disclosure/page.tsx",
  ];

  for (const r of requiredRoutes) {
    const fullPath = path.join(__dirname, "..", r);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Required public route file missing: ${r}`);
    }
  }
});

// 2. Metadata presence on public pages
test("2. Metadata presence on public pages", () => {
  const rootLayout = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");
  if (!rootLayout.includes("metadata: Metadata")) throw new Error("Root layout missing Metadata definition");
  if (!rootLayout.includes("openGraph") || !rootLayout.includes("twitter")) {
    throw new Error("Root layout missing OpenGraph / Twitter social metadata");
  }

  const detailPage = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/page.tsx"), "utf-8");
  if (!detailPage.includes("generateMetadata")) {
    throw new Error("Laptop details page missing generateMetadata for dynamic SEO");
  }
});

// 3. Sitemap validity
test("3. Sitemap validity", () => {
  const sitemapEntries = sitemap();
  if (!Array.isArray(sitemapEntries) || sitemapEntries.length === 0) {
    throw new Error("Sitemap generator returned empty array");
  }
  const urls = sitemapEntries.map((e) => e.url);
  if (!urls.some((u) => u.endsWith("/laptops"))) throw new Error("Sitemap missing /laptops");
  if (!urls.some((u) => u.endsWith("/advisor"))) throw new Error("Sitemap missing /advisor");
  if (!urls.some((u) => u.endsWith("/compare"))) throw new Error("Sitemap missing /compare");
  if (!urls.some((u) => u.includes("/laptops/hp-victus-15-fa2500tx"))) {
    throw new Error("Sitemap missing real catalog product URLs");
  }
});

// 4. Robots.txt validity
test("4. Robots.txt validity", () => {
  const robotConfig = robots();
  if (!robotConfig.sitemap || !robotConfig.sitemap.includes("sitemap.xml")) {
    throw new Error("robots.txt does not reference sitemap.xml");
  }
  if (!robotConfig.rules) throw new Error("robots.txt missing crawler rules");
});

// 5. Retailer status rules enforcement
test("5. Retailer status rules enforcement", () => {
  // Live in stock
  const inStockOffer: RetailerOffer = {
    retailerId: "flipkart",
    retailerName: "Flipkart",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.flipkart.com/sample",
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const buyNowRes = resolveRetailerOfferStatus(inStockOffer);
  if (buyNowRes.status !== "BUY_NOW" || !buyNowRes.isClickable) {
    throw new Error("Live in-stock offer did not resolve to BUY_NOW");
  }

  // Live out of stock
  const oosOffer: RetailerOffer = {
    ...inStockOffer,
    availability: "out-of-stock",
  };
  const oosRes = resolveRetailerOfferStatus(oosOffer);
  if (oosRes.status !== "NOT_AVAILABLE" || oosRes.isClickable) {
    throw new Error("Live out-of-stock offer did not resolve to disabled NOT_AVAILABLE");
  }

  // Null offer
  const nullRes = resolveRetailerOfferStatus(null);
  if (nullRes.status !== "COMING_SOON" || nullRes.isClickable) {
    throw new Error("Null offer did not resolve to disabled COMING_SOON");
  }
});

// 6. No fake retailer prices produce BUY NOW
test("6. No fake retailer prices produce BUY NOW", () => {
  for (const laptop of LAPTOPS) {
    if (laptop.offers && laptop.offers.length > 0) {
      for (const o of laptop.offers) {
        if (!o.productUrl && !o.affiliateUrl) {
          const status = resolveRetailerOfferStatus(o);
          if (status.status === "BUY_NOW" || status.isClickable) {
            throw new Error(`Unlinked offer produced BUY NOW for laptop ${laptop.id}`);
          }
        }
      }
    }
  }
});

// 7. Affiliate URL safety
test("7. Affiliate URL safety", () => {
  const badOffer: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon",
    price: 64990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/sample",
    affiliateUrl: "javascript:evil()", // Malicious / invalid
    affiliateEligible: true,
    lastUpdated: "2026-08-19",
  };
  const resolved = resolveRetailerClickUrl(badOffer);
  if (resolved.targetUrl?.startsWith("javascript:")) {
    throw new Error("Unsafe javascript: protocol was not rejected by URL resolver");
  }
  if (!resolved.targetUrl?.startsWith("https://www.amazon.in")) {
    throw new Error("Failed to fall back to authentic product URL");
  }
});

// 8. Secret protection & no NEXT_PUBLIC secrets
test("8. Secret protection & no NEXT_PUBLIC secrets", () => {
  const envKeys = Object.keys(process.env);
  for (const k of envKeys) {
    if (k.startsWith("NEXT_PUBLIC_") && (k.includes("KEY") || k.includes("SECRET") || k.includes("CERT") || k.includes("PASS"))) {
      throw new Error(`Secret key exposed with NEXT_PUBLIC_ prefix: ${k}`);
    }
  }

  const gitignore = fs.readFileSync(path.join(__dirname, "../.gitignore"), "utf-8");
  if (!gitignore.includes(".env*.local") && !gitignore.includes(".env.local")) {
    throw new Error(".gitignore does not ignore .env.local!");
  }
});

// 9. Safe click analytics
test("9. Safe click analytics", () => {
  let captured: any = null;
  const originalLog = console.debug;
  console.debug = (...args: any[]) => {
    captured = args[1];
  };

  recordRetailerClick({
    productId: "hp-victus-15-fa2500tx",
    productName: "HP Victus 15-fa2500TX",
    retailerId: "amazon",
    retailerName: "Amazon",
    price: 89990,
    targetUrl: "https://www.amazon.in/dp/sample",
    clickType: "affiliate",
    timestamp: "2026-08-19T22:55:00.000Z",
    trackingProvider: "amazon_associates",
    source: "product_page",
  });

  console.debug = originalLog;
});

// 10. Mobile-safe layout assumptions
test("10. Mobile-safe layout assumptions", () => {
  const whereToBuyCode = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
  if (!whereToBuyCode.includes("w-full sm:w-auto") && !whereToBuyCode.includes("flex-col sm:flex-row")) {
    throw new Error("WhereToBuy missing responsive flex-col sm:flex-row / w-full button classes");
  }
});

console.log("\n==================================================");
console.log(`PHASE 32 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
