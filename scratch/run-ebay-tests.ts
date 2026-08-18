import { runEbayAdapterTests } from "../src/services/retailers/__tests__/ebayAdapter.test";

console.log("==================================================");
console.log("BUYWISE AI — PHASE 18A EBAY ADAPTER UNIT TESTS");
console.log("==================================================");

const { total, passed, failed, results } = runEbayAdapterTests();

results.forEach((r, idx) => {
  const symbol = r.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${idx + 1}/${total}] ${symbol} : ${r.name}`);
  if (!r.passed && r.error) {
    console.log(`    Error: ${r.error}`);
  }
});

console.log("--------------------------------------------------");
console.log(`Summary: ${passed}/${total} passed (${failed} failed)`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
