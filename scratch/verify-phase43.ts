/**
 * Verification Suite for Phase 43 — Complete BuyWise AI Color System + Alerts + Feedback UX
 */

import { LAPTOPS } from "../src/data/laptops";
import { resolveRetailerOfferStatus } from "../src/services/retailers";
import { parseUserRequirements } from "../src/lib/nlpParser";
import { getLaptopRecommendations } from "../src/lib/recommendationEngine";
import {
  getNotificationConsent,
  getNotificationHistory,
  markAllNotificationsRead,
  markNotificationRead,
  getUnreadNotificationCount,
  recordDeliveredNotification,
  clearNotificationConsent,
  clearNotificationHistory,
} from "../src/services/notifications/consent";
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
console.log("   PHASE 43 VERIFICATION SUITE — COLOR SYSTEM + ALERTS + FEEDBACK");
console.log("================================================================\n");

// 1. Global Color System & Design Tokens
console.log("--- 1. Global Color System Tokens ---");
const tailwindConfig = fs.readFileSync(path.join(__dirname, "../tailwind.config.ts"), "utf-8");
assert(tailwindConfig.includes('"#0EA5A4"'), "tailwind.config.ts defines Primary BuyWise Teal (#0EA5A4)");
assert(tailwindConfig.includes('"#087F7E"'), "tailwind.config.ts defines Darker Teal (#087F7E)");
assert(tailwindConfig.includes('"#E6FFFE"'), "tailwind.config.ts defines Light Teal (#E6FFFE)");
assert(tailwindConfig.includes('"#F5F7FA"'), "tailwind.config.ts defines Main Website Background (#F5F7FA)");
assert(tailwindConfig.includes('"#FFFFFF"'), "tailwind.config.ts defines Card Background (#FFFFFF)");
assert(tailwindConfig.includes('"#111827"'), "tailwind.config.ts defines Primary Text (#111827)");
assert(tailwindConfig.includes('"#64748B"'), "tailwind.config.ts defines Secondary Text (#64748B)");
assert(tailwindConfig.includes('"#E2E8F0"'), "tailwind.config.ts defines Border (#E2E8F0)");
assert(tailwindConfig.includes('"#16A34A"'), "tailwind.config.ts defines Semantic Success / Discount (#16A34A)");
assert(tailwindConfig.includes('"#F59E0B"'), "tailwind.config.ts defines Rating Amber (#F59E0B)");

const globalsCss = fs.readFileSync(path.join(__dirname, "../src/app/globals.css"), "utf-8");
assert(globalsCss.includes("--buywise-teal: #0EA5A4"), "globals.css sets --buywise-teal to #0EA5A4");
assert(globalsCss.includes("--buywise-teal-dark: #087F7E"), "globals.css sets --buywise-teal-dark to #087F7E");
assert(globalsCss.includes("--buywise-teal-light: #E6FFFE"), "globals.css sets --buywise-teal-light to #E6FFFE");

// 2. Navbar & Footer
console.log("\n--- 2. Navbar & Footer ---");
const navbarTsx = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
assert(navbarTsx.includes("AlertsNotificationCenter"), "Navbar renders AlertsNotificationCenter dropdown");
assert(navbarTsx.includes("FeedbackModal"), "Navbar integrates FeedbackModal");
assert(navbarTsx.includes("unreadCount"), "Navbar tracks unread notification count badge");
assert(navbarTsx.includes("<Logo"), "Navbar renders BuyWise AI Logo");

const footerTsx = fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8");
assert(footerTsx.includes("<Logo"), "Footer renders BuyWise AI Logo");
assert(footerTsx.includes("bg-slate-50"), "Footer uses light background");

// 3. Alerts Notification Center
console.log("\n--- 3. Alerts Notification Center ---");
const alertsTsx = fs.readFileSync(path.join(__dirname, "../src/components/notifications/AlertsNotificationCenter.tsx"), "utf-8");
assert(alertsTsx.includes("PRICE_DROP") && alertsTsx.includes("BACK_IN_STOCK") && alertsTsx.includes("BETTER_OFFER"), "Alerts center handles all 3 notification trigger types");
assert(alertsTsx.includes("No alerts yet"), "Alerts center includes empty state message");
assert(alertsTsx.includes('href="/laptops"'), "Alerts empty state links to /laptops");
assert(alertsTsx.includes("Mark all read") || alertsTsx.includes("handleMarkAllRead"), "Alerts center provides Mark all as read");
assert(alertsTsx.includes("Escape"), "Alerts center supports ESC key close");
assert(alertsTsx.includes("handleClickOutside"), "Alerts center supports click-outside dismissal");

// 4. Alerts Business Logic & Read States
console.log("\n--- 4. Alerts Notification State Logic ---");
clearNotificationConsent();
clearNotificationHistory();

const sampleAlert = {
  id: "test-notif-1",
  triggerType: "PRICE_DROP" as const,
  productId: "lenovo-loq-15iax9-rtx3050",
  productName: "Lenovo LOQ 15 Gen 9",
  retailerId: "amazon" as const,
  retailerName: "Amazon India",
  title: "Price Drop Alert",
  message: "Price dropped on a verified retailer offer.",
  currency: "INR" as const,
  timestamp: new Date().toISOString(),
  read: false,
  delivered: true,
  channel: "in_app" as const,
  dedupKey: "lenovo-loq-15iax9-rtx3050:PRICE_DROP:test",
};

recordDeliveredNotification(sampleAlert);
assert(getUnreadNotificationCount() === 1, "Recorded 1 unread notification successfully");

const updatedHistory = markAllNotificationsRead();
assert(updatedHistory[0].read === true, "markAllNotificationsRead sets notification read status to true");
assert(getUnreadNotificationCount() === 0, "Unread notification count is now 0");

// 5. Feedback Experience
console.log("\n--- 5. Feedback Modal Experience ---");
const feedbackModalTsx = fs.readFileSync(path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"), "utf-8");
assert(feedbackModalTsx.includes("Help us improve BuyWise AI"), "Feedback modal header matches requirement");
assert(feedbackModalTsx.includes("Suggestion") && feedbackModalTsx.includes("Bug Report") && feedbackModalTsx.includes("General Feedback"), "Feedback modal provides 3 category cards");
assert(feedbackModalTsx.includes("Tell us what you think..."), "Feedback textarea placeholder matches requirement");
assert(feedbackModalTsx.includes("500"), "Feedback enforces 500 characters limit");
assert(feedbackModalTsx.includes("Please enter your feedback."), "Feedback modal includes immediate empty validation");
assert(feedbackModalTsx.includes("Feedback must be 500 characters or less."), "Feedback modal includes length validation");
assert(feedbackModalTsx.includes("Thanks for your feedback!"), "Feedback modal includes success state message");
assert(feedbackModalTsx.includes("Unable to send feedback."), "Feedback modal includes failure fallback message");
assert(feedbackModalTsx.includes("Escape"), "Feedback modal supports ESC key close");
assert(feedbackModalTsx.includes("Sending..."), "Feedback modal includes loading button state");

// 6. Buttons & Design System
console.log("\n--- 6. Buttons & Design System ---");
const buttonTsx = fs.readFileSync(path.join(__dirname, "../src/components/ui/Button.tsx"), "utf-8");
assert(buttonTsx.includes("bg-[#0EA5A4]"), "Button primary variant uses #0EA5A4");
assert(buttonTsx.includes("hover:bg-[#087F7E]"), "Button primary variant uses #087F7E hover");
assert(buttonTsx.includes("bg-[#DC2626]"), "Button danger variant uses #DC2626");

const cardTsx = fs.readFileSync(path.join(__dirname, "../src/components/ui/Card.tsx"), "utf-8");
assert(cardTsx.includes("bg-white"), "Card component uses white surface");
assert(cardTsx.includes("border-[#E2E8F0]"), "Card component uses #E2E8F0 border");

const badgeTsx = fs.readFileSync(path.join(__dirname, "../src/components/ui/Badge.tsx"), "utf-8");
assert(badgeTsx.includes("bg-[#DCFCE7]"), "Badge verdict-buy uses #DCFCE7 success background");

// 7. Product Cards & Discount Color System
console.log("\n--- 7. LaptopCard Color Tokens ---");
const laptopCardTsx = fs.readFileSync(path.join(__dirname, "../src/components/laptops/LaptopCard.tsx"), "utf-8");
assert(laptopCardTsx.includes("bg-[#DCFCE7]") && laptopCardTsx.includes("text-[#16A34A]"), "LaptopCard discount pill uses green tokens (#16A34A / #DCFCE7)");
assert(laptopCardTsx.includes("text-[#F59E0B]") || laptopCardTsx.includes("fill-[#F59E0B]"), "LaptopCard rating stars use amber tokens (#F59E0B)");
assert(laptopCardTsx.includes("bg-[#0EA5A4]"), "LaptopCard action buttons use BuyWise teal (#0EA5A4)");

// 8. Business Logic Integrity
console.log("\n--- 8. Business Logic Integrity ---");
const nlpTest = parseUserRequirements("Lightweight coding laptop under 75000 with 16GB RAM");
assert(nlpTest.primaryUse === "Programming", "NLP parser correctly identifies Programming use case");
assert(nlpTest.budget === "50k-75k", "NLP parser correctly maps budget to 50k-75k");

const recsTest = getLaptopRecommendations(
  {
    budget: "50k-75k",
    primaryUse: "Programming",
    priorities: ["Performance", "Value for Money"],
    ramPreference: "16GB",
    gpuPreference: "no-preference",
  },
  LAPTOPS
);
assert(recsTest.recommendations.length > 0, "Recommendation engine returned recommendations");
assert(recsTest.recommendations[0].matchPercentage > 0, "Top recommendation has valid match percentage");

const sampleOffer = {
  retailerId: "amazon" as const,
  retailerName: "Amazon India",
  price: 54990,
  currency: "INR" as const,
  availability: "in-stock" as const,
  affiliateEligible: false,
  lastUpdated: "2026-08-21",
};
const offerStatus = resolveRetailerOfferStatus(sampleOffer);
assert(offerStatus.status === "COMING_SOON", "Unlinked offer safely resolves to COMING_SOON without fake links");

// Summary
console.log("\n================================================================");
console.log(`PHASE 43 RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================");

if (failed > 0) {
  process.exit(1);
}
