const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 15 UNIVERSAL RETAILER FRAMEWORK");
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

// 1. Check types for RetailerConnectionStatus and RetailerDataSource
const typesPath = path.join(__dirname, "../src/types/index.ts");
const typesContent = fs.readFileSync(typesPath, "utf-8");

test("1. RetailerConnectionStatus type present in types/index.ts", typesContent.includes("RetailerConnectionStatus"));
test("2. RetailerDataSource type present in types/index.ts", typesContent.includes("RetailerDataSource"));
test("3. RetailerInfo includes connectionStatus and dataSourceType", typesContent.includes("connectionStatus: RetailerConnectionStatus") && typesContent.includes("dataSourceType: RetailerDataSource"));

// 2. Check RetailerAdapter interface in services/retailers/types.ts
const adapterTypesPath = path.join(__dirname, "../src/services/retailers/types.ts");
const adapterTypesContent = fs.readFileSync(adapterTypesPath, "utf-8");

test("4. RetailerAdapter supports searchProducts, getProduct, getOffers", adapterTypesContent.includes("searchProducts?") && adapterTypesContent.includes("getProduct?") && adapterTypesContent.includes("getOffers:"));
test("5. RetailerAdapter supports isMock flag and connectionStatus", adapterTypesContent.includes("isMock?: boolean") && adapterTypesContent.includes("connectionStatus: RetailerConnectionStatus"));

// 3. Check Central Retailer Registry in registry.ts
const registryPath = path.join(__dirname, "../src/services/retailers/registry.ts");
const registryContent = fs.readFileSync(registryPath, "utf-8");

test("6. Registry contains Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales",
  registryContent.includes("amazon:") &&
  registryContent.includes("flipkart:") &&
  registryContent.includes("croma:") &&
  registryContent.includes('"reliance-digital":') &&
  registryContent.includes('"vijay-sales":')
);
test("7. Current retailers configured with not_connected status", registryContent.includes('connectionStatus: "not_connected"'));

// 4. Check Central Retailer Service in services/retailers/index.ts
const servicePath = path.join(__dirname, "../src/services/retailers/index.ts");
const serviceContent = fs.readFileSync(servicePath, "utf-8");

test("8. Central retailerService object exported", serviceContent.includes("export const retailerService = {"));
test("9. Adapter execution handles errors gracefully with try/catch", serviceContent.includes("try {") && serviceContent.includes("catch"));

// 5. Check Exact Product Matcher in services/retailers/matcher.ts
const matcherPath = path.join(__dirname, "../src/services/retailers/matcher.ts");
const matcherContent = fs.readFileSync(matcherPath, "utf-8");

test("10. Matcher checks SKU/MPN", matcherContent.includes("matchedSku") && matcherContent.includes("product.sku"));
test("11. Matcher checks exact RAM size (8GB vs 16GB vs 32GB)", matcherContent.includes("product.ramSize === 8") && matcherContent.includes("product.ramSize === 16") && matcherContent.includes("product.ramSize === 32"));
test("12. Matcher checks GPU category and dedicated tier (RTX 4060 vs RTX 4050/Integrated)", matcherContent.includes("gpuCategory === \"Integrated\"") && matcherContent.includes("productGpu.includes(\"4060\")"));
test("13. Matcher checks storage size (512GB vs 1TB)", matcherContent.includes("512gb") && matcherContent.includes("1tb"));

// 6. Check No Client-Side Secrets / No fake credentials
test("14. No NEXT_PUBLIC secrets for retailer APIs in source code", !typesContent.includes("NEXT_PUBLIC_AMAZON_SECRET") && !registryContent.includes("NEXT_PUBLIC_"));

// 7. Check UI Integrations (WhereToBuy, Advisor, Compare)
const whereToBuyContent = fs.readFileSync(path.join(__dirname, "../src/components/laptops/WhereToBuy.tsx"), "utf-8");
test("15. Where to Buy uses retailer validation and Best Listed Price", whereToBuyContent.includes("validateRetailerOffers") && whereToBuyContent.includes("getBestListedPrice"));
test("16. Where to Buy empty state present ('Retailer pricing unavailable')", whereToBuyContent.includes("Retailer pricing unavailable"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
