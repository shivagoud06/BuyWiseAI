import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQuery,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer } from "../src/services/retailers/validator";
import { resolveRetailerOfferStatus } from "../src/services/retailers/index";

// Load environment variables from .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        process.env[k] = v;
      }
    }
  });
}

async function runEndToEndDiagnostic() {
  console.log("==================================================");
  console.log("BUYWISE AI — END-TO-END BUY NOW DIAGNOSTIC TRACE");
  console.log("==================================================");

  // 1. Select First Real Catalog Laptop from src/data/laptops.ts
  const selectedLaptop = LAPTOPS.find((l) => !l.isUpcoming) || LAPTOPS[0];
  console.log("\n[1. Selected Catalog Laptop]");
  console.log(`  ✓ Catalog ID: ${selectedLaptop.id}`);
  console.log(`  ✓ Catalog Name: ${selectedLaptop.name}`);
  console.log(`  ✓ Brand: ${selectedLaptop.brand}`);
  console.log(`  ✓ Model: ${selectedLaptop.model}`);
  console.log(`  ✓ CPU: ${selectedLaptop.processor}`);
  console.log(`  ✓ RAM: ${selectedLaptop.ramSize}GB`);
  console.log(`  ✓ GPU: ${selectedLaptop.gpu}`);
  console.log(`  ✓ Storage: ${selectedLaptop.storage}`);
  console.log(`  ✓ Reference Price: ₹${selectedLaptop.price}`);

  // 2. Query Generation Analysis
  const rawGeneratedQuery = buildQuickCommerceSearchQuery(selectedLaptop);
  console.log("\n[2. Search Query Generation]");
  console.log(`  ✓ Current Query: "${rawGeneratedQuery}"`);

  // Also prepare a clean brand + model family query for comparison
  const cleanFamilyQuery = `${selectedLaptop.brand} ${selectedLaptop.name.replace(selectedLaptop.brand, "").trim()}`.trim();
  console.log(`  ✓ Clean Family Query: "${cleanFamilyQuery}"`);

  const config = getQuickCommerceConfig();
  console.log("\n[3. QuickCommerce Configuration]");
  console.log(`  ✓ Configured: ${config.isConfigured}`);
  console.log(`  ✓ Endpoint: ${config.endpoint}`);
  console.log(`  ✓ API Key: [PROTECTED - Present: ${!!config.apiKey}]`);

  if (!config.isConfigured || !config.apiKey) {
    console.log("❌ API Key missing in environment");
    return;
  }

  // 4. Test Platform: Amazon
  console.log("\n==================================================");
  console.log("[4. Tracing Amazon Platform]");
  console.log("==================================================");

  try {
    // Try current query first
    console.log(`Querying Amazon with: "${rawGeneratedQuery}"...`);
    let amazonItems = (await QuickCommerceAdapter.searchProducts!(rawGeneratedQuery, {
      platform: "Amazon",
    })) as RawQuickCommerceProduct[];

    console.log(`  ✓ Amazon Result Count (current query): ${amazonItems.length}`);

    // If 0, try clean query
    if (amazonItems.length === 0 && cleanFamilyQuery !== rawGeneratedQuery) {
      console.log(`Querying Amazon with fallback clean query: "${cleanFamilyQuery}"...`);
      amazonItems = (await QuickCommerceAdapter.searchProducts!(cleanFamilyQuery, {
        platform: "Amazon",
      })) as RawQuickCommerceProduct[];
      console.log(`  ✓ Amazon Result Count (clean query): ${amazonItems.length}`);
    }

    if (amazonItems.length > 0) {
      const item = amazonItems[0];
      console.log("\n[Amazon First Returned Product]");
      console.log(`  ✓ Product Title: ${item.title || item.name || "N/A"}`);
      console.log(`  ✓ Product ID: ${item.id || item.sku || "N/A"}`);
      console.log(`  ✓ Brand: ${item.brand || "N/A"}`);
      console.log(`  ✓ Price: ₹${item.offer_price || item.price || "N/A"}`);
      console.log(`  ✓ MRP: ₹${item.mrp || "N/A"}`);
      console.log(`  ✓ Available: ${item.available !== false && item.in_stock !== false}`);
      console.log(`  ✓ URL: ${item.deeplink || item.url || item.product_url ? "Present" : "Missing"}`);

      // Normalization
      const normalized = normalizeQuickCommerceItem(item);
      console.log(`\n  ✓ Normalization Result: ${normalized ? "SUCCESS" : "REJECTED"}`);

      if (normalized) {
        // Matcher
        const matchEval = matchOfferToProduct(normalized, selectedLaptop);
        console.log(`  ✓ Matcher Result: ${matchEval.isMatch ? "EXACT MATCH" : "MISMATCH"}`);
        console.log(`  ✓ Matcher Reasons: ${matchEval.reasons.join(", ")}`);

        // Validator
        const valEval = validateRetailerOffer(normalized, selectedLaptop);
        console.log(`  ✓ Validator Result: ${valEval.isValid ? "VALID" : "INVALID"}`);
        if (!valEval.isValid) {
          console.log(`  ✓ Validator Issues: ${valEval.issues.map((i) => `${i.field}: ${i.message}`).join("; ")}`);
        }

        // Final status resolver
        const statusResult = resolveRetailerOfferStatus(valEval.isValid ? normalized : null);
        console.log(`  ✓ Final UI Status: ${statusResult.status} ("${statusResult.buttonLabel}")`);
      }
    } else {
      console.log("  ✓ Amazon returned 0 results for this query.");
      const statusResult = resolveRetailerOfferStatus(null);
      console.log(`  ✓ Final UI Status: ${statusResult.status} ("${statusResult.buttonLabel}")`);
    }
  } catch (err: any) {
    console.error("  ❌ Amazon trace error:", err.message);
  }

  // 5. Test Platform: Flipkart
  console.log("\n==================================================");
  console.log("[5. Tracing Flipkart Platform]");
  console.log("==================================================");

  try {
    // Try current query first
    console.log(`Querying Flipkart with: "${rawGeneratedQuery}"...`);
    let flipkartItems = (await QuickCommerceAdapter.searchProducts!(rawGeneratedQuery, {
      platform: "Flipkart",
    })) as RawQuickCommerceProduct[];

    console.log(`  ✓ Flipkart Result Count (current query): ${flipkartItems.length}`);

    // If 0, try clean query
    if (flipkartItems.length === 0 && cleanFamilyQuery !== rawGeneratedQuery) {
      console.log(`Querying Flipkart with fallback clean query: "${cleanFamilyQuery}"...`);
      flipkartItems = (await QuickCommerceAdapter.searchProducts!(cleanFamilyQuery, {
        platform: "Flipkart",
      })) as RawQuickCommerceProduct[];
      console.log(`  ✓ Flipkart Result Count (clean query): ${flipkartItems.length}`);
    }

    if (flipkartItems.length > 0) {
      const item = flipkartItems[0];
      console.log("\n[Flipkart First Returned Product]");
      console.log(`  ✓ Product Title: ${item.title || item.name || "N/A"}`);
      console.log(`  ✓ Product ID: ${item.id || item.sku || "N/A"}`);
      console.log(`  ✓ Brand: ${item.brand || "N/A"}`);
      console.log(`  ✓ Price: ₹${item.offer_price || item.price || "N/A"}`);
      console.log(`  ✓ MRP: ₹${item.mrp || "N/A"}`);
      console.log(`  ✓ Available: ${item.available !== false && item.in_stock !== false}`);
      console.log(`  ✓ URL: ${item.deeplink || item.url || item.product_url ? "Present" : "Missing"}`);

      // Normalization
      const normalized = normalizeQuickCommerceItem(item);
      console.log(`\n  ✓ Normalization Result: ${normalized ? "SUCCESS" : "REJECTED"}`);

      if (normalized) {
        // Matcher
        const matchEval = matchOfferToProduct(normalized, selectedLaptop);
        console.log(`  ✓ Matcher Result: ${matchEval.isMatch ? "EXACT MATCH" : "MISMATCH"}`);
        console.log(`  ✓ Matcher Reasons: ${matchEval.reasons.join(", ")}`);

        // Validator
        const valEval = validateRetailerOffer(normalized, selectedLaptop);
        console.log(`  ✓ Validator Result: ${valEval.isValid ? "VALID" : "INVALID"}`);
        if (!valEval.isValid) {
          console.log(`  ✓ Validator Issues: ${valEval.issues.map((i) => `${i.field}: ${i.message}`).join("; ")}`);
        }

        // Final status resolver
        const statusResult = resolveRetailerOfferStatus(valEval.isValid ? normalized : null);
        console.log(`  ✓ Final UI Status: ${statusResult.status} ("${statusResult.buttonLabel}")`);
      }
    } else {
      console.log("  ✓ Flipkart returned 0 results for this query.");
      const statusResult = resolveRetailerOfferStatus(null);
      console.log(`  ✓ Final UI Status: ${statusResult.status} ("${statusResult.buttonLabel}")`);
    }
  } catch (err: any) {
    console.error("  ❌ Flipkart trace error:", err.message);
  }

  console.log("\n==================================================");
  console.log("DIAGNOSTIC COMPLETE");
  console.log("==================================================");
}

runEndToEndDiagnostic();
