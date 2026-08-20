import fs from "fs";
import path from "path";
import {
  interestTracker,
  calculateProductInterestScores,
  calculateTimeDecayFactor,
  getTopInterestedProducts,
  getTopInterestedProductIds,
  recordInterestEvent,
  normalizeSearchQuery,
  containsSensitiveData,
  DEFAULT_INTEREST_WEIGHTS,
  DEFAULT_HALF_LIFE_DAYS,
  MS_PER_DAY,
  InterestEvent,
} from "../src/services/interest";
import { analytics } from "../src/lib/analytics";
import { LAPTOPS } from "../src/data/laptops";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 38: SMART INTEREST TRACKING SYSTEM VERIFICATION");
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
  // Setup clean slate for testing
  interestTracker.clear();
  interestTracker.setTrackingEnabled(true);

  // 1. product view recorded
  test("1. product view recorded", () => {
    interestTracker.clear();
    const productId = "acer-aspire-lite-al15-52";
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordProductView(productId, ts);
    if (!recorded) throw new Error("Failed to record product view");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error(`Expected 1 event, got ${events.length}`);
    if (events[0].type !== "product_view") throw new Error("Event type is not product_view");
    if ((events[0] as any).productId !== productId) throw new Error("Product ID does not match");
    if (events[0].timestamp !== ts) throw new Error("Timestamp does not match");
  });

  // 2. search recorded
  test("2. search recorded", () => {
    interestTracker.clear();
    const query = "  Lenovo LOQ 15 Gaming  <script>alert(1)</script> ";
    const matched = ["lenovo-loq-15iax9", "lenovo-ideapad-gaming-3"];
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordSearch(query, matched, ts);
    if (!recorded) throw new Error("Failed to record search");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error(`Expected 1 event, got ${events.length}`);
    const searchEvt = events[0] as any;
    if (searchEvt.type !== "search") throw new Error("Event type is not search");
    if (searchEvt.normalizedQuery !== "lenovo loq 15 gaming alert1") {
      throw new Error(`Unexpected normalized query: '${searchEvt.normalizedQuery}'`);
    }
    if (!Array.isArray(searchEvt.matchedProductIds) || searchEvt.matchedProductIds.length !== 2) {
      throw new Error("Matched product IDs not recorded properly");
    }
  });

  // 3. compare recorded
  test("3. compare recorded", () => {
    interestTracker.clear();
    const pids = ["acer-aspire-lite-al15-52", "lenovo-loq-15iax9", "asus-vivobook-15-x1504za"];
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordCompare(pids, ts);
    if (!recorded) throw new Error("Failed to record compare");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error("Expected 1 event");
    const compareEvt = events[0] as any;
    if (compareEvt.type !== "compare") throw new Error("Event type is not compare");
    if (compareEvt.productIds.length !== 3 || compareEvt.productIds[1] !== "lenovo-loq-15iax9") {
      throw new Error("Compare product IDs mismatch");
    }
  });

  // 4. advisor event recorded
  test("4. advisor event recorded", () => {
    interestTracker.clear();
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordAdvisorUse({
      category: "Programming",
      useCase: "Programming",
      budget: "50k-75k",
      recommendedProductIds: ["lenovo-loq-15iax9", "asus-tuf-gaming-f15"],
      timestamp: ts,
    });
    if (!recorded) throw new Error("Failed to record advisor use");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error("Expected 1 event");
    const advEvt = events[0] as any;
    if (advEvt.type !== "advisor_use") throw new Error("Event type is not advisor_use");
    if (advEvt.category !== "Programming" || advEvt.budget !== "50k-75k") {
      throw new Error("Advisor payload attributes mismatch");
    }
    if (advEvt.recommendedProductIds.length !== 2) {
      throw new Error("Recommended product IDs not recorded");
    }
  });

  // 5. retailer click recorded
  test("5. retailer click recorded", () => {
    interestTracker.clear();
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordRetailerClick("amazon", "lenovo-loq-15iax9", "affiliate", ts);
    if (!recorded) throw new Error("Failed to record retailer click");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error("Expected 1 event");
    const clickEvt = events[0] as any;
    if (clickEvt.type !== "retailer_click") throw new Error("Event type is not retailer_click");
    if (clickEvt.retailerId !== "amazon" || clickEvt.productId !== "lenovo-loq-15iax9") {
      throw new Error("Retailer click payload mismatch");
    }
  });

  // 6. feedback event recorded
  test("6. feedback event recorded", () => {
    interestTracker.clear();
    const ts = new Date().toISOString();

    const recorded = interestTracker.recordFeedback({
      productId: "apple-macbook-air-m2",
      rating: 5,
      category: "Recommendation",
      timestamp: ts,
    });
    if (!recorded) throw new Error("Failed to record feedback");

    const events = interestTracker.getEvents();
    if (events.length !== 1) throw new Error("Expected 1 event");
    const fbEvt = events[0] as any;
    if (fbEvt.type !== "feedback_submit") throw new Error("Event type is not feedback_submit");
    if (fbEvt.productId !== "apple-macbook-air-m2" || fbEvt.rating !== 5) {
      throw new Error("Feedback payload mismatch");
    }
  });

  // 7. interest score calculated
  test("7. interest score calculated", () => {
    interestTracker.clear();
    const now = new Date("2026-08-20T12:00:00Z");
    const nowIso = now.toISOString();

    // 1 product view (+1), 1 compare (+3), 1 retailer click (+5) for 'lenovo-loq-15iax9' => total 9
    interestTracker.recordProductView("lenovo-loq-15iax9", nowIso);
    interestTracker.recordCompare(["lenovo-loq-15iax9", "acer-aspire-lite-al15-52"], nowIso);
    interestTracker.recordRetailerClick("amazon", "lenovo-loq-15iax9", "affiliate", nowIso);

    const scores = calculateProductInterestScores(interestTracker.getEvents(), { now });
    const lenovoScore = scores.find((s) => s.productId === "lenovo-loq-15iax9");
    const acerScore = scores.find((s) => s.productId === "acer-aspire-lite-al15-52");

    if (!lenovoScore || lenovoScore.score !== 9) {
      throw new Error(`Expected score 9 for lenovo-loq-15iax9, got ${lenovoScore?.score}`);
    }
    if (!acerScore || acerScore.score !== 3) {
      throw new Error(`Expected score 3 for acer-aspire-lite-al15-52, got ${acerScore?.score}`);
    }
    if (lenovoScore.breakdown.productViews !== 1 || lenovoScore.breakdown.compares !== 3 || lenovoScore.breakdown.retailerClicks !== 5) {
      throw new Error("Score breakdown does not match expected weight totals");
    }
  });

  // 8. repeated views increase score
  test("8. repeated views increase score (1st view = +1, 2nd view = +2, 3rd view = +2)", () => {
    interestTracker.clear();
    const now = new Date("2026-08-20T12:00:00Z");
    const nowIso = now.toISOString();

    // First view: +1
    interestTracker.recordProductView("apple-macbook-air-m2", nowIso);
    let scores = calculateProductInterestScores(interestTracker.getEvents(), { now });
    if (scores[0].score !== 1) throw new Error(`1st view should give score 1, got ${scores[0].score}`);

    // Second view: +2 => total 3
    interestTracker.recordProductView("apple-macbook-air-m2", nowIso);
    scores = calculateProductInterestScores(interestTracker.getEvents(), { now });
    if (scores[0].score !== 3) throw new Error(`2nd view should give total score 3, got ${scores[0].score}`);

    // Third view: +2 => total 5
    interestTracker.recordProductView("apple-macbook-air-m2", nowIso);
    scores = calculateProductInterestScores(interestTracker.getEvents(), { now });
    if (scores[0].score !== 5) throw new Error(`3rd view should give total score 5, got ${scores[0].score}`);
  });

  // 9. time decay works
  test("9. time decay works (half-life reduces older activity)", () => {
    const now = new Date("2026-08-20T12:00:00Z");
    const halfLifeDays = 7;
    const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * MS_PER_DAY).toISOString();

    // Event now: decay factor = 1.0
    const factorNow = calculateTimeDecayFactor(now.getTime(), now.getTime(), halfLifeDays * MS_PER_DAY);
    if (Math.abs(factorNow - 1.0) > 0.001) throw new Error(`Expected factor 1.0 for now, got ${factorNow}`);

    // Event 7 days ago (1 half life): decay factor = 0.5
    const factor7 = calculateTimeDecayFactor(new Date(sevenDaysAgo).getTime(), now.getTime(), halfLifeDays * MS_PER_DAY);
    if (Math.abs(factor7 - 0.5) > 0.001) throw new Error(`Expected factor 0.5 for 7 days ago, got ${factor7}`);

    // Event 14 days ago (2 half lives): decay factor = 0.25
    const factor14 = calculateTimeDecayFactor(new Date(fourteenDaysAgo).getTime(), now.getTime(), halfLifeDays * MS_PER_DAY);
    if (Math.abs(factor14 - 0.25) > 0.001) throw new Error(`Expected factor 0.25 for 14 days ago, got ${factor14}`);

    // Test with simulated events
    const mockEvents: InterestEvent[] = [
      {
        id: "evt_1",
        type: "retailer_click",
        productId: "laptop-old",
        retailerId: "amazon",
        timestamp: sevenDaysAgo,
        anonymousSessionId: "anon_test",
      },
      {
        id: "evt_2",
        type: "retailer_click",
        productId: "laptop-new",
        retailerId: "amazon",
        timestamp: now.toISOString(),
        anonymousSessionId: "anon_test",
      },
    ];

    const scored = calculateProductInterestScores(mockEvents, { now, halfLifeDays: 7 });
    const oldProduct = scored.find((s) => s.productId === "laptop-old");
    const newProduct = scored.find((s) => s.productId === "laptop-new");

    // Retailer click raw score = 5. Old one (7 days ago) should be decayed to 2.5
    if (!oldProduct || oldProduct.score !== 2.5) {
      throw new Error(`Expected decayed score 2.5 for old product, got ${oldProduct?.score}`);
    }
    if (!newProduct || newProduct.score !== 5) {
      throw new Error(`Expected fresh score 5 for new product, got ${newProduct?.score}`);
    }
  });

  // 10. no sensitive data stored
  test("10. no sensitive data stored", () => {
    const sensitiveTokens = ["password", "cvv", "creditcard", "secret", "apikey", "auth", "token"];
    for (const token of sensitiveTokens) {
      if (!containsSensitiveData(`user_${token}_123`)) {
        throw new Error(`containsSensitiveData failed to detect token '${token}'`);
      }
    }

    // Inspect files to verify no sensitive schema columns exist
    const typesFile = fs.readFileSync(path.join(__dirname, "../src/services/interest/types.ts"), "utf-8");
    const trackerFile = fs.readFileSync(path.join(__dirname, "../src/services/interest/tracker.ts"), "utf-8");

    const forbiddenFields = ["password", "cardNumber", "cvv", "creditCard", "ssn", "apiKey", "authHeader"];
    for (const f of forbiddenFields) {
      if (typesFile.includes(`${f}:`) || typesFile.includes(`${f}?:`)) {
        throw new Error(`Forbidden field '${f}' found in interest types schema`);
      }
    }

    if (!trackerFile.includes("FORBIDDEN_SENSITIVE_WORDS")) {
      throw new Error("Tracker missing sensitive word protection list");
    }
  });

  // 11. anonymous tracking works
  test("11. anonymous tracking works (anonymous session ID generated without PII)", () => {
    interestTracker.clear();
    const anonId = interestTracker.getAnonymousId();
    if (!anonId || !anonId.startsWith("bw_anon_")) {
      throw new Error(`Invalid anonymous ID format: ${anonId}`);
    }

    interestTracker.recordProductView("lenovo-loq-15iax9");
    const events = interestTracker.getEvents();
    if (events.length === 0 || events[0].anonymousSessionId !== anonId) {
      throw new Error("Event does not contain anonymousSessionId");
    }
  });

  // 12. no login required
  test("12. no login required (operates fully anonymously without auth tokens)", () => {
    // Check that tracker methods work seamlessly without any user context or login parameters
    interestTracker.clear();
    interestTracker.recordProductView("hp-victus-15-fa2500tx");
    interestTracker.recordSearch("HP Victus", ["hp-victus-15-fa2500tx"]);
    interestTracker.recordCompare(["hp-victus-15-fa2500tx", "lenovo-loq-15iax9"]);

    const top = getTopInterestedProducts(3);
    if (top.length === 0) {
      throw new Error("getTopInterestedProducts failed to return results without login");
    }
    if (top[0].laptop.id !== "hp-victus-15-fa2500tx") {
      throw new Error(`Expected hp-victus-15-fa2500tx at top, got ${top[0]?.laptop.id}`);
    }

    // Verify privacy opt-out works
    interestTracker.optOut();
    if (interestTracker.isTrackingEnabled()) {
      throw new Error("Opt-out did not disable tracking");
    }

    const recordedWhileOptedOut = interestTracker.recordProductView("apple-macbook-air-m2");
    if (recordedWhileOptedOut) {
      throw new Error("Tracking recorded event even after user opted out");
    }
    if (getTopInterestedProducts().length !== 0) {
      throw new Error("Opted out user should return empty top interested products");
    }

    // Re-enable tracking
    interestTracker.optIn();
    if (!interestTracker.isTrackingEnabled()) {
      throw new Error("Opt-in did not re-enable tracking");
    }
  });

  // 13. Integration with analytics library
  test("13. Integration with analytics dispatcher works", () => {
    interestTracker.clear();
    const laptopId = "asus-rog-zephyrus-g14-ga403ui";
    analytics.trackProductView({ productId: laptopId, productName: "ASUS ROG Zephyrus G14" });
    analytics.trackRetailerClick({ productId: laptopId, retailerId: "amazon", price: 149990 });
    analytics.trackFeedbackSubmit({ productId: laptopId, rating: 5, category: "Specs" });

    const top = getTopInterestedProducts(1);
    if (top.length === 0 || top[0].laptop.id !== laptopId) {
      throw new Error("Analytics dispatcher did not properly update interest tracking");
    }
    // Score: 1 (view) + 5 (retailer click) + 2 (feedback) = 8
    if (top[0].score !== 8) {
      throw new Error(`Expected score 8 from analytics dispatch, got ${top[0].score}`);
    }
  });

  // Wait a small tick for any async tests
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("\n==================================================");
  console.log(`PHASE 38 VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(console.error);
