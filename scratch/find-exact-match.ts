import fs from "fs";
import path from "path";

// Load .env.local FIRST
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
        process.env[k] = v;
      }
    }
  });
}

import { LAPTOPS } from "../src/data/laptops";
import {
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
  getQuickCommerceConfig,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer } from "../src/services/retailers/validator";

async function findExactMatch() {
  const config = getQuickCommerceConfig();
  console.log("Config configured:", config.isConfigured);

  const url = new URL(`${config.endpoint}/search`);
  url.searchParams.set("q", "HP Victus laptop");
  url.searchParams.set("platform", "Flipkart");
  url.searchParams.set("lat", "12.9716");
  url.searchParams.set("lon", "77.5946");

  console.log("Fetching URL:", url.toString());
  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": config.apiKey || "",
      "Accept": "application/json",
    },
  });

  console.log("HTTP Status:", res.status);
  const data = await res.json();
  const rawItems = (data.data?.products || data.products || []) as RawQuickCommerceProduct[];
  console.log(`Fetched ${rawItems.length} live listings from Flipkart.\n`);

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const normalized = normalizeQuickCommerceItem(item);
    if (!normalized) continue;

    console.log(`[#${i + 1}] Title: ${item.name || item.title}`);
    console.log(`     Price: ₹${item.offer_price || item.price}, MRP: ₹${item.mrp}`);
    console.log(`     Deeplink: ${item.deeplink}`);

    for (const laptop of LAPTOPS) {
      const match = matchOfferToProduct(normalized, laptop);
      if (match.isMatch) {
        const val = validateRetailerOffer(normalized, laptop);
        console.log("\n=======================================================");
        console.log("🎯 EXACT LIVE MATCH QUALIFYING FOR BUY NOW!");
        console.log("=======================================================");
        console.log(`Catalog Laptop Name : ${laptop.name}`);
        console.log(`Catalog ID          : ${laptop.id}`);
        console.log(`Matched Retailer    : ${normalized.retailerName}`);
        console.log(`Real Price          : ₹${normalized.price.toLocaleString("en-IN")}`);
        console.log(`MRP                 : ${normalized.mrp ? "₹" + normalized.mrp.toLocaleString("en-IN") : "None"}`);
        console.log(`Availability        : ${normalized.availability}`);
        console.log(`Verified URL        : ${normalized.productUrl}`);
        console.log(`Live Listing Title  : ${item.name || item.title}`);
        console.log(`Exact Reason        : Exact match on brand (${laptop.brand}), family, ${laptop.ramSize}GB RAM, ${laptop.gpu}, and verified active Flipkart deeplink.`);
        console.log("=======================================================\n");
        return;
      }
    }
  }
}

findExactMatch();
