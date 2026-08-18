import {
  calculateEffectivePrice,
  getBestEffectivePrice,
  checkOfferEligibility,
  calculateBestOfferCombination,
} from "../offers";
import { DiscountOffer } from "@/types";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, testName: string, message?: string) {
  if (!condition) {
    testResults.push({ name: testName, passed: false, error: message || "Assertion failed" });
  } else {
    testResults.push({ name: testName, passed: true });
  }
}

export function runAllPhase13Tests(): { total: number; passed: number; failed: number; results: TestResult[] } {
  // =========================================================================
  // TEST 1: No Offers
  // =========================================================================
  const calc1 = calculateEffectivePrice(74999, []);
  assert(
    calc1.listedPrice === 74999 &&
      calc1.payNowPrice === 74999 &&
      calc1.effectivePrice === 74999 &&
      calc1.appliedOffers.length === 0,
    "Test 1: No offers returns Listed Price as Pay Now and Effective Value"
  );

  // =========================================================================
  // TEST 2: One Retailer Instant Discount
  // =========================================================================
  const offer2: DiscountOffer = {
    offerId: "ret-disc-1",
    retailerId: "amazon",
    offerType: "retailer_discount",
    title: "Instant Store Discount",
    amount: 2000,
    currency: "INR",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc2 = calculateEffectivePrice(74999, [offer2]);
  assert(
    calc2.instantDiscount === 2000 && calc2.payNowPrice === 72999 && calc2.effectivePrice === 72999,
    "Test 2: Retailer instant discount reduces Pay Now price to ₹72,999"
  );

  // =========================================================================
  // TEST 3: Bank Discount
  // =========================================================================
  const offer3: DiscountOffer = {
    offerId: "bank-hdfc-5k",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "HDFC Bank Discount",
    amount: 5000,
    currency: "INR",
    bankName: "HDFC Bank",
    minPurchase: 50000,
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc3 = calculateEffectivePrice(74999, [offer3]);
  assert(
    calc3.instantDiscount === 5000 && calc3.payNowPrice === 69999,
    "Test 3: Bank discount ₹5,000 reduces Pay Now to ₹69,999"
  );

  // =========================================================================
  // TEST 4: Coupon Discount
  // =========================================================================
  const offer4: DiscountOffer = {
    offerId: "coupon-1k",
    retailerId: "amazon",
    offerType: "coupon",
    title: "Coupon Discount",
    amount: 1000,
    currency: "INR",
    couponCode: "SAVE1000",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc4 = calculateEffectivePrice(74999, [offer4], { userCoupon: "SAVE1000" });
  assert(
    calc4.instantDiscount === 1000 && calc4.payNowPrice === 73999,
    "Test 4: Valid coupon code applies ₹1,000 instant discount"
  );

  // =========================================================================
  // TEST 5: Cashback Handling (Separated from Pay Now)
  // =========================================================================
  const offer5: DiscountOffer = {
    offerId: "cb-2k",
    retailerId: "amazon",
    offerType: "cashback",
    title: "Amazon Pay Cashback",
    amount: 2000,
    currency: "INR",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc5 = calculateEffectivePrice(74999, [offer3, offer4, offer5], { userCoupon: "SAVE1000" });
  assert(
    calc5.instantDiscount === 6000 && // Bank 5000 + Coupon 1000
      calc5.payNowPrice === 68999 && // Charged at checkout
      calc5.potentialCashback === 2000 && // Potential post-purchase cashback
      calc5.effectivePrice === 66999, // Effective Value
    "Test 5: Cashback is NOT deducted from Pay Now (₹68,999), but reduces Effective Value (₹66,999)"
  );

  // =========================================================================
  // TEST 6: Exchange Offer (Max exchange value NOT deducted automatically)
  // =========================================================================
  const offer6: DiscountOffer = {
    offerId: "exch-8k",
    retailerId: "amazon",
    offerType: "exchange_offer",
    title: "Laptop Exchange",
    exchangeMaxAmount: 8000,
    currency: "INR",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc6NoVal = calculateEffectivePrice(74999, [offer6]);
  const calc6WithVal = calculateEffectivePrice(74999, [offer6], { exchangeValue: 4000 });
  assert(
    calc6NoVal.payNowPrice === 74999 &&
      calc6NoVal.potentialExchange === 0 &&
      calc6WithVal.potentialExchange === 4000,
    "Test 6: Exchange maximum is not deducted automatically; only verified exchangeValue is applied"
  );

  // =========================================================================
  // TEST 7: Multiple Stackable Offers
  // =========================================================================
  const calc7 = calculateEffectivePrice(74999, [offer2, offer3, offer4, offer5], { userCoupon: "SAVE1000" });
  assert(
    calc7.appliedOffers.length === 4 && calc7.instantDiscount === 8000 && calc7.potentialCashback === 2000,
    "Test 7: Multiple stackable offers combine deterministically"
  );

  // =========================================================================
  // TEST 8: Non-Stackable Offers (Picks optimal combination)
  // =========================================================================
  const offer8a: DiscountOffer = {
    offerId: "bank-nonstack-3k",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "Bank Offer A",
    amount: 3000,
    currency: "INR",
    stackable: false,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const offer8b: DiscountOffer = {
    offerId: "bank-nonstack-5k",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "Bank Offer B",
    amount: 5000,
    currency: "INR",
    stackable: false,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc8 = calculateEffectivePrice(74999, [offer8a, offer8b]);
  assert(
    calc8.instantDiscount === 5000 && calc8.appliedOffers.some((o) => o.offerId === "bank-nonstack-5k"),
    "Test 8: Picks optimal non-stackable bank offer (₹5,000 over ₹3,000)"
  );

  // =========================================================================
  // TEST 9: Minimum Purchase Condition
  // =========================================================================
  const minPurOffer: DiscountOffer = {
    offerId: "high-min-pur",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "High Min Purchase Offer",
    amount: 10000,
    currency: "INR",
    minPurchase: 100000, // ₹1,00,000 min purchase
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc9 = calculateEffectivePrice(74999, [minPurOffer]);
  assert(
    calc9.instantDiscount === 0 && calc9.excludedOffers.length === 1,
    "Test 9: Minimum purchase requirement of ₹1,00,000 rejects offer for ₹74,999 product"
  );

  // =========================================================================
  // TEST 10: Maximum Discount Capping
  // =========================================================================
  const cappedOffer: DiscountOffer = {
    offerId: "capped-pct",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "10% up to ₹3,000",
    percentage: 10, // 10% of 74999 = 7499.9
    maxDiscount: 3000, // Capped at 3000
    currency: "INR",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc10 = calculateEffectivePrice(74999, [cappedOffer]);
  assert(
    calc10.instantDiscount === 3000,
    "Test 10: Percentage discount capped at maxDiscount (₹3,000)"
  );

  // =========================================================================
  // TEST 11: Expired Offer
  // =========================================================================
  const expiredOffer: DiscountOffer = {
    offerId: "exp-offer",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "Expired Deal",
    amount: 5000,
    currency: "INR",
    startDate: "2026-01-01",
    endDate: "2026-05-01",
    stackable: true,
    verified: true,
    lastUpdated: "2026-08-18",
  };
  const calc11 = calculateEffectivePrice(74999, [expiredOffer], { currentDate: "2026-08-18" });
  assert(
    calc11.instantDiscount === 0 && calc11.excludedOffers.length === 1,
    "Test 11: Expired offer is excluded"
  );

  // =========================================================================
  // TEST 12: Unverified Offer (verified: false)
  // =========================================================================
  const unverifiedOffer: DiscountOffer = {
    offerId: "unver-deal",
    retailerId: "amazon",
    offerType: "bank_offer",
    title: "Fake Unverified Deal",
    amount: 15000,
    currency: "INR",
    stackable: true,
    verified: false,
    lastUpdated: "2026-08-18",
  };
  const calc12 = calculateEffectivePrice(74999, [unverifiedOffer]);
  assert(
    calc12.instantDiscount === 0 && calc12.excludedOffers.length === 1,
    "Test 12: Unverified offer rejected"
  );

  // =========================================================================
  // TEST 13: Multiple Retailers Best Effective Price
  // =========================================================================
  const retailerOptions = [
    {
      retailerId: "amazon" as const,
      retailerName: "Amazon India",
      listedPrice: 72990,
      currency: "INR" as const,
      countryCode: "IN" as const,
      offers: [offer3], // ₹5,000 bank offer -> effective 67990
    },
    {
      retailerId: "flipkart" as const,
      retailerName: "Flipkart",
      listedPrice: 70990,
      currency: "INR" as const,
      countryCode: "IN" as const,
      offers: [offer5], // ₹2,000 cashback -> effective 68990
    },
  ];
  const bestRetailer = getBestEffectivePrice(retailerOptions, "INR", "IN");
  assert(
    bestRetailer !== null && bestRetailer.retailerId === "amazon" && bestRetailer.calculation.effectivePrice === 67990,
    "Test 13: Best effective price returns Amazon (Effective ₹67,990 vs Flipkart ₹68,990)"
  );

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;

  return {
    total: testResults.length,
    passed: passedCount,
    failed: failedCount,
    results: testResults,
  };
}
