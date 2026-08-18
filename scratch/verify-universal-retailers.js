const RETAILER_REGISTRY = {
  amazon: { id: "amazon", name: "Amazon India", countryCode: "IN", currency: "INR" },
  flipkart: { id: "flipkart", name: "Flipkart", countryCode: "IN", currency: "INR" },
  croma: { id: "croma", name: "Croma", countryCode: "IN", currency: "INR" },
  "reliance-digital": { id: "reliance-digital", name: "Reliance Digital", countryCode: "IN", currency: "INR" },
  "vijay-sales": { id: "vijay-sales", name: "Vijay Sales", countryCode: "IN", currency: "INR" },
  "lenovo-store": { id: "lenovo-store", name: "Lenovo Official Store", countryCode: "IN", currency: "INR" },
};

function getBestListedPrice(offers, targetCurrency = "INR") {
  if (!offers || !Array.isArray(offers) || offers.length === 0) return null;
  const eligible = offers.filter((o) => {
    if (!o.price || o.price <= 0 || typeof o.price !== "number") return false;
    if (o.availability === "out-of-stock") return false;
    if (targetCurrency && o.currency !== targetCurrency) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => a.price - b.price);
  return eligible[0];
}

console.log("==================================================");
console.log("BUYWISE AI — UNIVERSAL RETAILER ENGINE TEST RUNNER");
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

// 1. Registry
test("1. Central Retailer Registry defined", Object.keys(RETAILER_REGISTRY).length >= 6);

// 2. Single retailer
const o1 = { retailerId: "amazon", retailerName: "Amazon India", price: 31490, currency: "INR", availability: "in-stock" };
test("2. Single retailer offer best price returns Amazon 31490", getBestListedPrice([o1])?.price === 31490);

// 3. Two retailers
const o2 = { retailerId: "flipkart", retailerName: "Flipkart", price: 31990, currency: "INR", availability: "in-stock" };
test("3. Two retailers best price returns lowest (Amazon 31490)", getBestListedPrice([o1, o2])?.price === 31490);

// 4. Five retailers (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales)
const o3 = { retailerId: "croma", retailerName: "Croma", price: 32490, currency: "INR", availability: "in-stock" };
const o4 = { retailerId: "reliance-digital", retailerName: "Reliance Digital", price: 32990, currency: "INR", availability: "in-stock" };
const o5 = { retailerId: "vijay-sales", retailerName: "Vijay Sales", price: 30990, currency: "INR", availability: "in-stock" };
const multi = [o1, o2, o3, o4, o5];
test("5. Five retailers best price returns lowest (Vijay Sales 30990)", getBestListedPrice(multi)?.price === 30990 && getBestListedPrice(multi)?.retailerId === "vijay-sales");

// 5. No retailers
test("5. Empty retailer list returns null", getBestListedPrice([]) === null);

// 6. Out of stock listing skipped
const oos = { retailerId: "vijay-sales", retailerName: "Vijay Sales", price: 28990, currency: "INR", availability: "out-of-stock" };
test("6. Out of stock offer skipped in Best Listed Price", getBestListedPrice([o1, oos])?.price === 31490);

// 7. Button Label Logic
function getButtonLabel(offer) {
  if (offer.affiliateUrl) return `Buy on ${offer.retailerName} →`;
  if (offer.productUrl) return `View on ${offer.retailerName} →`;
  return "Coming soon";
}
test("7. Button label logic for Affiliate URL", getButtonLabel({ ...o1, affiliateUrl: "https://amazon.in/dp/123" }) === "Buy on Amazon India →");
test("8. Button label logic for Product URL only", getButtonLabel({ ...o1, productUrl: "https://amazon.in/dp/123" }) === "View on Amazon India →");
test("9. Button label logic for No URL", getButtonLabel(o1) === "Coming soon");

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
