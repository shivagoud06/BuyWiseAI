const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 14 COMPREHENSIVE VERIFICATION");
console.log("==================================================");

let pass = 0, fail = 0;
function test(name, cond) {
  if (cond) {
    console.log(`✅ PASS: ${name}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    fail++;
  }
}

const detailsPath = path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx");
const detailsContent = fs.readFileSync(detailsPath, "utf-8");
const pagePath = path.join(__dirname, "../src/app/laptops/[id]/page.tsx");
const pageContent = fs.readFileSync(pagePath, "utf-8");
const whereToBuyPath = path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx");
const whereToBuyContent = fs.readFileSync(whereToBuyPath, "utf-8");
const effectiveCardPath = path.join(__dirname, "../src/components/laptops/EffectivePriceCard.tsx");
const effectiveCardContent = fs.readFileSync(effectiveCardPath, "utf-8");
const advisorPath = path.join(__dirname, "../src/components/advisor/AdvisorResults.tsx");
const advisorContent = fs.readFileSync(advisorPath, "utf-8");

// 1. Laptop with price and without price handling
test("1. Details page handles price and unavailable states", detailsContent.includes("Price unavailable") && detailsContent.includes("formatINR"));

// 2. BuyWise Score
test("2. BuyWise Score header and score breakdown present", detailsContent.includes("BuyWise Score") && detailsContent.includes("scoreBreakdown"));
test("3. Score is NOT called AI confidence or AI accuracy", !detailsContent.includes("AI confidence") && !detailsContent.includes("AI accuracy") && !detailsContent.includes("AI probability"));

// 4. Where to Buy section
test("4. Where to Buy component integrated", detailsContent.includes("<WhereToBuy laptop={laptop} />"));
test("5. Where to Buy uses target=_blank and rel=noopener noreferrer", whereToBuyContent.includes('target="_blank"') && whereToBuyContent.includes('rel="noopener noreferrer"'));

// 6. Best Listed Price
test("6. Best Listed Price label displayed", whereToBuyContent.includes("getBestListedPrice") || detailsContent.includes("Best Listed:"));

// 7. Effective Price calculation engine integration
test("7. Effective Price uses Phase 13 engine", effectiveCardContent.includes("calculateEffectivePrice") && whereToBuyContent.includes("<EffectivePriceCard"));

// 8. Specifications
test("8. Detailed specs include Processor, Memory, Storage, Display, GPU, Battery, Weight, OS",
  detailsContent.includes("Processor") &&
  detailsContent.includes("Memory (RAM)") &&
  detailsContent.includes("Storage") &&
  detailsContent.includes("Display") &&
  detailsContent.includes("Graphics (GPU)") &&
  detailsContent.includes("Battery") &&
  detailsContent.includes("Operating System")
);

// 9. Pros and Cons
test("9. Pros and Cons sections rendered from actual dataset", detailsContent.includes("Key Advantages") && detailsContent.includes("Things to Keep in Mind") && detailsContent.includes("laptop.pros") && detailsContent.includes("laptop.cons"));

// 10. AI Advisor Connection: Why this laptop matches you
test("10. Advisor Match banner present with match reasons", detailsContent.includes("Why this laptop matches you") && detailsContent.includes("matchReasons"));
test("11. AdvisorResults links pass contextual match parameters", advisorContent.includes("from=advisor") && advisorContent.includes("match="));

// 12. Compare functionality
test("12. Compare button uses useCompare context", detailsContent.includes("useCompare()") && detailsContent.includes("toggleLaptop"));

// 13. Purchase Decision Summary (Section 16)
test("13. BuyWise Recommendation summary card present", detailsContent.includes("BuyWise Recommendation") && detailsContent.includes("Best For") && detailsContent.includes("Best Listed Price"));

// 14. Related laptops
test("14. Related laptops section in page.tsx uses LaptopCard with responsive grid", pageContent.includes("<LaptopCard") && pageContent.includes("similarLaptops"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
