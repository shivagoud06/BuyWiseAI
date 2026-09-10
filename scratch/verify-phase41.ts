/**
 * Verification Script for Phase 41 — Complete BuyWise E-Commerce UI Redesign
 */

import { LAPTOPS } from "../src/data/laptops";
import { resolveRetailerOfferStatus, validateRetailerOffers } from "../src/services/retailers";
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

console.log("==================================================");
console.log("   PHASE 41 VERIFICATION SUITE — BUYWISE REDESIGN  ");
console.log("==================================================\n");

// 1. Catalog Integrity
console.log("--- 1. Catalog Dataset Integrity ---");
assert(LAPTOPS.length >= 20, `Catalog contains ${LAPTOPS.length} verified laptops`);
assert(LAPTOPS.every((l) => Boolean(l.id && l.name && l.brand)), "All laptops have id, name, and brand");

// 2. Global Light Theme in CSS and Layout
console.log("\n--- 2. Global Light Theme Consistency ---");
const globalsCss = fs.readFileSync(path.join(__dirname, "../src/app/globals.css"), "utf-8");
assert(globalsCss.includes("--background: #F5F7FA"), "globals.css sets root background to #F5F7FA");
assert(globalsCss.includes("--foreground: #111827"), "globals.css sets root foreground to #111827");
assert(globalsCss.includes("color-scheme: light"), "globals.css specifies light color scheme");

const layoutTsx = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");
assert(layoutTsx.includes("bg-[#F5F7FA]"), "layout.tsx uses light body background #F5F7FA");
assert(layoutTsx.includes("text-[#111827]"), "layout.tsx uses dark primary text #111827");

// 3. Navbar Light Theme & Navigation
console.log("\n--- 3. Navbar Structure & Theme ---");
const navbarTsx = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
assert(navbarTsx.includes("bg-white"), "Navbar uses white background");
assert(navbarTsx.includes('href="/laptops"'), "Navbar links to /laptops");
assert(navbarTsx.includes('href="/compare"'), "Navbar links to /compare");
assert(navbarTsx.includes('href="/advisor"'), "Navbar links to /advisor");
assert(navbarTsx.includes("BuyWise") && navbarTsx.includes("AI"), "Navbar retains BuyWise AI branding");

// 4. Homepage Hero, Search, Categories & CTA Fix
console.log("\n--- 4. Homepage Hero, Search & CTA ---");
const heroTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/HeroSection.tsx"), "utf-8");
assert(heroTsx.includes('href="/advisor"'), "Hero links to /advisor (Find My Laptop)");
assert(heroTsx.includes('href="/compare"'), "Hero links to /compare (Compare Laptops)");
assert(heroTsx.includes("Search brand, model, CPU"), "Hero includes active search bar");
assert(heroTsx.includes("Student") && heroTsx.includes("Programming") && heroTsx.includes("Gaming"), "Hero includes category navigation");

const featuredTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/FeaturedLaptops.tsx"), "utf-8");
assert(featuredTsx.includes('href="/laptops"'), "FeaturedLaptops 'View all laptops' links to /laptops");
assert(featuredTsx.includes("bg-brand-500"), "FeaturedLaptops CTA uses visible brand primary button");
assert(featuredTsx.includes("grid-cols-2") && featuredTsx.includes("xl:grid-cols-4"), "FeaturedLaptops uses 4-column responsive grid");

// 5. Light Theme in Homepage Supporting Sections
console.log("\n--- 5. Supporting Homepage Sections ---");
const advisorBoxTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/AdvisorBox.tsx"), "utf-8");
assert(advisorBoxTsx.includes("bg-white"), "AdvisorBox uses light card");
assert(!advisorBoxTsx.includes("bg-surface-900/80"), "AdvisorBox removed dark surface background");

const scoreExplainerTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/ScoreExplainer.tsx"), "utf-8");
assert(scoreExplainerTsx.includes("bg-white"), "ScoreExplainer uses white score card");
assert(!scoreExplainerTsx.includes("bg-surface-950 rounded-full"), "ScoreExplainer removed dark progress bar track");

const whyBuyWiseTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/WhyBuyWise.tsx"), "utf-8");
assert(whyBuyWiseTsx.includes("bg-white"), "WhyBuyWise uses white feature cards");

const howItWorksTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/HowItWorks.tsx"), "utf-8");
assert(howItWorksTsx.includes("bg-white"), "HowItWorks uses white step cards");

const finalCtaTsx = fs.readFileSync(path.join(__dirname, "../src/components/home/FinalCTA.tsx"), "utf-8");
assert(finalCtaTsx.includes("bg-brand-500"), "FinalCTA uses prominent brand button");

// 6. Compare Page & Detail Page Light Theme
console.log("\n--- 6. Compare & Detail Page Light Theme ---");
const comparePageTsx = fs.readFileSync(path.join(__dirname, "../src/app/compare/page.tsx"), "utf-8");
assert(comparePageTsx.includes("shop-page") || comparePageTsx.includes("bg-white"), "Compare page uses light theme");
assert(!comparePageTsx.includes("bg-surface-950/80"), "Compare page removed dark header strip");

const detailsTsx = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
assert(detailsTsx.includes("bg-white"), "LaptopClientDetails uses white product cards");
assert(detailsTsx.includes("text-[#111827]"), "LaptopClientDetails uses dark typography");

// 7. Footer Light Theme
console.log("\n--- 7. Footer Light Theme ---");
const footerTsx = fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8");
assert(footerTsx.includes("bg-gray-50"), "Footer uses light gray background");
assert(!footerTsx.includes("bg-surface-950"), "Footer removed dark surface background");

// 8. Truthful Retailer Links & No Fake BUY NOW
console.log("\n--- 8. Retailer Validation & Truthful Action Status ---");
const sampleLaptop = LAPTOPS[0];
const sampleOffers = sampleLaptop.offers || [];
const validated = validateRetailerOffers(sampleOffers, sampleLaptop);
assert(Array.isArray(validated), "validateRetailerOffers returns valid array");

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
console.log("\n==================================================");
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
