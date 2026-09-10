import fs from "fs";
import path from "path";

// Safely load environment variables for diagnostic script
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

import { getQuickCommerceConfig } from "../src/services/retailers/adapters/quickcommerce";

interface DiagnosticResult {
  query: string;
  platform: string;
  lat: number;
  lon: number;
  pincode?: string;
  httpStatus: number | string;
  ok: boolean;
  durationMs: number;
  resultCount: number;
  message?: string;
  responseShape?: string;
  rawSampleTitles?: string[];
  error?: string;
}

async function runDiagnosticCall(
  query: string,
  platform: string,
  lat: number,
  lon: number,
  pincode?: string
): Promise<DiagnosticResult> {
  const config = getQuickCommerceConfig();
  if (!config.isConfigured || !config.apiKey) {
    return {
      query,
      platform,
      lat,
      lon,
      pincode,
      httpStatus: "N/A (API Key Missing)",
      ok: false,
      durationMs: 0,
      resultCount: 0,
      error: "QUICKCOMMERCE_API_KEY is not configured",
    };
  }

  const startTime = Date.now();
  try {
    const url = new URL(`${config.endpoint}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("platform", platform);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    if (pincode) {
      url.searchParams.set("pincode", pincode);
    }

    const headers: Record<string, string> = {
      "X-API-Key": config.apiKey,
      "Accept": "application/json",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    const httpStatus = res.status;

    let responseJson: any = null;
    let rawText = "";
    try {
      rawText = await res.text();
      responseJson = JSON.parse(rawText);
    } catch {
      responseJson = null;
    }

    if (!res.ok) {
      return {
        query,
        platform,
        lat,
        lon,
        pincode,
        httpStatus,
        ok: false,
        durationMs,
        resultCount: 0,
        message: responseJson?.message || responseJson?.error || rawText.slice(0, 100),
      };
    }

    // Inspect parsed array
    const itemsList: any[] = Array.isArray(responseJson)
      ? responseJson
      : Array.isArray(responseJson?.data?.products)
      ? responseJson.data.products
      : Array.isArray(responseJson?.products)
      ? responseJson.products
      : Array.isArray(responseJson?.data?.items)
      ? responseJson.data.items
      : Array.isArray(responseJson?.items)
      ? responseJson.items
      : Array.isArray(responseJson?.data?.results)
      ? responseJson.data.results
      : Array.isArray(responseJson?.results)
      ? responseJson.results
      : Array.isArray(responseJson?.data)
      ? responseJson.data
      : [];

    const keys = responseJson && typeof responseJson === "object" ? Object.keys(responseJson).join(", ") : typeof responseJson;
    const sampleTitles = itemsList.slice(0, 3).map((item) => String(item?.title || item?.name || item?.product_name || "Untitled"));

    return {
      query,
      platform,
      lat,
      lon,
      pincode,
      httpStatus,
      ok: true,
      durationMs,
      resultCount: itemsList.length,
      message: responseJson?.message || undefined,
      responseShape: `Top-level keys: [${keys}] | Detected array length: ${itemsList.length}`,
      rawSampleTitles: sampleTitles.length > 0 ? sampleTitles : undefined,
    };
  } catch (err: any) {
    return {
      query,
      platform,
      lat,
      lon,
      pincode,
      httpStatus: "ERROR",
      ok: false,
      durationMs: Date.now() - startTime,
      resultCount: 0,
      error: err.message,
    };
  }
}

async function main() {
  console.log("================================================================================");
  console.log("BUYWISE AI — PHASE 33: QUICKCOMMERCE ZERO-RESULT DIAGNOSTIC");
  console.log("================================================================================");

  const config = getQuickCommerceConfig();
  console.log(`\n[API Configuration]`);
  console.log(`- Configured        : ${config.isConfigured}`);
  console.log(`- Endpoint          : ${config.endpoint}`);
  console.log(`- Default Location  : lat=${config.defaultLat}, lon=${config.defaultLon}, pincode=${config.defaultPincode}`);
  console.log(`- Default Platform  : ${config.defaultPlatform}`);
  console.log(`- Credential Guard  : API key safe & masked (${config.apiKey ? "Present" : "Missing"})`);

  // Target laptops to diagnose
  const targetLaptops = [
    {
      name: "HP Victus 15-fa2500tx",
      queries: ["HP Victus 15-fa2500tx", "HP Victus 15"],
    },
    {
      name: "Lenovo IdeaPad 1 15AMN7",
      queries: ["Lenovo IdeaPad 1 15AMN7", "Lenovo IdeaPad 1"],
    },
    {
      name: "Acer Aspire Lite 15",
      queries: ["Acer Aspire Lite 15", "Acer Aspire Lite"],
    },
  ];

  const platforms = ["Amazon", "Flipkart"];
  const allResults: DiagnosticResult[] = [];

  console.log("\n--------------------------------------------------------------------------------");
  console.log("PART 1: TARGET LAPTOP DIAGNOSTIC (AMAZON & FLIPKART)");
  console.log("--------------------------------------------------------------------------------");

  for (const laptop of targetLaptops) {
    console.log(`\n▶ Laptop: ${laptop.name}`);
    for (const platform of platforms) {
      console.log(`  [Platform: ${platform}]`);
      for (const q of laptop.queries) {
        const res = await runDiagnosticCall(q, platform, config.defaultLat, config.defaultLon, config.defaultPincode);
        allResults.push(res);
        console.log(`    - Query        : "${res.query}"`);
        console.log(`      HTTP Status  : ${res.httpStatus} (${res.durationMs}ms)`);
        console.log(`      Result Count : ${res.resultCount}`);
        if (res.message) console.log(`      Message      : ${res.message}`);
        if (res.rawSampleTitles) console.log(`      Samples      : ${res.rawSampleTitles.join(" | ")}`);
        if (res.error) console.log(`      Error        : ${res.error}`);
      }
    }
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log("PART 2: BROAD QUERY & LOCATION SENSITIVITY COMPARISON");
  console.log("--------------------------------------------------------------------------------");

  const broadQueries = [
    { query: "laptop", platform: "Amazon" },
    { query: "laptop", platform: "Flipkart" },
    { query: "HP Victus", platform: "Amazon" },
    { query: "HP Victus", platform: "Flipkart" },
  ];

  for (const b of broadQueries) {
    const res = await runDiagnosticCall(b.query, b.platform, config.defaultLat, config.defaultLon, config.defaultPincode);
    allResults.push(res);
    console.log(`  [Broad Query: "${b.query}" on ${b.platform}]`);
    console.log(`    HTTP Status  : ${res.httpStatus} (${res.durationMs}ms)`);
    console.log(`    Result Count : ${res.resultCount}`);
    if (res.responseShape) console.log(`    Shape        : ${res.responseShape}`);
    if (res.rawSampleTitles) console.log(`    Samples      : ${res.rawSampleTitles.join(" | ")}`);
    if (res.message) console.log(`    Message      : ${res.message}`);
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log("PART 3: LOCATION VARIATION TEST (Delhi, Mumbai, Bangalore)");
  console.log("--------------------------------------------------------------------------------");

  const locations = [
    { city: "Bangalore", lat: 12.9716, lon: 77.5946, pincode: "560001" },
    { city: "Delhi", lat: 28.6139, lon: 77.2090, pincode: "110001" },
    { city: "Mumbai", lat: 19.0760, lon: 72.8777, pincode: "400001" },
  ];

  for (const loc of locations) {
    const res = await runDiagnosticCall("laptop", "Amazon", loc.lat, loc.lon, loc.pincode);
    console.log(`  [City: ${loc.city} (lat=${loc.lat}, lon=${loc.lon}, pincode=${loc.pincode})]`);
    console.log(`    Query        : "laptop" on Amazon`);
    console.log(`    HTTP Status  : ${res.httpStatus} (${res.durationMs}ms)`);
    console.log(`    Result Count : ${res.resultCount}`);
    if (res.message) console.log(`    Message      : ${res.message}`);
  }

  console.log("\n================================================================================");
  console.log("DIAGNOSTIC SUMMARY & ROOT CAUSE ANALYSIS");
  console.log("================================================================================");

  const totalCalls = allResults.length;
  const successfulCalls = allResults.filter((r) => r.ok && typeof r.httpStatus === "number" && r.httpStatus >= 200 && r.httpStatus < 300).length;
  const zeroResultCalls = allResults.filter((r) => r.ok && r.resultCount === 0).length;
  const positiveResultCalls = allResults.filter((r) => r.resultCount > 0).length;

  console.log(`- Total Calls Tested       : ${totalCalls}`);
  console.log(`- HTTP 200 OK Responses    : ${successfulCalls}/${totalCalls}`);
  console.log(`- Calls with 0 results     : ${zeroResultCalls}`);
  console.log(`- Calls with >0 results    : ${positiveResultCalls}`);

  console.log("\n================================================================================");
}

main().catch(console.error);
