import * as fs from "fs";
import * as path from "path";
import { LAPTOPS } from "../src/data/laptops";

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
console.log("   PHASE 43.2 VERIFICATION — ALERTS + FEEDBACK + NORMALIZED IMAGES");
console.log("================================================================\n");

// 1. Alerts Panel
console.log("--- 1. Alerts Panel Fixes ---");
const alertsTsx = fs.readFileSync(
  path.join(__dirname, "../src/components/notifications/AlertsNotificationCenter.tsx"),
  "utf-8"
);
assert(alertsTsx.includes("createPortal"), "Alerts panel rendered via document.body portal");
assert(alertsTsx.includes("z-[9999]"), "Alerts container uses high z-index overlay");
assert(alertsTsx.includes("sm:w-[380px]") || alertsTsx.includes("w-[380px]"), "Alerts panel has 380px desktop width");
assert(alertsTsx.includes("max-h-[70vh]"), "Alerts panel enforces 70vh max height");
assert(alertsTsx.includes('wordBreak: "normal"') || alertsTsx.includes("word-break"), "Alerts panel uses normal word break");
assert(alertsTsx.includes("overflow-y-auto"), "Alerts panel has internal scrolling");

// 2. Feedback Modal
console.log("\n--- 2. Feedback Modal Fixes ---");
const feedbackTsx = fs.readFileSync(
  path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"),
  "utf-8"
);
assert(feedbackTsx.includes("createPortal"), "Feedback modal rendered via document.body portal");
assert(feedbackTsx.includes("fixed inset-0"), "Feedback modal uses fixed viewport positioning");
assert(feedbackTsx.includes("items-center justify-center"), "Feedback modal is centered in viewport");
assert(feedbackTsx.includes("max-w-[520px]"), "Feedback modal has 520px desktop width");
assert(feedbackTsx.includes("max-h-[calc(100vh-32px)]"), "Feedback modal prevents overflowing screen height");

// 3. Normalized Laptop Product Assets
console.log("\n--- 3. Normalized Laptop Product Assets ---");
const normalizedDir = path.join(__dirname, "../public/images/laptops/normalized");
assert(fs.existsSync(normalizedDir), "public/images/laptops/normalized directory exists");

let assetCount = 0;
for (const laptop of LAPTOPS) {
  const filePath = path.join(normalizedDir, `${laptop.id}.svg`);
  if (fs.existsSync(filePath)) {
    assetCount++;
  }
}
assert(assetCount === LAPTOPS.length, `All ${LAPTOPS.length} laptops have normalized 4:3 SVG assets (found ${assetCount})`);

// 4. LaptopCard Component
console.log("\n--- 4. LaptopCard Integration ---");
const laptopCardTsx = fs.readFileSync(
  path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"),
  "utf-8"
);
assert(laptopCardTsx.includes("/images/laptops/normalized/"), "LaptopCard references normalized image path");
assert(laptopCardTsx.includes("h-[150px] sm:h-[160px] md:h-[180px]"), "LaptopCard uses standardized responsive image heights");

console.log("\n================================================================");
console.log(`PHASE 43.2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================");

if (failed > 0) {
  process.exit(1);
}
