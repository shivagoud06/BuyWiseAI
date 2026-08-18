import fs from "fs";
import path from "path";

// Safely load environment without dotenv dependency
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

const apiKey = process.env.QUICKCOMMERCE_API_KEY;

if (!apiKey) {
  console.log("❌ QUICKCOMMERCE_API_KEY is missing from environment.");
  process.exit(1);
}

async function testQuery(testName: string, urlStr: string, headers: Record<string, string>) {
  console.log(`\n========================================`);
  console.log(`TEST: ${testName}`);
  console.log(`URL: ${urlStr}`);
  console.log(`Headers sent: ${Object.keys(headers).join(", ")} (values hidden)`);
  try {
    const start = Date.now();
    const res = await fetch(urlStr, {
      method: "GET",
      headers,
    });
    const duration = Date.now() - start;
    console.log(`Status: ${res.status} ${res.statusText} (${duration}ms)`);
    const text = await res.text();
    console.log(`Raw Response length: ${text.length} chars`);
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        console.log(`Response is Array with length: ${json.length}`);
        if (json.length > 0) {
          console.log("First item keys:", Object.keys(json[0]));
          console.log("First item sample:", JSON.stringify(json[0]).substring(0, 200));
        }
      } else if (typeof json === "object" && json !== null) {
        console.log("Response object keys:", Object.keys(json));
        if (json.detail) {
          console.log("Validation detail:", JSON.stringify(json.detail));
        }
        if (json.results) {
          console.log(`results count: ${Array.isArray(json.results) ? json.results.length : typeof json.results}`);
          if (Array.isArray(json.results) && json.results.length > 0) {
            console.log("First result keys:", Object.keys(json.results[0]));
            console.log("First result sample:", JSON.stringify(json.results[0]).substring(0, 200));
          }
        }
        if (json.data) {
          console.log("data keys:", Object.keys(json.data));
          if (Array.isArray(json.data)) {
            console.log("data is array, length:", json.data.length);
            if (json.data.length > 0) console.log("Sample item:", JSON.stringify(json.data[0]));
          } else if (typeof json.data === "object") {
            for (const k of Object.keys(json.data)) {
              if (Array.isArray(json.data[k])) {
                console.log(`data.${k} is array with ${json.data[k].length} items`);
                if (json.data[k].length > 0) {
                  console.log(`Sample item in data.${k}[0]:`, JSON.stringify(json.data[k][0]));
                }
              } else {
                console.log(`data.${k} is:`, typeof json.data[k]);
              }
            }
          }
        }
        if (json.items) {
          console.log(`items count: ${Array.isArray(json.items) ? json.items.length : typeof json.items}`);
        }
        if (json.products) {
          console.log(`products count: ${Array.isArray(json.products) ? json.products.length : typeof json.products}`);
        }
        if (json.message || json.error) {
          console.log("Message/Error in body:", json.message || json.error);
        }
      }
    } catch {
      console.log(`Response snippet: ${text.substring(0, 300)}`);
    }
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }
}

async function runDiagnostics() {
  const base = "https://api.quickcommerceapi.com/v1";
  const lat = "12.9716";
  const lon = "77.5946";

  // Test 1: Flipkart query with lat/lon
  await testQuery(
    "1. Platform Flipkart: 'HP laptop'",
    `${base}/search?q=HP+laptop&platform=Flipkart&lat=${lat}&lon=${lon}`,
    {
      "X-API-Key": apiKey!,
      "Accept": "application/json",
    }
  );
}

runDiagnostics();
