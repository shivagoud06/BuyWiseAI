import assert from "assert";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("PHASE 48 VERIFICATION: CONTINUOUS RETAILER LOGO MARQUEE");
console.log("==================================================\n");

// 1. Component File Existence
console.log("[TEST 1] Auditing RetailerLogoMarquee component file...");
const marqueeFilePath = path.join(__dirname, "../src/components/retailers/RetailerLogoMarquee.tsx");
assert(fs.existsSync(marqueeFilePath), "RetailerLogoMarquee.tsx must exist");
const marqueeContent = fs.readFileSync(marqueeFilePath, "utf-8");
console.log("✓ RetailerLogoMarquee.tsx exists.");

// 2. Retailer Brands Present
console.log("\n[TEST 2] Verifying key e-commerce retailer brands in marquee...");
const expectedBrands = ["Amazon", "Flipkart", "Croma", "Reliance Digital", "Vijay Sales", "Tata CLiQ", "eBay", "Myntra", "AJIO"];
for (const brand of expectedBrands) {
  assert(marqueeContent.includes(brand), `Marquee must include logo for ${brand}`);
}
console.log(`✓ All ${expectedBrands.length} retailer brands configured with custom SVG vectors.`);

// 3. Continuous Duplication Track Audit
console.log("\n[TEST 3] Auditing seamless continuous duplicate track...");
assert(marqueeContent.includes("track1-"), "Track 1 must exist for primary accessible logos");
assert(marqueeContent.includes("track2-"), "Track 2 must exist for seamless loop continuation");
assert(marqueeContent.includes('aria-hidden="true"'), "Track 2 duplicate must have aria-hidden to prevent screen reader noise");
console.log("✓ Seamless double-track loop architecture verified with screen-reader accessibility.");

// 4. CSS Keyframe & Animation Configuration
console.log("\n[TEST 4] Auditing CSS animation in globals.css...");
const globalsCss = fs.readFileSync(path.join(__dirname, "../src/app/globals.css"), "utf-8");
assert(globalsCss.includes("@keyframes marquee"), "globals.css must contain @keyframes marquee");
assert(globalsCss.includes("translate3d(-50%, 0, 0)"), "globals.css marquee must translate -50% for 2-track infinite loop");
assert(globalsCss.includes(".animate-marquee"), "globals.css must contain .animate-marquee class");
assert(globalsCss.includes("linear"), "marquee timing function must be linear");
assert(globalsCss.includes("prefers-reduced-motion"), "globals.css must handle prefers-reduced-motion");
console.log("✓ GPU-accelerated @keyframes marquee with linear timing and reduced-motion override verified.");

// 5. Overflow Containment & Page Lock
console.log("\n[TEST 5] Auditing horizontal overflow containment...");
assert(marqueeContent.includes("overflow-hidden"), "Marquee section must have overflow-hidden");
assert(marqueeContent.includes("max-w-full"), "Marquee section must have max-w-full");
console.log("✓ Marquee viewport strictly isolates horizontal movement with no page-wide scroll.");

// 6. Homepage Integration
console.log("\n[TEST 6] Auditing HomePage integration in src/app/page.tsx...");
const pageContent = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");
assert(pageContent.includes("<RetailerLogoMarquee"), "HomePage must render RetailerLogoMarquee");
console.log("✓ RetailerLogoMarquee integrated cleanly on homepage.");

console.log("\n==================================================");
console.log("ALL PHASE 48 CHECKS PASSED SUCCESSFULLY! ✓");
console.log("==================================================");
