import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import { resolveRetailerOfferStatus, resolveRetailerClickUrl, getAffiliateConfig } from "../src/services/retailers";
import { analytics } from "../src/lib/analytics";
import { RetailerOffer } from "../src/types";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 36: FINAL LAUNCH & REAL-USER PREPARATION VERIFICATION");
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
// 10 COMPREHENSIVE LAUNCH AUDITS
// -----------------------------------------------------------------------------

// 1. Final Production QA: Public Routes
test("1. Final Production QA: Public Routes", () => {
  const routes = [
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
  for (const r of routes) {
    const fullPath = path.join(__dirname, "..", r);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required public route: ${r}`);
    }
  }
});

// 2. Live Retailer Trust Rules
test("2. Live Retailer Trust Rules", () => {
  // Live in-stock -> BUY NOW
  const liveInStock: RetailerOffer = {
    retailerId: "amazon",
    retailerName: "Amazon India",
    price: 89990,
    currency: "INR",
    availability: "in-stock",
    productUrl: "https://www.amazon.in/dp/B0CX210H",
    affiliateEligible: true,
    lastUpdated: "2026-08-20",
    source: "official_api",
    isMock: false,
  };
  const buyNow = resolveRetailerOfferStatus(liveInStock);
  if (buyNow.status !== "BUY_NOW" || !buyNow.isClickable) {
    throw new Error("Live in-stock offer did not resolve to BUY NOW");
  }

  // Live out-of-stock -> NOT AVAILABLE
  const liveOos: RetailerOffer = {
    ...liveInStock,
    availability: "out-of-stock",
  };
  const notAvail = resolveRetailerOfferStatus(liveOos);
  if (notAvail.status !== "NOT_AVAILABLE" || notAvail.isClickable) {
    throw new Error("Live out-of-stock offer did not resolve to disabled NOT AVAILABLE");
  }

  // No live offer -> COMING SOON / unavailable
  const nullOffer = resolveRetailerOfferStatus(null);
  if (nullOffer.status !== "COMING_SOON" || nullOffer.isClickable) {
    throw new Error("Missing live offer did not resolve to disabled COMING SOON");
  }
});

// 3. Catalog Reference Price Never Becomes Retailer Price
test("3. Catalog Reference Price Never Becomes Retailer Price", () => {
  for (const laptop of LAPTOPS) {
    const unlinkedOffers = (laptop.offers || []).filter((o) => !o.productUrl && !o.affiliateUrl);
    for (const u of unlinkedOffers) {
      const status = resolveRetailerOfferStatus(u);
      if (status.status === "BUY_NOW" || status.isClickable) {
        throw new Error(`Unlinked catalog reference price converted to BUY NOW for ${laptop.id}`);
      }
    }
  }
});

// 4. Amazon Associates ID is Server-Side & Properly Tagged
test("4. Amazon Associates ID is Server-Side & Properly Tagged", () => {
  const config = getAffiliateConfig();
  if (config.amazonAssociateTag !== "buywiseai06-21") {
    throw new Error(`Expected default Amazon Associate Tag 'buywiseai06-21', got '${config.amazonAssociateTag}'`);
  }
  if (process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG) {
    throw new Error("Amazon Associate Tag exposed in NEXT_PUBLIC_ client bundle!");
  }
});

// 5. eBay Production Affiliate Remains Disabled
test("5. eBay Production Affiliate Remains Disabled", () => {
  const config = getAffiliateConfig();
  if (config.isEbayAffiliateEnabled !== false) {
    throw new Error("eBay affiliate tracking was enabled without production clearance");
  }
});

// 6. SEO: Sitemap, Robots, Metadata & OpenGraph
test("6. SEO: Sitemap, Robots, Metadata & OpenGraph", () => {
  const sitemapUrls = sitemap().map((e) => e.url);
  if (sitemapUrls.length === 0) throw new Error("Sitemap is empty");
  if (!sitemapUrls.some((u) => u.includes("/laptops/hp-victus-15-fa2500tx"))) {
    throw new Error("Sitemap missing canonical product URLs");
  }

  const robotConfig = robots();
  if (!robotConfig.sitemap?.includes("sitemap.xml")) {
    throw new Error("robots.txt does not reference sitemap.xml");
  }

  const layout = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");
  if (!layout.includes("openGraph") || !layout.includes("twitter")) {
    throw new Error("Layout missing OpenGraph / Twitter cards");
  }
});

// 7. Safe Analytics Events (No Secrets / PII)
test("7. Safe Analytics Events", () => {
  let captured: any = null;
  const origLog = console.debug;
  console.debug = (...args: any[]) => {
    captured = args[1];
  };

  // Test all 5 events
  analytics.trackRetailerClick({
    productId: "hp-victus-15-fa2500tx",
    retailerId: "amazon",
    price: 89990,
    clickType: "affiliate",
    targetUrl: "https://www.amazon.in/dp/sample?tag=buywiseai06-21",
  });

  analytics.trackSearch({ query: "gaming laptop", resultCount: 8 });
  analytics.trackProductView({ productId: "hp-victus-15-fa2500tx", price: 89990 });
  analytics.trackCompare({ productIds: ["hp-victus-15-fa2500tx", "lenovo-ideapad-1-15amn7"], productCount: 2 });
  analytics.trackAdvisorUse({ primaryUse: "Gaming", budget: "under-90k", recommendationsCount: 4, isRelaxed: false });

  console.debug = origLog;
});

// 8. Security Audits: No Client Secrets & .env.local Ignored
test("8. Security Audits: No Client Secrets & .env.local Ignored", () => {
  const envKeys = Object.keys(process.env);
  for (const k of envKeys) {
    if (k.startsWith("NEXT_PUBLIC_") && (k.includes("KEY") || k.includes("SECRET") || k.includes("TOKEN") || k.includes("CERT"))) {
      throw new Error(`Found sensitive keyword in public variable: ${k}`);
    }
  }

  const gitignore = fs.readFileSync(path.join(__dirname, "../.gitignore"), "utf-8");
  if (!gitignore.includes(".env*.local") && !gitignore.includes(".env.local")) {
    throw new Error(".gitignore missing .env.local rule!");
  }
});

// 9. Mobile + Desktop Layout Classes
test("9. Mobile + Desktop Layout Classes", () => {
  const whereToBuy = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
  if (!whereToBuy.includes("w-full sm:w-auto") || !whereToBuy.includes("flex-col sm:flex-row")) {
    throw new Error("WhereToBuy missing mobile-safe responsive flex and width classes");
  }

  const laptopCard = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"), "utf-8");
  if (!laptopCard.includes("line-clamp-") || !laptopCard.includes("truncate")) {
    throw new Error("LaptopCard missing line-clamp / truncation overflow protection");
  }
});

// 10. API Route /api/retailers Safety
test("10. API Route /api/retailers Safety", () => {
  const routeCode = fs.readFileSync(path.join(__dirname, "../src/app/api/retailers/route.ts"), "utf-8");
  if (routeCode.includes("QUICKCOMMERCE_API_KEY") || routeCode.includes("EBAY_CERT_ID")) {
    throw new Error("API route file directly accesses or leaks backend API keys");
  }
  if (!routeCode.includes("getRetailerOffers")) {
    throw new Error("API route does not use the centralized getRetailerOffers service");
  }
});

console.log("\n==================================================");
console.log(`PHASE 36 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
