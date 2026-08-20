import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import { RetailerOffer } from "../src/types";
import { interestTracker } from "../src/services/interest";
import {
  notificationService,
  evaluateNotificationTrigger,
  evaluateAndDispatchNotification,
  getHighInterestProducts,
  isProductHighInterest,
  grantNotificationConsent,
  revokeNotificationConsent,
  clearNotificationConsent,
  isNotificationConsentGranted,
  updateNotificationPreferences,
  MockNotificationAdapter,
  DEFAULT_HIGH_INTEREST_THRESHOLD,
  DEFAULT_COOLDOWN_MS,
  isValidLiveRetailerOffer,
} from "../src/services/notifications";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 39: SMART NOTIFICATIONS SYSTEM VERIFICATION");
console.log("================================================================================");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      res
        .then(() => {
          console.log(`✅ PASS: ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`❌ FAIL: ${name}`);
          console.error(`   Error: ${err.message}`);
          failed++;
        });
    } else {
      console.log(`✅ PASS: ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  // Clean initial state
  interestTracker.clear();
  clearNotificationConsent();

  const laptop = LAPTOPS.find((l) => l.id === "lenovo-loq-15iax9-rtx3050") || LAPTOPS[0];
  const otherLaptop = LAPTOPS.find((l) => l.id !== laptop.id) || LAPTOPS[1];

  // 1. High-interest detection
  test("1. High-interest detection (interest score >= threshold)", () => {
    interestTracker.clear();
    // Record actions to reach score >= 3 (e.g. 1 view + 1 repeat view = 3)
    interestTracker.recordProductView(laptop.id);
    interestTracker.recordProductView(laptop.id); // repeat view = +2, total = 3

    const highInterest = getHighInterestProducts(DEFAULT_HIGH_INTEREST_THRESHOLD);
    if (!highInterest.some((l) => l.id === laptop.id)) {
      throw new Error(`Expected ${laptop.id} to be detected in high-interest list`);
    }

    if (!isProductHighInterest(laptop.id, DEFAULT_HIGH_INTEREST_THRESHOLD)) {
      throw new Error(`isProductHighInterest returned false for score 3`);
    }
  });

  // 2. Low-interest ignored
  test("2. Low-interest ignored (interest score < threshold)", () => {
    interestTracker.clear();
    // Record only 1 view = score 1 (< 3)
    interestTracker.recordProductView(otherLaptop.id);

    const highInterest = getHighInterestProducts(DEFAULT_HIGH_INTEREST_THRESHOLD);
    if (highInterest.some((l) => l.id === otherLaptop.id)) {
      throw new Error(`Low-interest laptop ${otherLaptop.id} was erroneously included in high-interest list`);
    }

    const currentOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 54990,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: new Date().toISOString(),
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const prevOffer: RetailerOffer = {
      ...currentOffer,
      price: 59990,
    };

    grantNotificationConsent();
    const evalResult = evaluateNotificationTrigger(
      otherLaptop,
      { currentOffer, previousOffer: prevOffer },
      { userInterestScore: 1 }
    );

    if (evalResult.shouldTrigger) {
      throw new Error("Trigger fired for low-interest product");
    }
    if (evalResult.skippedReason !== "low_interest") {
      throw new Error(`Expected skippedReason 'low_interest', got '${evalResult.skippedReason}'`);
    }
  });

  // 3. Price-drop trigger
  test("3. Price-drop trigger (verified retailer drop below previous verified price)", () => {
    grantNotificationConsent();

    const previousVerifiedOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 65990,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-19T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const currentLiveOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 59990, // ₹6,000 drop
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-20T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const result = evaluateNotificationTrigger(
      laptop,
      { previousOffer: previousVerifiedOffer, currentOffer: currentLiveOffer },
      { userInterestScore: 5 }
    );

    if (!result.shouldTrigger) {
      throw new Error(`Price drop failed to trigger: ${result.reason}`);
    }
    if (result.triggerType !== "PRICE_DROP") {
      throw new Error(`Expected triggerType 'PRICE_DROP', got '${result.triggerType}'`);
    }
    if (result.notification?.oldPrice !== 65990 || result.notification?.newPrice !== 59990) {
      throw new Error("Notification old/new price mismatch");
    }
    if (result.notification?.priceDifference !== 6000) {
      throw new Error(`Expected price difference 6000, got ${result.notification?.priceDifference}`);
    }
  });

  // 4. Back-in-stock trigger
  test("4. Back-in-stock trigger (out-of-stock transitions to in-stock)", () => {
    grantNotificationConsent();

    const previousOutOfStockOffer: RetailerOffer = {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: 62990,
      currency: "INR",
      availability: "out-of-stock",
      lastUpdated: "2026-08-18T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.flipkart.com/p/item123",
    };

    const currentInStockOffer: RetailerOffer = {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: 62990,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-20T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.flipkart.com/p/item123",
    };

    const result = evaluateNotificationTrigger(
      laptop,
      { previousOffer: previousOutOfStockOffer, currentOffer: currentInStockOffer },
      { userInterestScore: 5 }
    );

    if (!result.shouldTrigger) {
      throw new Error(`Back-in-stock failed to trigger: ${result.reason}`);
    }
    if (result.triggerType !== "BACK_IN_STOCK") {
      throw new Error(`Expected triggerType 'BACK_IN_STOCK', got '${result.triggerType}'`);
    }
  });

  // 5. Better-offer trigger
  test("5. Better-offer trigger (new verified offer lower than other stores)", () => {
    grantNotificationConsent();

    const otherStoreOffers: RetailerOffer[] = [
      {
        retailerId: "amazon",
        retailerName: "Amazon India",
        price: 68990,
        currency: "INR",
        availability: "in-stock",
        lastUpdated: "2026-08-20T08:00:00Z",
        affiliateEligible: true,
        productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
      },
      {
        retailerId: "croma",
        retailerName: "Croma",
        price: 69990,
        currency: "INR",
        availability: "in-stock",
        lastUpdated: "2026-08-20T08:00:00Z",
        affiliateEligible: true,
        productUrl: "https://www.croma.com/p/item456",
      },
    ];

    const newFlipkartOffer: RetailerOffer = {
      retailerId: "flipkart",
      retailerName: "Flipkart",
      price: 64990, // ₹4,000 cheaper than Amazon
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-20T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.flipkart.com/p/item789",
    };

    const result = evaluateNotificationTrigger(
      laptop,
      { currentOffer: newFlipkartOffer, otherOffers: otherStoreOffers },
      { userInterestScore: 5 }
    );

    if (!result.shouldTrigger) {
      throw new Error(`Better offer failed to trigger: ${result.reason}`);
    }
    if (result.triggerType !== "BETTER_OFFER") {
      throw new Error(`Expected triggerType 'BETTER_OFFER', got '${result.triggerType}'`);
    }
    if (result.notification?.oldPrice !== 68990 || result.notification?.newPrice !== 64990) {
      throw new Error("Old lowest / new offer price mismatch");
    }
  });

  // 6. Invalid / fake offer ignored
  test("6. Invalid / fake offer ignored (mock sources, invalid schema, zero price)", () => {
    grantNotificationConsent();

    // Case A: Mock offer
    const mockOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 49990,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: new Date().toISOString(),
      affiliateEligible: true,
      isMock: true,
      source: "mock",
    };

    const mockResult = evaluateNotificationTrigger(
      laptop,
      { currentOffer: mockOffer, previousOffer: { ...mockOffer, isMock: false, source: "official_api", price: 60000 } },
      { userInterestScore: 5 }
    );
    if (mockResult.shouldTrigger) {
      throw new Error("Mock offer erroneously triggered notification");
    }
    if (mockResult.skippedReason !== "mock_offer") {
      throw new Error(`Expected skippedReason 'mock_offer', got '${mockResult.skippedReason}'`);
    }

    // Case B: Zero / Negative Price
    const zeroPriceOffer: any = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 0,
      currency: "INR",
      availability: "in-stock",
    };
    if (isValidLiveRetailerOffer(zeroPriceOffer, laptop)) {
      throw new Error("Zero price offer should be rejected by validator");
    }

    // Case C: Missing currency
    const noCurrencyOffer: any = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 49990,
      availability: "in-stock",
    };
    if (isValidLiveRetailerOffer(noCurrencyOffer, laptop)) {
      throw new Error("Offer without currency should be rejected by validator");
    }
  });

  // 7. Consent required
  test("7. Consent required (notifications never sent if consent not granted or disabled)", () => {
    clearNotificationConsent();
    revokeNotificationConsent();

    if (isNotificationConsentGranted()) {
      throw new Error("Consent should be false after revocation");
    }

    const currentLiveOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 49990,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: new Date().toISOString(),
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const prevOffer: RetailerOffer = {
      ...currentLiveOffer,
      price: 60000,
    };

    const result = evaluateNotificationTrigger(
      laptop,
      { previousOffer: prevOffer, currentOffer: currentLiveOffer },
      { userInterestScore: 5, bypassConsent: false }
    );

    if (result.shouldTrigger) {
      throw new Error("Notification triggered despite lack of user consent");
    }
    if (result.skippedReason !== "no_consent") {
      throw new Error(`Expected skippedReason 'no_consent', got '${result.skippedReason}'`);
    }

    // Test Quiet Mode
    grantNotificationConsent();
    updateNotificationPreferences({ quietMode: true });

    const quietResult = evaluateNotificationTrigger(
      laptop,
      { previousOffer: prevOffer, currentOffer: currentLiveOffer },
      { userInterestScore: 5, bypassConsent: false }
    );
    if (quietResult.shouldTrigger) {
      throw new Error("Notification triggered while Quiet Mode is active");
    }
    if (quietResult.skippedReason !== "quiet_mode") {
      throw new Error(`Expected skippedReason 'quiet_mode', got '${quietResult.skippedReason}'`);
    }
  });

  // 8. Duplicate prevention
  test("8. Duplicate prevention (identical trigger and price ignored)", async () => {
    clearNotificationConsent();
    grantNotificationConsent();
    const mockAdapter = new MockNotificationAdapter();
    notificationService.setAdapter(mockAdapter);

    const prevOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 70000,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-20T08:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const currentOffer: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 65000,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: "2026-08-20T10:00:00Z",
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    // First dispatch -> Should succeed
    const firstDispatch = await evaluateAndDispatchNotification(
      laptop,
      { previousOffer: prevOffer, currentOffer },
      { userInterestScore: 5, now: new Date("2026-08-20T10:00:00Z") }
    );
    if (!firstDispatch.shouldTrigger) {
      throw new Error(`First notification failed: ${firstDispatch.reason}`);
    }

    // Second dispatch with same offer -> Should be blocked as duplicate
    const secondDispatch = await evaluateAndDispatchNotification(
      laptop,
      { previousOffer: prevOffer, currentOffer },
      { userInterestScore: 5, now: new Date("2026-08-20T10:05:00Z") }
    );
    if (secondDispatch.shouldTrigger) {
      throw new Error("Duplicate notification was erroneously allowed to trigger");
    }
    if (secondDispatch.skippedReason !== "duplicate") {
      throw new Error(`Expected skippedReason 'duplicate', got '${secondDispatch.skippedReason}'`);
    }
  });

  // 9. Cooldown enforcement
  test("9. Cooldown enforcement (rate limiting between alerts for same product)", async () => {
    clearNotificationConsent();
    grantNotificationConsent();

    const t0 = new Date("2026-08-20T10:00:00Z");
    const t30min = new Date("2026-08-20T10:30:00Z"); // 30 min later (< 1 hour cooldown)
    const t2hours = new Date("2026-08-20T12:05:00Z"); // 2 hours later (> 1 hour cooldown)

    const offerA: RetailerOffer = {
      retailerId: "amazon",
      retailerName: "Amazon India",
      price: 70000,
      currency: "INR",
      availability: "in-stock",
      lastUpdated: t0.toISOString(),
      affiliateEligible: true,
      productUrl: "https://www.amazon.in/dp/B0CXF3F3XY",
    };

    const offerB: RetailerOffer = {
      ...offerA,
      price: 65000, // first drop
    };

    const offerC: RetailerOffer = {
      ...offerA,
      price: 62000, // second drop within 30 min
    };

    const offerD: RetailerOffer = {
      ...offerA,
      price: 59000, // third drop after 2 hours
    };

    // First drop at t0
    const res1 = await evaluateAndDispatchNotification(
      laptop,
      { previousOffer: offerA, currentOffer: offerB },
      { userInterestScore: 5, now: t0, cooldownMs: DEFAULT_COOLDOWN_MS }
    );
    if (!res1.shouldTrigger) throw new Error("First drop failed to trigger");

    // Second drop at t30min -> Cooldown active
    const res2 = await evaluateAndDispatchNotification(
      laptop,
      { previousOffer: offerB, currentOffer: offerC },
      { userInterestScore: 5, now: t30min, cooldownMs: DEFAULT_COOLDOWN_MS }
    );
    if (res2.shouldTrigger) {
      throw new Error("Cooldown failed: Notification fired during active cooldown window");
    }
    if (res2.skippedReason !== "cooldown_active") {
      throw new Error(`Expected skippedReason 'cooldown_active', got '${res2.skippedReason}'`);
    }

    // Third drop at t2hours -> Cooldown expired, should trigger
    const res3 = await evaluateAndDispatchNotification(
      laptop,
      { previousOffer: offerC, currentOffer: offerD },
      { userInterestScore: 5, now: t2hours, cooldownMs: DEFAULT_COOLDOWN_MS }
    );
    if (!res3.shouldTrigger) {
      throw new Error(`Post-cooldown drop failed to trigger: ${res3.reason}`);
    }
  });

  // 10. No sensitive data stored
  test("10. No sensitive data stored (PII, credentials, payment data scrubbed)", () => {
    const typesFile = fs.readFileSync(path.join(__dirname, "../src/services/notifications/types.ts"), "utf-8");
    const consentFile = fs.readFileSync(path.join(__dirname, "../src/services/notifications/consent.ts"), "utf-8");

    const forbidden = ["password", "cardNumber", "cvv", "creditCard", "ssn", "apiKey", "authHeader", "secret"];
    for (const f of forbidden) {
      if (typesFile.includes(`${f}:`) || typesFile.includes(`${f}?:`)) {
        throw new Error(`Forbidden sensitive key '${f}' found in notifications types`);
      }
      if (consentFile.includes(`${f}:`) || consentFile.includes(`${f}?:`)) {
        throw new Error(`Forbidden sensitive key '${f}' found in notifications consent schema`);
      }
    }
  });

  // 11. No login required
  test("11. No login required (works fully anonymously with anonymousSessionId)", () => {
    clearNotificationConsent();
    grantNotificationConsent();

    const consent = notificationService.getConsent();
    if (!consent.anonymousUserId || !consent.anonymousUserId.startsWith("bw_anon_")) {
      throw new Error(`Invalid anonymous user ID: ${consent.anonymousUserId}`);
    }

    // Notifications function without user auth tokens or email accounts
    const history = notificationService.getHistory();
    if (!Array.isArray(history)) {
      throw new Error("Notification history must be an array");
    }
  });

  // Wait a small tick for any async tests
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("\n==================================================");
  console.log(`PHASE 39 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(console.error);
