import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  getQuickCommerceConfig,
  buildQuickCommerceSearchQueries,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer, validateRetailerOffers } from "../src/services/retailers/validator";
import { getRetailerOffers, resolveRetailerOfferStatus } from "../src/services/retailers/index";
import { Laptop, RetailerOffer } from "../src/types";

// Load .env.local safely
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

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 29: DIAGNOSE LIVE RETAILER FLOW");
console.log("================================================================================");

const targetLaptop = LAPTOPS.find((l) => l.id === "hp-victus-15-fa2500tx") || LAPTOPS[0];

async function runDiagnosis() {
  console.log(`\n1. Target Catalog Product:`);
  console.log(`- Catalog ID   : ${targetLaptop.id}`);
  console.log(`- Product Name : ${targetLaptop.name}`);
  console.log(`- Full Specs   : ${targetLaptop.brand} ${targetLaptop.model} | ${targetLaptop.processor} | ${targetLaptop.ramSize}GB RAM | ${targetLaptop.gpu} | ${targetLaptop.storage}`);

  const queries = buildQuickCommerceSearchQueries(targetLaptop);
  console.log(`\n2. Generated Search Queries (Max 4):`);
  queries.forEach((q, idx) => {
    console.log(`  Query #${idx + 1}: "${q}"`);
  });

  const platforms = ["Amazon", "Flipkart"];
  const allDiscoveredCandidates: RawQuickCommerceProduct[] = [];
  const candidateMatchResults: Array<{
    platform: string;
    query: string;
    title: string;
    price: string;
    availability: string;
    urlPresence: boolean;
    matcherResult: string;
    validatorResult: string;
  }> = [];

  const config = getQuickCommerceConfig();
  console.log(`\n3. QuickCommerce API Configuration:`);
  console.log(`- Is Configured : ${config.isConfigured}`);
  console.log(`- Endpoint      : ${config.endpoint}`);
  console.log(`- Default Lat   : ${config.defaultLat}, Lon: ${config.defaultLon}`);

  for (const platform of platforms) {
    console.log(`\n4. Querying Platform: ${platform}`);
    for (const q of queries) {
      try {
        const rawItems = (await QuickCommerceAdapter.searchProducts!(q, {
          platform,
          limit: 5,
        })) as RawQuickCommerceProduct[];

        console.log(`  - Query "${q}" returned ${rawItems.length} products`);

        for (const item of rawItems) {
          allDiscoveredCandidates.push(item);
          const title = item.name || item.title || "N/A";
          const price = item.price ? `₹${item.price}` : "N/A";
          const availability = item.in_stock ? "In Stock" : "Out of Stock";
          const urlPresence = Boolean(item.deeplink || item.url || item.product_url);

          const normalized = normalizeQuickCommerceItem(item);
          let matchStr = "Normalization Failed";
          let valStr = "N/A";

          if (normalized) {
            const match = matchOfferToProduct(normalized, targetLaptop);
            matchStr = match.isMatch ? "EXACT MATCH (PASS)" : `MISMATCH (${match.reasons.join("; ")})`;

            const val = validateRetailerOffer(normalized, targetLaptop);
            valStr = val.isValid ? "VALID (PASS)" : `INVALID (${val.issues.map((i) => i.message).join("; ")})`;
          }

          candidateMatchResults.push({
            platform,
            query: q,
            title,
            price,
            availability,
            urlPresence,
            matcherResult: matchStr,
            validatorResult: valStr,
          });
        }
      } catch (err: any) {
        console.log(`  - Query "${q}" error: ${err.message}`);
      }
    }
  }

  console.log(`\n5. Candidate Evaluation Summary:`);
  if (candidateMatchResults.length === 0) {
    console.log(`  (0 live candidates returned by API provider for this laptop)`);
  } else {
    candidateMatchResults.forEach((r, i) => {
      console.log(`\nCandidate #${i + 1} [${r.platform} via "${r.query}"]`);
      console.log(`- Title            : ${r.title}`);
      console.log(`- Price            : ${r.price}`);
      console.log(`- Availability     : ${r.availability}`);
      console.log(`- URL Presence     : ${r.urlPresence}`);
      console.log(`- Matcher Result   : ${r.matcherResult}`);
      console.log(`- Validator Result : ${r.validatorResult}`);
    });
  }

  console.log(`\n6. Full Pipeline getRetailerOffers() Test:`);
  const liveOffers = await getRetailerOffers(targetLaptop, targetLaptop.currency === "USD" ? "US" : "IN");
  console.log(`- Final RetailerOffer Count : ${liveOffers.length}`);

  // Trace UI WhereToBuy resolution
  const uiOffers = validateRetailerOffers(liveOffers, targetLaptop);
  console.log(`- Final UI WhereToBuy Count : ${uiOffers.length}`);

  if (uiOffers.length > 0) {
    uiOffers.forEach((o) => {
      const statusRes = resolveRetailerOfferStatus(o);
      console.log(`  • Retailer: ${o.retailerName} | Price: ₹${o.price} | Status: ${statusRes.status} | URL: ${Boolean(statusRes.targetUrl)}`);
    });
  } else {
    console.log(`- Final UI Status: COMING SOON / Live retailer pricing unavailable (Safe standard state when 0 live offers exist)`);
  }

  console.log("\n================================================================================");
}

runDiagnosis();
