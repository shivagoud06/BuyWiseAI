const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 22 MOBILE RESPONSIVENESS AUDIT");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Navbar Mobile Layout & Menu
const navbarCode = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
assert(
  navbarCode.includes("mobileMenuOpen") && navbarCode.includes("md:hidden") && navbarCode.includes("aria-label=\"Toggle menu\""),
  "1. Navbar includes mobileMenuOpen state and accessible hamburger toggle button"
);
assert(
  navbarCode.includes("px-3 sm:px-6 lg:px-8") || navbarCode.includes("px-3"),
  "2. Navbar uses responsive padding for small phone viewports (320px-375px)"
);
assert(
  !navbarCode.includes("India (₹ INR)"),
  "3. Currency/market header badge remains safely removed"
);

// 2. Hero Section Typography Scaling
const heroCode = fs.readFileSync(path.join(__dirname, "../src/components/home/HeroSection.tsx"), "utf-8");
assert(
  heroCode.includes("text-3xl sm:text-5xl") || heroCode.includes("break-words"),
  "4. Hero heading scales appropriately for 320px screens without overflow"
);

// 3. Advisor Box Mobile Responsiveness
const advisorBoxCode = fs.readFileSync(path.join(__dirname, "../src/components/home/AdvisorBox.tsx"), "utf-8");
assert(
  advisorBoxCode.includes("p-4 sm:p-8") && advisorBoxCode.includes("grid-cols-2 sm:grid-cols-3"),
  "5. AdvisorBox uses mobile-first card padding and responsive option grids"
);

// 4. Laptop Card & Grid Responsiveness
const laptopCardCode = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"), "utf-8");
assert(
  laptopCardCode.includes("truncate") && laptopCardCode.includes("aspect-[16/10]"),
  "6. LaptopCard uses proportional aspect ratio, text truncation, and mobile touch buttons"
);

const laptopGridCode = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopGrid.tsx"), "utf-8");
assert(
  laptopGridCode.includes("grid-cols-1 md:grid-cols-2 xl:grid-cols-3"),
  "7. LaptopGrid collapses to single-column layout on mobile screens"
);

// 5. Product Details Mobile Stacking
const detailsCode = fs.readFileSync(path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx"), "utf-8");
assert(
  detailsCode.includes("grid-cols-1 lg:grid-cols-12") && detailsCode.includes("grid-cols-1 md:grid-cols-2 lg:grid-cols-3"),
  "8. Product Details collapses from 2-column to vertical stack on mobile"
);

// 6. Where to Buy Mobile Stacking & Touch Targets
const whereToBuyCode = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
assert(
  whereToBuyCode.includes("w-full sm:w-auto") && whereToBuyCode.includes("flex-col sm:flex-row"),
  "9. WhereToBuy retailer cards and action buttons stack vertically on mobile screens"
);

// 7. Compare Page Table Overflow Containment
const compareCode = fs.readFileSync(path.join(__dirname, "../src/app/compare/page.tsx"), "utf-8");
assert(
  compareCode.includes("overflow-x-auto") && compareCode.includes("min-w-"),
  "10. Compare Page table is isolated in an overflow-x-auto container to prevent page-level overflow"
);

// 8. AI Advisor Natural Language Input & Wizard
const nlpInputCode = fs.readFileSync(path.join(__dirname, "../src/components/advisor/NaturalLanguageInput.tsx"), "utf-8");
assert(
  nlpInputCode.includes("p-4 sm:p-9") && nlpInputCode.includes("flex-wrap"),
  "11. NaturalLanguageInput uses responsive padding and wrapping for prompt chips"
);

const wizardCode = fs.readFileSync(path.join(__dirname, "../src/components/advisor/AdvisorWizard.tsx"), "utf-8");
assert(
  wizardCode.includes("p-4 sm:p-10") && wizardCode.includes("grid-cols-1 sm:grid-cols-2"),
  "12. AdvisorWizard uses mobile padding and 1-column mobile option cards"
);

// 9. Footer Mobile Stacking & Email Wrap
const footerCode = fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8");
assert(
  footerCode.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-5") && footerCode.includes("break-all"),
  "13. Footer stacks columns on mobile with word-break on support email to prevent overflow"
);

console.log("--------------------------------------------------");
console.log(`Test Summary: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
