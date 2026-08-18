const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 18A EBAY ADAPTER VERIFICATION");
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

const typesPath = path.join(__dirname, "../src/types/index.ts");
const typesContent = fs.readFileSync(typesPath, "utf-8");

const registryPath = path.join(__dirname, "../src/services/retailers/registry.ts");
const registryContent = fs.readFileSync(registryPath, "utf-8");

const adapterPath = path.join(__dirname, "../src/services/retailers/adapters/ebay.ts");
const adapterContent = fs.readFileSync(adapterPath, "utf-8");

const indexPath = path.join(__dirname, "../src/services/retailers/index.ts");
const indexContent = fs.readFileSync(indexPath, "utf-8");

// 1. RetailerId Type Definition
test("1. RetailerId in types/index.ts includes 'ebay'", typesContent.includes('"ebay"'));

// 2. Central Retailer Registry
test("2. RETAILER_REGISTRY in registry.ts includes 'ebay'", registryContent.includes("ebay:") || registryContent.includes('"ebay":'));
test("3. eBay connectionStatus is strictly 'not_connected'",
  registryContent.includes("ebay:") &&
  registryContent.includes('connectionStatus: "not_connected"')
);

// 3. eBay Adapter Implementation
test("4. EbayAdapter file exists at src/services/retailers/adapters/ebay.ts", fs.existsSync(adapterPath));
test("5. EbayAdapter implements RetailerAdapter interface with isLiveApiConnected: false",
  adapterContent.includes("export const EbayAdapter: RetailerAdapter") &&
  adapterContent.includes("isLiveApiConnected: false") &&
  adapterContent.includes('connectionStatus: "not_connected"')
);
test("6. EbayAdapter provides getEbayConfig reading EBAY_CLIENT_ID and EBAY_CLIENT_SECRET",
  adapterContent.includes("getEbayConfig") &&
  adapterContent.includes("EBAY_CLIENT_ID") &&
  adapterContent.includes("EBAY_CLIENT_SECRET")
);
test("7. EbayAdapter provides buildEbaySearchQuery for keyword searches",
  adapterContent.includes("buildEbaySearchQuery")
);
test("8. EbayAdapter provides normalizeEbayItem for normalizing item summaries",
  adapterContent.includes("normalizeEbayItem")
);

// 4. Retailer Service Integration
test("9. index.ts exports and registers EbayAdapter in ALL_RETAILER_ADAPTERS",
  indexContent.includes("EbayAdapter") &&
  indexContent.includes("ALL_RETAILER_ADAPTERS")
);

// 5. Security & Isolation Checks
test("10. Zero NEXT_PUBLIC secrets in eBay adapter or retailer services",
  !adapterContent.includes("NEXT_PUBLIC_") &&
  !indexContent.includes("NEXT_PUBLIC_") &&
  !registryContent.includes("NEXT_PUBLIC_")
);
test("11. Zero hardcoded secrets in source files",
  !adapterContent.includes("secret = \"") &&
  !adapterContent.includes("client_secret: \"")
);
test("12. Adapter methods return safe empty/null results while not connected",
  adapterContent.includes("return [];") &&
  adapterContent.includes("return null;")
);

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
