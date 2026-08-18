function checkOfferEligibility(offer, listedPrice, context = {}) {
  if (!offer.verified && !offer.isMock) {
    return { isEligible: false, reason: "Offer is unverified", calculatedDiscount: 0 };
  }

  if (offer.minPurchase && listedPrice < offer.minPurchase) {
    return { isEligible: false, reason: `Min purchase ₹${offer.minPurchase} required`, calculatedDiscount: 0 };
  }

  if (context.currentDate) {
    if (offer.startDate && context.currentDate < offer.startDate) {
      return { isEligible: false, reason: "Offer not started", calculatedDiscount: 0 };
    }
    if (offer.endDate && context.currentDate > offer.endDate) {
      return { isEligible: false, reason: "Offer expired", calculatedDiscount: 0 };
    }
  }

  if (offer.bankName && context.bankName) {
    const ob = offer.bankName.toLowerCase();
    const ub = context.bankName.toLowerCase();
    if (!ob.includes(ub) && !ub.includes(ob)) {
      return { isEligible: false, reason: "Bank mismatch", calculatedDiscount: 0 };
    }
  }

  if (offer.offerType === "coupon" && offer.couponCode && context.userCoupon) {
    if (offer.couponCode.toLowerCase().trim() !== context.userCoupon.toLowerCase().trim()) {
      return { isEligible: false, reason: "Coupon code mismatch", calculatedDiscount: 0 };
    }
  }

  let calculatedDiscount = 0;
  if (offer.offerType === "exchange_offer") {
    calculatedDiscount = context.exchangeValue || 0;
  } else if (typeof offer.amount === "number" && offer.amount > 0) {
    calculatedDiscount = offer.amount;
  } else if (typeof offer.percentage === "number" && offer.percentage > 0) {
    const raw = (offer.percentage / 100) * listedPrice;
    calculatedDiscount = offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw;
  }

  return { isEligible: true, calculatedDiscount: Math.round(calculatedDiscount) };
}

function calculateBestOfferCombination(offers, listedPrice, context = {}) {
  const appliedOffers = [];
  const excludedOffers = [];

  const eligibleItems = [];
  for (const offer of offers || []) {
    const res = checkOfferEligibility(offer, listedPrice, context);
    if (res.isEligible) {
      eligibleItems.push({ offer, value: res.calculatedDiscount });
    } else {
      excludedOffers.push({ offer, reason: res.reason || "Ineligible" });
    }
  }

  const stackable = eligibleItems.filter((i) => i.offer.stackable);
  const nonStackable = eligibleItems.filter((i) => !i.offer.stackable);

  let instantDiscount = 0;
  let cashbackAmount = 0;
  let exchangeAmount = 0;

  for (const item of stackable) {
    appliedOffers.push(item.offer);
    if (item.offer.offerType === "cashback") cashbackAmount += item.value;
    else if (item.offer.offerType === "exchange_offer") exchangeAmount += item.value;
    else instantDiscount += item.value;
  }

  if (nonStackable.length > 0) {
    nonStackable.sort((a, b) => b.value - a.value);
    const pickedTypes = new Set();
    for (const item of nonStackable) {
      if (!pickedTypes.has(item.offer.offerType)) {
        pickedTypes.add(item.offer.offerType);
        appliedOffers.push(item.offer);
        if (item.offer.offerType === "cashback") cashbackAmount += item.value;
        else if (item.offer.offerType === "exchange_offer") exchangeAmount += item.value;
        else instantDiscount += item.value;
      } else {
        excludedOffers.push({ offer: item.offer, reason: "Replaced by higher value non-stackable offer" });
      }
    }
  }

  return {
    appliedOffers,
    excludedOffers,
    instantDiscount: Math.min(instantDiscount, listedPrice),
    cashbackAmount,
    exchangeAmount,
  };
}

function calculateEffectivePrice(listedPrice, offers, context = {}) {
  if (!listedPrice || listedPrice <= 0) {
    return { listedPrice: 0, instantDiscount: 0, payNowPrice: 0, potentialCashback: 0, potentialExchange: 0, effectivePrice: 0, savings: 0, appliedOffers: [], excludedOffers: [] };
  }

  const combo = calculateBestOfferCombination(offers, listedPrice, context);
  const payNowPrice = Math.max(0, listedPrice - combo.instantDiscount);
  const effectivePrice = Math.max(0, payNowPrice - combo.cashbackAmount);
  const savings = Math.max(0, listedPrice - effectivePrice);

  return {
    listedPrice,
    instantDiscount: combo.instantDiscount,
    payNowPrice,
    potentialCashback: combo.cashbackAmount,
    potentialExchange: combo.exchangeAmount,
    effectivePrice,
    savings,
    appliedOffers: combo.appliedOffers,
    excludedOffers: combo.excludedOffers,
  };
}

function getBestEffectivePrice(retailerOptions, targetCurrency = "INR", targetCountry, context = {}) {
  if (!retailerOptions || retailerOptions.length === 0) return null;

  const eligible = retailerOptions.filter((r) => {
    if (!r.listedPrice || r.listedPrice <= 0) return false;
    if (targetCurrency && r.currency !== targetCurrency) return false;
    if (targetCountry && r.countryCode && r.countryCode !== targetCountry) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const evaluated = eligible.map((r) => ({
    ...r,
    calculation: calculateEffectivePrice(r.listedPrice, r.offers || [], context),
  }));

  evaluated.sort((a, b) => a.calculation.effectivePrice - b.calculation.effectivePrice);
  return evaluated[0] || null;
}

// ==========================================
// TEST SUITE EXECUTION
// ==========================================
console.log("==================================================");
console.log("BUYWISE AI — PHASE 13 EFFECTIVE PRICE TEST RUNNER");
console.log("==================================================");

let pass = 0, fail = 0;
function test(name, cond) {
  if (cond) {
    console.log(`✅ PASS: ${name}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    fail++;
  }
}

// 1. No offers
const calc1 = calculateEffectivePrice(74999, []);
test("1. No offers: Pay Now & Effective Value equal Listed Price (74999)", calc1.payNowPrice === 74999 && calc1.effectivePrice === 74999);

// 2. One retailer discount
const offRetailer = { offerId: "r1", retailerId: "amazon", offerType: "retailer_discount", amount: 2000, stackable: true, verified: true };
const calc2 = calculateEffectivePrice(74999, [offRetailer]);
test("2. Retailer instant discount reduces Pay Now to ₹72,999", calc2.payNowPrice === 72999);

// 3. Bank offer
const offBank = { offerId: "b1", retailerId: "amazon", offerType: "bank_offer", amount: 5000, bankName: "HDFC Bank", minPurchase: 50000, stackable: true, verified: true };
const calc3 = calculateEffectivePrice(74999, [offBank]);
test("3. HDFC Bank discount ₹5,000 reduces Pay Now to ₹69,999", calc3.payNowPrice === 69999);

// 4. Coupon
const offCoupon = { offerId: "c1", retailerId: "amazon", offerType: "coupon", amount: 1000, couponCode: "BW1000", stackable: true, verified: true };
const calc4 = calculateEffectivePrice(74999, [offCoupon], { userCoupon: "BW1000" });
test("4. Valid coupon reduces Pay Now by ₹1,000", calc4.payNowPrice === 73999);

// 5. Cashback (Separated from Pay Now)
const offCashback = { offerId: "cb1", retailerId: "amazon", offerType: "cashback", amount: 2000, stackable: true, verified: true };
const calc5 = calculateEffectivePrice(74999, [offBank, offCoupon, offCashback], { userCoupon: "BW1000" });
test("5. Cashback is NOT deducted from Pay Now (₹68,999), but reduces Effective Value (₹66,999)", calc5.payNowPrice === 68999 && calc5.potentialCashback === 2000 && calc5.effectivePrice === 66999);

// 6. Exchange offer (Max exchange not deducted automatically)
const offExch = { offerId: "ex1", retailerId: "amazon", offerType: "exchange_offer", exchangeMaxAmount: 8000, stackable: true, verified: true };
const calc6a = calculateEffectivePrice(74999, [offExch]);
const calc6b = calculateEffectivePrice(74999, [offExch], { exchangeValue: 4000 });
test("6. Exchange max is not deducted automatically; only verified exchangeValue applied", calc6a.payNowPrice === 74999 && calc6a.potentialExchange === 0 && calc6b.potentialExchange === 4000);

// 7. Multiple stackable offers
const calc7 = calculateEffectivePrice(74999, [offRetailer, offBank, offCoupon, offCashback], { userCoupon: "BW1000" });
test("7. Multiple stackable offers combine correctly (Instant ₹8,000, Cashback ₹2,000)", calc7.instantDiscount === 8000 && calc7.potentialCashback === 2000);

// 8. Non-stackable offers
const offNonStackA = { offerId: "ns1", retailerId: "amazon", offerType: "bank_offer", amount: 3000, stackable: false, verified: true };
const offNonStackB = { offerId: "ns2", retailerId: "amazon", offerType: "bank_offer", amount: 5000, stackable: false, verified: true };
const calc8 = calculateEffectivePrice(74999, [offNonStackA, offNonStackB]);
test("8. Picks optimal non-stackable offer (₹5,000 over ₹3,000)", calc8.instantDiscount === 5000 && calc8.appliedOffers[0].offerId === "ns2");

// 9. Minimum purchase condition
const offHighMin = { offerId: "hm1", retailerId: "amazon", offerType: "bank_offer", amount: 10000, minPurchase: 100000, stackable: true, verified: true };
const calc9 = calculateEffectivePrice(74999, [offHighMin]);
test("9. Minimum purchase of ₹1,00,000 rejects offer for ₹74,999 product", calc9.instantDiscount === 0 && calc9.excludedOffers.length === 1);

// 10. Maximum discount capping
const offCapped = { offerId: "cp1", retailerId: "amazon", offerType: "bank_offer", percentage: 10, maxDiscount: 3000, stackable: true, verified: true };
const calc10 = calculateEffectivePrice(74999, [offCapped]);
test("10. 10% discount capped at maxDiscount (₹3,000)", calc10.instantDiscount === 3000);

// 11. Expired offer
const offExpired = { offerId: "exp1", retailerId: "amazon", offerType: "bank_offer", amount: 5000, startDate: "2026-01-01", endDate: "2026-05-01", stackable: true, verified: true };
const calc11 = calculateEffectivePrice(74999, [offExpired], { currentDate: "2026-08-18" });
test("11. Expired offer excluded", calc11.instantDiscount === 0);

// 12. Unverified offer
const offUnver = { offerId: "unv1", retailerId: "amazon", offerType: "bank_offer", amount: 15000, stackable: true, verified: false };
const calc12 = calculateEffectivePrice(74999, [offUnver]);
test("12. Unverified offer excluded", calc12.instantDiscount === 0);

// 13. Multiple retailers best effective price
const opts = [
  { retailerId: "amazon", retailerName: "Amazon", listedPrice: 72990, currency: "INR", offers: [offBank] }, // 72990 - 5000 = 67990
  { retailerId: "flipkart", retailerName: "Flipkart", listedPrice: 70990, currency: "INR", offers: [offCashback] }, // 70990 - 2000 = 68990
];
const bestEff = getBestEffectivePrice(opts, "INR");
test("13. getBestEffectivePrice returns Amazon (Effective ₹67,990 vs Flipkart ₹68,990)", bestEff && bestEff.retailerId === "amazon" && bestEff.calculation.effectivePrice === 67990);

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
