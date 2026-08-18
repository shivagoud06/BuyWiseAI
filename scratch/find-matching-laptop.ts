import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";
import { validateRetailerOffer } from "../src/services/retailers/validator";

// Load .env.local
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

async function findMatch() {
  console.log("Searching catalog laptops against live QuickCommerce API...\n");
  
  // Test HP Victus / Lenovo LOQ / Acer Nitro / ASUS TUF
  const targetLaptops = [
    LAPTOPS.find((l) => l.id.includes("victus")),
    LAPTOPS.find((l) => l.id.includes("loq")),
    LAPTOPS.find((l) => l.id.includes("nitro")),
    LAPTOPS.find((l) => l.id.includes("tuf")),
    LAPTOPS.find((l) => l.id.includes("swift")),
    LAPTOPS.find((l) => l.id.includes("ideapad")),
  ].filter(Boolean);

  for (const laptop of targetLaptops) {
    if (!laptop) continue;
    const queries = [
      `${laptop.brand} ${laptop.model || ""}`.trim(),
      `${laptop.brand} ${laptop.name.split(" ")[0]} ${laptop.name.split(" ")[1] || ""}`.trim(),
      laptop.name,
    ];

    for (const q of queries) {
      console.log(`Querying [${laptop.id}] with query: "${q}"...`);
      try {
        const flipkartRaw = (await QuickCommerceAdapter.searchProducts!(q, {
          platform: "Flipkart",
        })) as RawQuickCommerceProduct[];

        console.log(`  Received ${flipkartRaw.length} raw results from Flipkart.`);

        for (const item of flipkartRaw) {
          const normalized = normalizeQuickCommerceItem(item);
          if (!normalized) continue;

          const match = matchOfferToProduct(normalized, laptop);
          const validation = validateRetailerOffer(normalized, laptop);

          if (match.isMatch && validation.isValid && validation.offer) {
            console.log("\n==================================================");
            console.log("🎯 FOUND EXACT VERIFIED MATCHING PRODUCT!");
            console.log("==================================================");
            console.log(`Catalog Laptop Name : ${laptop.name}`);
            console.log(`Catalog ID          : ${laptop.id}`);
            console.log(`Matched Retailer    : ${normalized.retailerName}`);
            console.log(`Real Price          : ₹${normalized.price.toLocaleString("en-IN")}`);
            console.log(`MRP                 : ${normalized.mrp ? "₹" + normalized.mrp.toLocaleString("en-IN") : "N/A"}`);
            console.log(`Availability        : ${normalized.availability}`);
            console.log(`Verified URL        : ${normalized.productUrl}`);
            console.log(`Raw Listing Name    : ${item.name || item.title}`);
            console.log(`Hardware Specs      : CPU: ${laptop.processorFamily}, RAM: ${laptop.ramSize}GB, GPU: ${laptop.gpu}`);
            console.log("==================================================\n");
            return;
          }
        }
      } catch (err: any) {
        console.error(`Error querying "${q}":`, err.message);
      }
    }
  }
}

findMatch();
