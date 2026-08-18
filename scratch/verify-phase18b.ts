import fs from "fs";
import path from "path";
import { runQuickCommerceAdapterTests } from "../src/services/retailers/__tests__/quickcommerceAdapter.test";
import { QuickCommerceAdapter, getQuickCommerceConfig } from "../src/services/retailers/adapters/quickcommerce";

// Load .env.local if present in development without external dotenv dependency
const envLocalPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  });
}

console.log("==================================================");
console.log("BUYWISE AI — PHASE 18B QUICKCOMMERCE ADAPTER TESTS");
console.log("==================================================");

// 1. Run Unit Test Suite
const { total, passed, failed, results } = runQuickCommerceAdapterTests();

results.forEach((r, idx) => {
  const symbol = r.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${idx + 1}/${total}] ${symbol} : ${r.name}`);
  if (!r.passed && r.error) {
    console.log(`    Error: ${r.error}`);
  }
});

console.log("--------------------------------------------------");
console.log(`Unit Test Summary: ${passed}/${total} passed (${failed} failed)`);
console.log("==================================================");

async function runLiveSmokeTest() {
  const config = getQuickCommerceConfig();
  console.log("\n==================================================");
  console.log("PHASE 18B — REAL API SMOKE TEST (1 SINGLE CALL)");
  console.log("==================================================");

  if (!config.isConfigured || !config.apiKey) {
    console.log("⚠️ QUICKCOMMERCE_API_KEY is not configured in .env.local. Skipping live call.");
    console.log("==================================================");
    if (failed > 0) process.exit(1);
    else process.exit(0);
    return;
  }

  console.log("✓ QUICKCOMMERCE_API_KEY detected in environment (hidden for security)");
  console.log(`✓ Target Endpoint: ${config.endpoint}/search`);
  console.log("✓ Location Pincode: 560001 (Bengaluru)");
  console.log("✓ Query: 'Lenovo LOQ RTX 4060'");

  try {
    const query = "Lenovo LOQ RTX 4060";
    const startTime = Date.now();
    const items = await QuickCommerceAdapter.searchProducts!(query, { pincode: "560001" });
    const durationMs = Date.now() - startTime;

    console.log(`✓ Request completed in ${durationMs}ms`);
    console.log(`✓ Items returned: ${items.length}`);

    if (items.length > 0) {
      console.log("\nSample Normalized Item Summaries (Safe Fields Only):");
      items.slice(0, 3).forEach((it: any, i: number) => {
        const platformName = typeof it.platform === "object" && it.platform !== null ? it.platform.name : (it.platform || it.source || "Amazon");
        const priceVal = it.offer_price ?? it.price ?? it.current_price;
        console.log(`  [Item ${i + 1}] Platform: ${platformName}`);
        console.log(`           Title   : ${it.name || it.title || "N/A"}`);
        console.log(`           Price   : ₹${priceVal ? Number(priceVal).toLocaleString("en-IN") : "N/A"}`);
        console.log(`           In Stock: ${it.available !== false && it.in_stock !== false ? "Yes" : "No"}`);
      });
    } else {
      console.log("✓ API returned 0 matching live items for this specific query at this time (empty response handled safely)");
    }

    console.log("==================================================");
  } catch (err: any) {
    console.error(`❌ Live API smoke test encountered error: ${err.message}`);
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveSmokeTest();
