/**
 * Verification Suite for Phase 43.1 — Standardize Laptop Product Image Sizes
 */

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
console.log("   PHASE 43.1 VERIFICATION — STANDARDIZED LAPTOP IMAGE SIZES     ");
console.log("================================================================\n");

const laptopCardTsx = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"), "utf-8");

assert(laptopCardTsx.includes("h-[150px] sm:h-[160px] md:h-[180px]"), "Image container has fixed responsive heights (180px desktop, 160px tablet, 150px mobile)");
assert(laptopCardTsx.includes("w-full"), "Image container width is 100%");
assert(laptopCardTsx.includes("bg-white"), "Image container uses pure white #FFFFFF background");
assert(laptopCardTsx.includes("object-contain"), "Images use object-fit: contain to prevent cropping");
assert(laptopCardTsx.includes("object-center"), "Images are centered within the fixed container");
assert(laptopCardTsx.includes("p-3"), "Image area has 12px (p-3) padding for consistent visual margins");
assert(!laptopCardTsx.includes('style={{ aspectRatio: "16/9" }}'), "Removed variable aspect-ratio inline style");
assert(laptopCardTsx.includes("h-[2.6rem]"), "Product name has standardized 2-line height for aligned grid rows");
assert(laptopCardTsx.includes("min-h-[2.5rem]"), "Price section has minimum height alignment");

console.log("\n================================================================");
console.log(`PHASE 43.1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================");

if (failed > 0) {
  process.exit(1);
}
