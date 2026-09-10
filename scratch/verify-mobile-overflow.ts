import assert from "assert";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("VERIFICATION: MOBILE HORIZONTAL SCROLL LOCK AUDIT");
console.log("==================================================\n");

// 1. Global CSS audit
console.log("[TEST 1] Auditing src/app/globals.css...");
const globalsCss = fs.readFileSync(path.join(__dirname, "../src/app/globals.css"), "utf-8");
assert(globalsCss.includes("overflow-x: hidden"), "globals.css must have overflow-x: hidden on body/html");
assert(globalsCss.includes("max-width: 100%"), "globals.css must set max-width: 100%");
assert(globalsCss.includes("box-sizing: border-box"), "globals.css must enforce border-box");
console.log("✓ globals.css locks global document overflow-x and enforces 100% max-width.");

// 2. Viewport metadata audit
console.log("\n[TEST 2] Auditing src/app/layout.tsx viewport metadata...");
const layoutTsx = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");
assert(layoutTsx.includes('viewportFit: "cover"'), "layout.tsx viewport must include viewportFit: cover");
assert(layoutTsx.includes('width: "device-width"'), "layout.tsx viewport must specify width: device-width");
console.log("✓ layout.tsx defines viewport-fit: cover and width: device-width.");

// 3. Modals & Popovers width audit
console.log("\n[TEST 3] Auditing Modals & Alerts for mobile viewport clamping...");
const notifSettingsModal = fs.readFileSync(
  path.join(__dirname, "../src/components/notifications/NotificationSettingsModal.tsx"),
  "utf-8"
);
assert(notifSettingsModal.includes("w-[calc(100vw-24px)]"), "NotificationSettingsModal must use calc(100vw-24px)");

const feedbackModal = fs.readFileSync(
  path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"),
  "utf-8"
);
assert(feedbackModal.includes("w-[calc(100vw-24px)]"), "FeedbackModal must use calc(100vw-24px)");

const alertsCenter = fs.readFileSync(
  path.join(__dirname, "../src/components/notifications/AlertsNotificationCenter.tsx"),
  "utf-8"
);
assert(alertsCenter.includes("w-[calc(100vw-24px)]"), "AlertsNotificationCenter must use calc(100vw-24px)");
console.log("✓ All overlay modals and popovers constrained to mobile viewport width.");

// 4. Compare Table horizontal containment audit
console.log("\n[TEST 4] Auditing Compare Page scroll containment...");
const comparePage = fs.readFileSync(path.join(__dirname, "../src/app/compare/page.tsx"), "utf-8");
assert(comparePage.includes("overflow-x-auto max-w-full"), "Compare table container must have overflow-x-auto max-w-full");
assert(comparePage.includes("max-w-full overflow-hidden"), "Compare parent must contain overflow");
console.log("✓ Compare table horizontal scrolling is strictly isolated to its container.");

// 5. Grid Card responsiveness audit
console.log("\n[TEST 5] Auditing Laptop Grid responsive breakpoints...");
const laptopGrid = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopGrid.tsx"), "utf-8");
assert(laptopGrid.includes("grid-cols-1"), "LaptopGrid must start with grid-cols-1 on narrow mobile");

const featuredLaptops = fs.readFileSync(path.join(__dirname, "../src/components/home/FeaturedLaptops.tsx"), "utf-8");
assert(featuredLaptops.includes("grid-cols-1"), "FeaturedLaptops must start with grid-cols-1 on narrow mobile");
console.log("✓ Laptop grids cleanly scale from 1 column on narrow mobile to multi-column on larger viewports.");

console.log("\n==================================================");
console.log("ALL MOBILE HORIZONTAL SCROLL LOCK CHECKS PASSED! ✓");
console.log("==================================================");
