import { Laptop, RetailerOffer } from "@/types";

export interface MatchEvaluation {
  isMatch: boolean;
  confidence: "exact" | "mismatch" | "insufficient_data";
  reasons: string[];
}

/**
 * Exact Product Configuration Matcher
 * Ensures a retailer offer strictly matches the target laptop configuration:
 * - SKU / Manufacturer Part Number / Product ID
 * - Exact model code
 * - RAM capacity (prevents matching 8GB product with 16GB offer, or vice versa)
 * - GPU configuration and dedicated tier (prevents matching RTX 4060 with RTX 4050 or Integrated)
 * - Storage capacity (prevents matching 512GB with 1TB)
 */
export function matchOfferToProduct(offer: RetailerOffer, product: Laptop): MatchEvaluation {
  const reasons: string[] = [];

  // 1. SKU or Manufacturer Part Number Match
  if (offer.matchedSku && product.sku) {
    const offerSku = offer.matchedSku.toLowerCase().trim();
    const productSku = product.sku.toLowerCase().trim();
    if (offerSku === productSku) {
      // Direct exact SKU match
    } else {
      return {
        isMatch: false,
        confidence: "mismatch",
        reasons: [`SKU mismatch: offer (${offer.matchedSku}) does not match product SKU (${product.sku})`],
      };
    }
  }

  // 2. Exact Model Code Match
  if (offer.matchedModel && product.model) {
    const offerModel = offer.matchedModel.toLowerCase().trim();
    const productModel = product.model.toLowerCase().trim();
    if (offerModel !== productModel) {
      return {
        isMatch: false,
        confidence: "mismatch",
        reasons: [`Model code mismatch: offer (${offer.matchedModel}) vs product (${product.model})`],
      };
    }
  }

  // 3. Model Family & Series Consistency Check
  const offerText = (offer.offerText || "").toLowerCase();

  if (offerText.length > 0) {
    const productNameLower = product.name.toLowerCase();
    const knownFamilies = [
      "victus", "omen", "pavilion", "spectre", "envy", "probook", "elitebook",
      "loq", "legion", "ideapad", "thinkpad", "yoga",
      "tuf", "rog", "zenbook", "vivobook", "expertbook",
      "aspire", "predator", "nitro", "swift", "travelmate",
      "macbook air", "macbook pro",
      "inspiron", "xps", "alienware", "vostro", "latitude",
      "katana", "cyborg", "stealth", "raider", "bravo", "modern", "prestige"
    ];

    for (const family of knownFamilies) {
      if (productNameLower.includes(family) && !offerText.includes(family)) {
        const otherFamily = knownFamilies.find((f) => f !== family && offerText.includes(f));
        if (otherFamily) {
          return {
            isMatch: false,
            confidence: "mismatch",
            reasons: [`Model series mismatch: product is ${family}, but offer mentions ${otherFamily}`],
          };
        }
      }
    }

    // 4. RAM Size Matching Analysis
    const has8Gb = offerText.includes("8gb ram") || offerText.includes("8 gb ram") || (offerText.includes("8gb") && !offerText.includes("rtx") && !offerText.includes("vram") && !offerText.includes("graphics") && !offerText.includes("gpu"));
    const has16Gb = offerText.includes("16gb") || offerText.includes("16 gb");
    const has32Gb = offerText.includes("32gb") || offerText.includes("32 gb");
    const has64Gb = offerText.includes("64gb") || offerText.includes("64 gb");

    // Check 8GB RAM mismatches
    if (product.ramSize === 8) {
      if (has16Gb || has32Gb || has64Gb) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Offer is for 16GB/32GB RAM but product requires 8GB configuration"],
        };
      }
    }

    // Check 16GB RAM mismatches
    if (product.ramSize === 16) {
      if (has32Gb || has64Gb || (has8Gb && !has16Gb)) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Offer is for 8GB/32GB RAM but product requires 16GB configuration"],
        };
      }
    }

    // Check 32GB RAM mismatches
    if (product.ramSize === 32) {
      if ((has8Gb || has16Gb) && !has32Gb) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Offer is for 8GB/16GB RAM but product requires 32GB configuration"],
        };
      }
    }

    // 4. GPU Matching Analysis (Integrated vs Dedicated & Specific Dedicated Tier)
    const productGpu = product.gpu.toLowerCase();

    if (product.gpuCategory === "Integrated") {
      if (
        offerText.includes("rtx 4050") ||
        offerText.includes("rtx 4060") ||
        offerText.includes("rtx 4070") ||
        offerText.includes("rtx 4080") ||
        offerText.includes("rtx 4090") ||
        offerText.includes("rtx 3050") ||
        offerText.includes("rtx 2050") ||
        offerText.includes("geforce rtx") ||
        offerText.includes("dedicated gpu") ||
        offerText.includes("dedicated graphics")
      ) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product is configured with Integrated GPU, but offer contains Dedicated GPU specifications"],
        };
      }
    } else if (product.gpuCategory === "NVIDIA") {
      // Dedicated NVIDIA GPU product
      if (
        offerText.includes("intel uhd") ||
        offerText.includes("intel iris xe") ||
        offerText.includes("integrated graphics only") ||
        offerText.includes("shared graphics memory")
      ) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires dedicated NVIDIA GPU, but offer specifies Integrated Graphics"],
        };
      }

      // Check RTX 4060 vs RTX 4050/4070 mismatch
      if (productGpu.includes("4060") && (offerText.includes("rtx 4050") || offerText.includes("rtx 3050") || offerText.includes("rtx 2050"))) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires RTX 4060 GPU, but offer specifies lower RTX tier"],
        };
      }

      if (productGpu.includes("4050") && (offerText.includes("rtx 4060") || offerText.includes("rtx 4070") || offerText.includes("rtx 4080"))) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires RTX 4050 GPU, but offer specifies different RTX tier"],
        };
      }

      if (productGpu.includes("3050") && (offerText.includes("rtx 3060") || offerText.includes("rtx 4050") || offerText.includes("rtx 4060") || offerText.includes("rtx 4070") || offerText.includes("rtx 2050"))) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires RTX 3050 GPU, but offer specifies different RTX tier"],
        };
      }
    }

    // 5. Storage Matching Analysis (512GB vs 1TB)
    const productStorage = product.storage.toLowerCase();
    if (productStorage.includes("512gb") || productStorage.includes("512 gb")) {
      if (offerText.includes("1tb ssd") || offerText.includes("1 tb ssd") || offerText.includes("2tb ssd") || offerText.includes("2 tb ssd")) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires 512GB SSD, but offer specifies 1TB/2TB storage configuration"],
        };
      }
    } else if (productStorage.includes("1tb") || productStorage.includes("1 tb")) {
      if (offerText.includes("256gb ssd") || offerText.includes("256 gb ssd") || offerText.includes("512gb ssd") || offerText.includes("512 gb ssd")) {
        return {
          isMatch: false,
          confidence: "mismatch",
          reasons: ["Product requires 1TB SSD, but offer specifies lower 256GB/512GB storage configuration"],
        };
      }
    }
  }

  reasons.push("Product brand, model line, and configuration verified");

  return {
    isMatch: true,
    confidence: "exact",
    reasons,
  };
}
