/**
 * Complete Verification Suite for Phase 42 — Full BuyWise AI Website Transformation
 */

import { LAPTOPS } from "../src/data/laptops";
import { resolveRetailerOfferStatus, validateRetailerOffers } from "../src/services/retailers";
import { parseUserRequirements } from "../src/lib/nlpParser";
import { getLaptopRecommendations } from "../src/lib/recommendationEngine";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log("================================================================");
console.log("   PHASE 42 VERIFICATION SUITE — FULL WEBSITE TRANSFORMATION    ");
console.log("================================================================\n");

// 1. Branding & Logo Assets
console.log("--- 1. Branding & Logo Assets ---");
const publicMarkExists = fs.existsSync(path.join(__dirname, "../public/brand/buywise-mark.svg"));
const publicLogoExists = fs.existsSync(path.join(__dirname, "../public/brand/buywise-logo.svg"));
const faviconExists = fs.existsSync(path.join(__dirname, "../public/favicon.svg"));
const logoComponentExists = fs.existsSync(path.join(__dirname, "../src/components/brand/Logo.tsx"));

assert(publicMarkExists, "public/brand/buywise-mark.svg exists");
assert(publicLogoExists, "public/brand/buywise-logo.svg exists");
assert(faviconExists, "public/favicon.svg exists");
assert(logoComponentExists, "src/components/brand/Logo.tsx exists");

// 2. Global Light Theme in CSS and Layout
console.log("\n--- 2. Global Light Theme Consistency ---");
const globalsCss = fs.readFileSync(path.join(__dirname, "../src/app/globals.css"), "utf-8");
assert(globalsCss.includes("--background: #F5F7FA"), "globals.css sets root background to #F5F7FA");
assert(globalsCss.includes("--foreground: #111827"), "globals.css sets root foreground to #111827");
assert(globalsCss.includes("color-scheme: light"), "globals.css specifies light color scheme");

const layoutTsx = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");
assert(layoutTsx.includes("bg-[#F5F7FA]"), "layout.tsx uses light body background #F5F7FA");
assert(layoutTsx.includes("text-[#111827]"), "layout.tsx uses dark primary text #111827");
assert(!layoutTsx.includes("bg-[#060b13]"), "layout.tsx removed dark background #060b13");

// 3. Navbar Navigation & Logo Integration
console.log("\n--- 3. Navbar Navigation & Branding ---");
const navbarTsx = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
assert(navbarTsx.includes("<Logo"), "Navbar renders BuyWise AI Logo component");
assert(navbarTsx.includes('href="/laptops"'), "Navbar links to /laptops");
assert(navbarTsx.includes('href="/compare"'), "Navbar links to /compare");
assert(navbarTsx.includes('href="/advisor"'), "Navbar links to /advisor");
assert(navbarTsx.includes("Alerts"), "Navbar includes Alerts trigger");
assert(navbarTsx.includes("Feedback"), "Navbar includes Feedback trigger");

// 4. Homepage Structure & CTAs
console.log("\n--- 4. Homepage Redesign ---");
const heroTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/HeroSection.tsx"), "utf-8");
assert(heroTsx.includes("Find the") && heroTsx.includes("right laptop"), "Hero headline matches requirement");
assert(heroTsx.includes("Search brand, model, CPU"), "Hero includes e-commerce search bar");
assert(heroTsx.includes('href="/advisor"'), "Hero links to /advisor (Find My Laptop)");
assert(heroTsx.includes('href="/compare"'), "Hero links to /compare (Compare Laptops)");
assert(heroTsx.includes("Student") && heroTsx.includes("Programming") && heroTsx.includes("Gaming"), "Hero includes Category navigation");

const featuredTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/FeaturedLaptops.tsx"), "utf-8");
assert(featuredTsx.includes('href="/laptops"'), "FeaturedLaptops 'View all laptops' links to /laptops");
assert(featuredTsx.includes("bg-brand-500") || featuredTsx.includes("bg-teal-600"), "CTA button is styled as a primary action");

const howItWorksHomeTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/HowItWorks.tsx"), "utf-8");
assert(howItWorksHomeTsx.includes("01") && howItWorksHomeTsx.includes("02") && howItWorksHomeTsx.includes("03"), "HowItWorks has 3 structured steps");

const whyBuyWiseHomeTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/WhyBuyWise.tsx"), "utf-8");
assert(whyBuyWiseHomeTsx.includes("bg-white"), "WhyBuyWise uses white cards");

// 5. Catalog (/laptops) & Detail (/laptops/[id]) Pages
console.log("\n--- 5. Catalog & Product Details ---");
const laptopsPageTsx = fs.readFileSync(path.join(__dirname, "../src/app/laptops/page.tsx"), "utf-8");
assert(laptopsPageTsx.includes("shop-page") || laptopsPageTsx.includes("bg-white"), "Catalog page uses light layout");

const detailsTsx = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
assert(detailsTsx.includes("bg-white"), "LaptopClientDetails uses white cards");
assert(detailsTsx.includes("text-[#111827]"), "LaptopClientDetails uses dark typography");
assert(detailsTsx.includes("<WhereToBuy"), "LaptopClientDetails integrates WhereToBuy multi-retailer section");

// 6. Compare Page (/compare)
console.log("\n--- 6. Compare Page ---");
const comparePageTsx = fs.readFileSync(path.join(__dirname, "../src/app/compare/page.tsx"), "utf-8");
assert(comparePageTsx.includes("Compare Laptops"), "Compare page header exists");
assert(comparePageTsx.includes("bg-white"), "Compare page uses white card/table elements");
assert(!comparePageTsx.includes("bg-surface-950/80"), "Compare page removed dark header strip");

// 7. AI Advisor (/advisor) & Components
console.log("\n--- 7. AI Advisor Flow ---");
const advisorPageTsx = fs.readFileSync(path.join(__dirname, "../src/app/advisor/page.tsx"), "utf-8");
assert(advisorPageTsx.includes("Find Your Perfect Laptop"), "Advisor page hero matches requirement");

const nlpInputTsx = fs.readFileSync(path.join(__dirname, "../src/components/advisor/NaturalLanguageInput.tsx"), "utf-8");
assert(nlpInputTsx.includes("bg-white"), "NaturalLanguageInput uses white card");
assert(nlpInputTsx.includes("Tell me what you're looking for"), "NaturalLanguageInput includes placeholder");
assert(nlpInputTsx.includes("Budget:") && nlpInputTsx.includes("Workload:"), "NaturalLanguageInput includes quick chips");

const interpretedTsx = fs.readFileSync(path.join(__dirname, "../src/components/advisor/InterpretedRequirementsCard.tsx"), "utf-8");
assert(interpretedTsx.includes("bg-white"), "InterpretedRequirementsCard uses white card");
assert(!interpretedTsx.includes("bg-surface-900/90"), "InterpretedRequirementsCard removed dark card background");

const wizardTsx = fs.readFileSync(path.join(__dirname, "../src/components/advisor/AdvisorWizard.tsx"), "utf-8");
assert(wizardTsx.includes("bg-white"), "AdvisorWizard uses white card");
assert(!wizardTsx.includes("bg-surface-900/85"), "AdvisorWizard removed dark card background");

const resultsTsx = fs.readFileSync(path.join(__dirname, "../src/components/advisor/AdvisorResults.tsx"), "utf-8");
assert(resultsTsx.includes("bg-white"), "AdvisorResults uses white result cards");

// 8. Feedback Modal & Alerts Modal
console.log("\n--- 8. Feedback & Alerts Modals ---");
const feedbackModalTsx = fs.readFileSync(path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"), "utf-8");
assert(feedbackModalTsx.includes("bg-white"), "FeedbackModal uses white card");
assert(feedbackModalTsx.includes("Share Your Feedback"), "FeedbackModal header exists");
assert(feedbackModalTsx.includes("Escape"), "FeedbackModal supports ESC key close");

const notifModalTsx = fs.readFileSync(path.join(__dirname, "../src/components/notifications/NotificationSettingsModal.tsx"), "utf-8");
assert(notifModalTsx.includes("bg-white"), "NotificationSettingsModal uses white card");
assert(notifModalTsx.includes("Notification Settings"), "NotificationSettingsModal header exists");
assert(notifModalTsx.includes("Escape"), "NotificationSettingsModal supports ESC key close");

// 9. Static Informational Pages (All Light Theme)
console.log("\n--- 9. Static Pages Light Theme Audit ---");
const staticPages = [
  "buying-guide/page.tsx",
  "how-it-works/page.tsx",
  "privacy/page.tsx",
  "terms/page.tsx",
  "affiliate-disclosure/page.tsx",
  "not-found.tsx",
  "error.tsx",
];

for (const p of staticPages) {
  const content = fs.readFileSync(path.join(__dirname, "../src/app", p), "utf-8");
  assert(!content.includes("bg-surface-950"), `${p} does not contain bg-surface-950`);
  assert(!content.includes("text-surface-200"), `${p} does not contain dark text tokens`);
}

// 10. Functional & Recommendation Engine Tests
console.log("\n--- 10. Recommendation & Parser Engine Tests ---");
const parsed = parseUserRequirements("Gaming laptop under ₹75,000 with 16GB RAM");
assert(parsed.primaryUse === "Gaming", "NLP parser correctly identified Gaming use case");
assert(parsed.budget === "50k-75k", "NLP parser correctly mapped budget ₹75,000");
assert(parsed.ramPreference === "16GB", "NLP parser correctly extracted 16GB RAM");

const recs = getLaptopRecommendations(
  {
    budget: "50k-75k",
    primaryUse: "Gaming",
    priorities: ["Performance", "Value for Money"],
    ramPreference: "16GB",
    gpuPreference: "gaming-required",
  },
  LAPTOPS
);
assert(recs.recommendations.length > 0, `Recommendation engine returned ${recs.recommendations.length} matching laptops`);
assert(recs.recommendations[0].matchPercentage >= 70, `Top match score is ${recs.recommendations[0].matchPercentage}%`);

// 11. Truthful Retailer Links & No Fake BUY NOW
console.log("\n--- 11. Truthful Retailer Link Status Verification ---");
const unlinkedOffer = {
  retailerId: "amazon" as const,
  retailerName: "Amazon India",
  price: 50000,
  currency: "INR" as const,
  availability: "in-stock" as const,
  affiliateEligible: false,
  lastUpdated: "2026-08-20",
  directUrl: undefined,
  affiliateUrl: undefined,
};
const unlinkedStatus = resolveRetailerOfferStatus(unlinkedOffer);
assert(unlinkedStatus.status === "COMING_SOON", "Unlinked offer correctly resolves to COMING_SOON (never fake BUY NOW)");

const outOfStockOffer = {
  retailerId: "flipkart" as const,
  retailerName: "Flipkart",
  price: 50000,
  currency: "INR" as const,
  availability: "out-of-stock" as const,
  affiliateEligible: false,
  lastUpdated: "2026-08-20",
  directUrl: "https://flipkart.com/sample",
};
const outOfStockStatus = resolveRetailerOfferStatus(outOfStockOffer);
assert(outOfStockStatus.status === "NOT_AVAILABLE", "Out of stock offer correctly resolves to NOT_AVAILABLE");

// Summary
console.log("\n================================================================");
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================");

if (failed > 0) {
  process.exit(1);
}
