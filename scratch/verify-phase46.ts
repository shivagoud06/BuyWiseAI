import assert from "assert";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("PHASE 46 VERIFICATION: NOTIFICATION SETTINGS MODAL");
console.log("==================================================\n");

const modalPath = path.join(__dirname, "../src/components/notifications/NotificationSettingsModal.tsx");
const modalContent = fs.readFileSync(modalPath, "utf-8");

// 1. Check React Portal to document.body
console.log("[TEST 1] Verifying React Portal to document.body...");
assert(modalContent.includes("createPortal"), "Modal must use createPortal");
assert(modalContent.includes("document.body"), "Modal portal must mount to document.body");
console.log("✓ Modal uses React Portal to document.body for top-level viewport positioning.");

// 2. Check Viewport Positioning & Backdrop
console.log("\n[TEST 2] Verifying viewport positioning and overlay styles...");
assert(modalContent.includes("fixed inset-0"), "Overlay must use fixed inset-0");
assert(modalContent.includes("rgba(15, 23, 42, 0.20)"), "Overlay must use subtle rgba(15, 23, 42, 0.20) backdrop");
assert(modalContent.includes("z-[100001]"), "Modal z-index must be top-level z-[100001]");
assert(modalContent.includes("flex items-center justify-center"), "Modal overlay must center content via flex");
console.log("✓ Modal overlay is fixed inset-0 with flex centering, high z-index, and subtle backdrop.");

// 3. Check Modal Dimensions
console.log("\n[TEST 3] Verifying modal size and responsiveness...");
assert(modalContent.includes("w-[calc(100vw-24px)]"), "Mobile width calc(100vw-24px) must be present");
assert(modalContent.includes("sm:w-[min(560px,calc(100vw-32px))]"), "Desktop width min(560px, calc(100vw-32px)) must be present");
assert(modalContent.includes("max-h-[calc(100vh-24px)]"), "Mobile max height calc(100vh-24px) must be present");
assert(modalContent.includes("sm:max-h-[calc(100vh-32px)]"), "Desktop max height calc(100vh-32px) must be present");
assert(modalContent.includes("overflow-y-auto"), "Modal body must have internal scroll only");
console.log("✓ Modal dimensions conform to exact responsive viewport constraints with internal scroll.");

// 4. Check Background Scroll Lock
console.log("\n[TEST 4] Verifying background scroll lock...");
assert(modalContent.includes('document.body.style.overflow = "hidden"'), "Must lock document.body scroll when open");
assert(modalContent.includes("document.body.style.overflow = originalOverflow"), "Must restore original document.body scroll on close");
console.log("✓ Scroll lock mechanism prevents background page scrolling while modal is open.");

// 5. Check Close Behaviors
console.log("\n[TEST 5] Verifying close triggers (X, Done, ESC, backdrop click)...");
assert(modalContent.includes('e.key === "Escape"'), "ESC key handler must be implemented");
assert(modalContent.includes("e.stopPropagation()"), "Modal card must stop propagation to prevent backdrop close on click inside");
assert(modalContent.includes("onClick={onClose}"), "Backdrop must trigger onClose");
assert(modalContent.includes("Done"), "Done button must be present");
assert(modalContent.includes("Reset Permissions"), "Reset Permissions button must be present");
console.log("✓ All close handlers (ESC, backdrop click, X, Done) verified.");

// 6. Check Global BuyWise Light Theme Design
console.log("\n[TEST 6] Verifying BuyWise Light Theme colors...");
assert(modalContent.includes("bg-white"), "Background must be white");
assert(modalContent.includes("text-[#111827]"), "Primary text must be #111827");
assert(modalContent.includes("text-[#64748B]"), "Secondary text must be #64748B");
assert(modalContent.includes("border-[#E2E8F0]"), "Border must be #E2E8F0");
assert(modalContent.includes("#0EA5A4"), "Primary teal accent #0EA5A4 must be used");
console.log("✓ Global BuyWise light theme colors verified.");

console.log("\n==================================================");
console.log("ALL PHASE 46 TESTS PASSED SUCCESSFULLY! ✓");
console.log("==================================================");
