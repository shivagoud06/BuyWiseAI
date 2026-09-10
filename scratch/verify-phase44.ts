import assert from "assert";
import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import { getLaptopImage, getLaptopImageAlt, DEFAULT_LAPTOP_FALLBACK_IMAGE } from "../src/lib/laptopImage";

console.log("==================================================");
console.log("PHASE 44 VERIFICATION: REAL PRODUCT IMAGES");
console.log("==================================================\n");

// 1. Check all 29 laptops have valid real product photo URLs
console.log(`[TEST 1] Verifying all ${LAPTOPS.length} catalog laptops have real photo sources...`);
const brands = new Set<string>();
LAPTOPS.forEach((laptop) => {
  brands.add(laptop.brand);
  const resolved = getLaptopImage(laptop);
  assert(resolved.startsWith("http") || resolved.startsWith("/"), `Laptop ${laptop.id} has invalid image URL: ${resolved}`);
  assert(!resolved.includes("/images/laptops/normalized/"), `Laptop ${laptop.id} must NOT use normalized SVG drawing!`);
  assert(resolved === laptop.image, `Resolved image for ${laptop.id} must match laptop.image source`);
  
  const alt = getLaptopImageAlt(laptop);
  assert(alt.includes(laptop.brand), `Alt text for ${laptop.id} must include brand`);
});
console.log(`✓ All ${LAPTOPS.length} laptops across ${brands.size} brands (${Array.from(brands).join(", ")}) resolved to real product photos.`);

// 2. Check Fallback Resolver
console.log("\n[TEST 2] Verifying fallback behavior...");
assert.strictEqual(getLaptopImage(null), DEFAULT_LAPTOP_FALLBACK_IMAGE);
assert.strictEqual(getLaptopImage(undefined), DEFAULT_LAPTOP_FALLBACK_IMAGE);
assert.strictEqual(getLaptopImage({ image: "" }), DEFAULT_LAPTOP_FALLBACK_IMAGE);
assert.strictEqual(getLaptopImage({ image: "", imageUrl: "https://example.com/alt.jpg" }), "https://example.com/alt.jpg");
console.log("✓ Fallback image resolver behaves properly.");

// 3. Check that LaptopCard.tsx uses getLaptopImage and not normalized SVG
console.log("\n[TEST 3] Verifying LaptopCard.tsx source code...");
const laptopCardPath = path.join(__dirname, "../src/components/laptops/LaptopCard.tsx");
const laptopCardContent = fs.readFileSync(laptopCardPath, "utf-8");
assert(!laptopCardContent.includes("/images/laptops/normalized/"), "LaptopCard must not reference /images/laptops/normalized/");
assert(laptopCardContent.includes("getLaptopImage(laptop)"), "LaptopCard must invoke getLaptopImage(laptop)");
assert(laptopCardContent.includes("getLaptopImageAlt(laptop)"), "LaptopCard must invoke getLaptopImageAlt(laptop)");
assert(laptopCardContent.includes("DEFAULT_LAPTOP_FALLBACK_IMAGE"), "LaptopCard must include fallback error handler");
console.log("✓ LaptopCard.tsx correctly uses getLaptopImage with fallback handler.");

// 4. Check LaptopClientDetails.tsx
console.log("\n[TEST 4] Verifying LaptopClientDetails.tsx source code...");
const detailsPath = path.join(__dirname, "../src/app/laptops/[id]/LaptopClientDetails.tsx");
const detailsContent = fs.readFileSync(detailsPath, "utf-8");
assert(detailsContent.includes("getLaptopImage(laptop)"), "LaptopClientDetails must invoke getLaptopImage(laptop)");
console.log("✓ LaptopClientDetails.tsx unified with getLaptopImage resolver.");

// 5. Check other components: AdvisorResults, Compare, Metadata
console.log("\n[TEST 5] Verifying AdvisorResults, Compare, and Metadata...");
const advisorPath = path.join(__dirname, "../src/components/advisor/AdvisorResults.tsx");
const advisorContent = fs.readFileSync(advisorPath, "utf-8");
assert(advisorContent.includes("getLaptopImage(laptop)"), "AdvisorResults must use getLaptopImage");

const comparePath = path.join(__dirname, "../src/app/compare/page.tsx");
const compareContent = fs.readFileSync(comparePath, "utf-8");
assert(compareContent.includes("getLaptopImage(laptop)"), "ComparePage must use getLaptopImage");

const pagePath = path.join(__dirname, "../src/app/laptops/[id]/page.tsx");
const pageContent = fs.readFileSync(pagePath, "utf-8");
assert(pageContent.includes("getLaptopImage(laptop)"), "Metadata must use getLaptopImage");
console.log("✓ All consumer components unified under getLaptopImage resolver.");

console.log("\n==================================================");
console.log("ALL PHASE 44 TESTS PASSED SUCCESSFULLY! ✓");
console.log("==================================================");
