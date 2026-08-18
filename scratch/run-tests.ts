import { runAllRetailerTests } from "../src/services/retailers/__tests__/retailerComparison.test";

console.log("==================================================");
console.log("BUYWISE AI — PHASE 12B RETAILER SYSTEM TEST SUITE");
console.log("==================================================");

const { total, passed, failed, results } = runAllRetailerTests();

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
