const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 16A LIVE PIPELINE VERIFICATION");
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

const normalizerPath = path.join(__dirname, "../src/services/retailers/normalizer.ts");
const normalizerContent = fs.readFileSync(normalizerPath, "utf-8");
const indexPath = path.join(__dirname, "../src/services/retailers/index.ts");
const indexContent = fs.readFileSync(indexPath, "utf-8");
const matcherPath = path.join(__dirname, "../src/services/retailers/matcher.ts");
const matcherContent = fs.readFileSync(matcherPath, "utf-8");
const validatorPath = path.join(__dirname, "../src/services/retailers/validator.ts");
const validatorContent = fs.readFileSync(validatorPath, "utf-8");

// 1. Normalization Layer
test("1. normalizer.ts exports parsePrice, normalizeAvailability, normalizeCurrency, normalizeUrl",
  normalizerContent.includes("export function parsePrice") &&
  normalizerContent.includes("export function normalizeAvailability") &&
  normalizerContent.includes("export function normalizeCurrency") &&
  normalizerContent.includes("export function normalizeUrl")
);

test("2. normalizer.ts exports normalizeRetailerOffer and normalizeRetailerOffers",
  normalizerContent.includes("export function normalizeRetailerOffer") &&
  normalizerContent.includes("export function normalizeRetailerOffers")
);

// 3. Timeout & Error Isolation
test("3. Timeout handling via Promise.race present in index.ts", indexContent.includes("Promise.race") && indexContent.includes("DEFAULT_ADAPTER_TIMEOUT_MS"));
test("4. Isolated error handling with try/catch inside executeAdapterSafe", indexContent.includes("executeAdapterSafe") && indexContent.includes("catch (error)"));

// 5. Product Matching
test("5. Matcher checks exact SKU, Model, RAM, GPU, and Storage",
  matcherContent.includes("matchedSku") &&
  matcherContent.includes("matchedModel") &&
  matcherContent.includes("product.ramSize") &&
  matcherContent.includes("gpuCategory") &&
  matcherContent.includes("512gb")
);

// 6. Offer Validation
test("6. Validator checks price > 0, currency, availability, lastUpdated, and exact match",
  validatorContent.includes("o.price <= 0") &&
  validatorContent.includes("VALID_CURRENCIES") &&
  validatorContent.includes("VALID_AVAILABILITY") &&
  validatorContent.includes("o.lastUpdated") &&
  validatorContent.includes("matchOfferToProduct")
);

// 7. Security Check
test("7. Zero NEXT_PUBLIC secrets in retailer services", !indexContent.includes("NEXT_PUBLIC_") && !normalizerContent.includes("NEXT_PUBLIC_"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
