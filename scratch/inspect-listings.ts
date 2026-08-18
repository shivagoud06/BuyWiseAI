import fs from "fs";
import path from "path";
import { LAPTOPS } from "../src/data/laptops";
import {
  QuickCommerceAdapter,
  normalizeQuickCommerceItem,
  RawQuickCommerceProduct,
} from "../src/services/retailers/adapters/quickcommerce";
import { matchOfferToProduct } from "../src/services/retailers/matcher";

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

async function inspectListings() {
  const flipkartRaw = (await QuickCommerceAdapter.searchProducts!("HP Victus laptop", {
    platform: "Flipkart",
  })) as RawQuickCommerceProduct[];

  console.log(`Received ${flipkartRaw.length} listings from Flipkart for "HP Victus laptop".\n`);

  for (const item of flipkartRaw.slice(0, 15)) {
    console.log("--------------------------------------------------");
    console.log("Title :", item.name || item.title);
    console.log("Price :", item.offer_price || item.price);
    console.log("URL   :", item.deeplink);

    const norm = normalizeQuickCommerceItem(item);
    if (!norm) continue;

    for (const laptop of LAPTOPS) {
      const match = matchOfferToProduct(norm, laptop);
      if (match.isMatch) {
        console.log(`>>> MATCHES CATALOG LAPTOP: [${laptop.id}] "${laptop.name}"`);
        console.log("Reasons:", match.reasons);
      }
    }
  }
}

inspectListings();
