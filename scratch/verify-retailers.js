const VALID_RETAILER_IDS = new Set([
  "amazon",
  "flipkart",
  "croma",
  "reliance-digital",
  "bestbuy-us",
  "amazon-us",
  "currys-uk",
  "amazon-uk",
  "amazon-de",
]);

const VALID_CURRENCIES = new Set(["INR", "USD", "GBP", "EUR", "OTHER"]);
const VALID_COUNTRY_CODES = new Set(["IN", "US", "UK", "EU", "OTHER"]);
const VALID_AVAILABILITY = new Set(["in-stock", "out-of-stock", "limited-stock", "pre-order"]);

function matchOfferToProduct(offer, product) {
  const reasons = [];

  if (offer.matchedSku && product.sku) {
    if (offer.matchedSku.toLowerCase().trim() !== product.sku.toLowerCase().trim()) {
      return {
        isMatch: false,
        confidence: "mismatch",
        reasons: [`SKU mismatch: offer (${offer.matchedSku}) does not match product SKU (${product.sku})`],
      };
    }
  }

  if (offer.matchedModel && product.model) {
    if (offer.matchedModel.toLowerCase().trim() !== product.model.toLowerCase().trim()) {
      return {
        isMatch: false,
        confidence: "mismatch",
        reasons: [`Model code mismatch: offer (${offer.matchedModel}) vs product (${product.model})`],
      };
    }
  }

  const offerText = (offer.offerText || "").toLowerCase();
  if (offerText.length > 0) {
    if (product.ramSize === 8 && (offerText.includes("16gb") || offerText.includes("32gb"))) {
      return { isMatch: false, reasons: ["Offer is for 16GB/32GB RAM but product requires 8GB"] };
    }
    if (product.ramSize === 16 && (offerText.includes("8gb") || offerText.includes("32gb"))) {
      return { isMatch: false, reasons: ["Offer is for 8GB/32GB RAM but product requires 16GB"] };
    }
    if (product.gpuCategory === "Integrated" && (offerText.includes("rtx 4050") || offerText.includes("dedicated gpu"))) {
      return { isMatch: false, reasons: ["Product is Integrated GPU, offer has Dedicated GPU"] };
    }
    if (product.gpuCategory === "NVIDIA" && (offerText.includes("intel uhd") || offerText.includes("integrated graphics only"))) {
      return { isMatch: false, reasons: ["Product requires dedicated NVIDIA GPU, offer specifies Integrated Graphics"] };
    }
  }

  return { isMatch: true, reasons: ["Matched"] };
}

function validateRetailerOffer(rawOffer, expectedProduct) {
  const issues = [];
  if (!rawOffer || typeof rawOffer !== "object") {
    return { isValid: false, offer: null, issues: [{ message: "Non-null object required" }] };
  }

  if (!rawOffer.retailerId || !VALID_RETAILER_IDS.has(rawOffer.retailerId)) {
    issues.push({ field: "retailerId", message: "Invalid retailerId" });
  }

  if (!rawOffer.retailerName || typeof rawOffer.retailerName !== "string" || rawOffer.retailerName.trim().length === 0) {
    issues.push({ field: "retailerName", message: "Invalid retailerName" });
  }

  if (rawOffer.price === null || rawOffer.price === undefined || typeof rawOffer.price !== "number" || isNaN(rawOffer.price) || rawOffer.price <= 0) {
    issues.push({ field: "price", message: "Price must be > 0" });
  }

  if (!rawOffer.currency || !VALID_CURRENCIES.has(rawOffer.currency)) {
    issues.push({ field: "currency", message: "Invalid currency" });
  }

  if (rawOffer.countryCode && !VALID_COUNTRY_CODES.has(rawOffer.countryCode)) {
    issues.push({ field: "countryCode", message: "Invalid countryCode" });
  }

  if (!rawOffer.availability || !VALID_AVAILABILITY.has(rawOffer.availability)) {
    issues.push({ field: "availability", message: "Invalid availability" });
  }

  if (rawOffer.productUrl) {
    try {
      const u = new URL(rawOffer.productUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") issues.push({ field: "productUrl" });
    } catch {
      issues.push({ field: "productUrl" });
    }
  }

  if (rawOffer.affiliateUrl) {
    try {
      const u = new URL(rawOffer.affiliateUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") issues.push({ field: "affiliateUrl" });
    } catch {
      issues.push({ field: "affiliateUrl" });
    }
  }

  if (!rawOffer.lastUpdated || typeof rawOffer.lastUpdated !== "string") {
    issues.push({ field: "lastUpdated" });
  }

  if (expectedProduct && issues.length === 0) {
    const m = matchOfferToProduct(rawOffer, expectedProduct);
    if (!m.isMatch) {
      issues.push({ field: "productMatch", message: m.reasons.join("; ") });
    }
  }

  const isValid = issues.length === 0;
  return { isValid, offer: isValid ? rawOffer : null, issues };
}

function getBestListedPrice(offers, targetCurrency, targetCountry) {
  if (!offers || !Array.isArray(offers) || offers.length === 0) return null;

  const eligible = offers.filter((o) => {
    const val = validateRetailerOffer(o);
    if (!val.isValid || !val.offer) return false;
    if (val.offer.availability === "out-of-stock") return false;
    if (targetCurrency && val.offer.currency !== targetCurrency) return false;
    if (targetCountry && val.offer.countryCode && val.offer.countryCode !== targetCountry) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const baseCurrency = targetCurrency || eligible[0].currency;
  const filtered = eligible.filter((o) => o.currency === baseCurrency);
  if (filtered.length === 0) return null;

  const sorted = [...filtered].sort((a, b) => a.price - b.price);
  return sorted[0] || null;
}

function formatPrice(amount, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return "Price unavailable";
  }
  const locale = currency === "USD" ? "en-US" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "en-IE" : "en-IN";
  const cur = currency === "OTHER" ? "USD" : currency;
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(amount);
}

// ==========================================
// TEST EXECUTION
// ==========================================
console.log("==================================================");
console.log("BUYWISE AI — PHASE 12B VALIDATION TEST RUNNER");
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

const sampleLaptop = {
  id: "lenovo-loq-15",
  brand: "Lenovo",
  model: "15IRH8",
  sku: "82XV00BRIN",
  ramSize: 16,
  gpuCategory: "NVIDIA",
};

// 1. Multiple valid offers
const offers1 = [
  { retailerId: "amazon", retailerName: "Amazon", price: 72999, currency: "INR", countryCode: "IN", availability: "in-stock", lastUpdated: "2026-08-18" },
  { retailerId: "flipkart", retailerName: "Flipkart", price: 70999, currency: "INR", countryCode: "IN", availability: "in-stock", lastUpdated: "2026-08-18" },
  { retailerId: "croma", retailerName: "Croma", price: 74499, currency: "INR", countryCode: "IN", availability: "in-stock", lastUpdated: "2026-08-18" },
];
const best1 = getBestListedPrice(offers1, "INR");
test("1. Multiple valid retailer offers returns lowest listed price (Flipkart 70999)", best1 && best1.retailerId === "flipkart" && best1.price === 70999);

// 2. One valid retailer offer
test("2. One valid retailer offer returns correctly", getBestListedPrice([offers1[0]], "INR")?.price === 72999);

// 3. No retailer offers
test("3. No retailer offers returns null", getBestListedPrice([], "INR") === null && getBestListedPrice(null) === null);

// 4. Null price
test("4. Null price offer rejected", !validateRetailerOffer({ ...offers1[0], price: null }).isValid && getBestListedPrice([{ ...offers1[0], price: null }]) === null);

// 5. Invalid price
test("5. Invalid negative price rejected", !validateRetailerOffer({ ...offers1[0], price: -100 }).isValid);

// 6. Unavailable retailer
const offers6 = [
  { ...offers1[0], price: 72999, availability: "in-stock" },
  { ...offers1[1], price: 65000, availability: "out-of-stock" },
];
test("6. Out-of-stock offer skipped in best listed price", getBestListedPrice(offers6, "INR")?.price === 72999);

// 7. Product URL only
test("7. Product URL only validated", validateRetailerOffer({ ...offers1[0], productUrl: "https://amazon.in/dp/123", affiliateUrl: null }).isValid);

// 8. Affiliate URL
test("8. Affiliate URL validated", validateRetailerOffer({ ...offers1[0], affiliateUrl: "https://amazon.in/dp/123?tag=buywise-21" }).isValid);

// 9. No URL (Coming soon)
test("9. No URL offer valid schema without creating fake URLs", validateRetailerOffer({ ...offers1[0], productUrl: null, affiliateUrl: null }).isValid);

// 10. Different currencies
const multiCur = [
  { ...offers1[0], price: 72999, currency: "INR" },
  { ...offers1[1], retailerId: "amazon-us", price: 899, currency: "USD", countryCode: "US" },
];
test("10. Isolated currency comparison (INR vs USD)", getBestListedPrice(multiCur, "INR")?.price === 72999 && getBestListedPrice(multiCur, "USD")?.price === 899);

// 11. Different markets
test("11. Market filtering by countryCode", getBestListedPrice(multiCur, "USD", "US")?.countryCode === "US");

// 12. Exact product configuration matching
test("12a. 8GB offer rejected for 16GB laptop", !validateRetailerOffer({ ...offers1[0], offerText: "8GB RAM version" }, sampleLaptop).isValid);
test("12b. Integrated GPU offer rejected for RTX laptop", !validateRetailerOffer({ ...offers1[0], offerText: "Intel UHD integrated graphics only" }, sampleLaptop).isValid);
test("12c. SKU mismatch rejected", !validateRetailerOffer({ ...offers1[0], matchedSku: "WRONG-SKU" }, sampleLaptop).isValid);

// 13. Currency formatting
test("13. formatPrice formats INR properly", formatPrice(54999, "INR").includes("54,999") && formatPrice(54999, "INR").includes("₹"));
test("14. formatPrice handles null gracefully", formatPrice(null, "INR") === "Price unavailable");
test("15. formatPrice handles USD properly", formatPrice(799, "USD").includes("799") && formatPrice(799, "USD").includes("$"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
