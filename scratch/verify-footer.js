const fs = require("fs");
const path = require("path");

const siteConfigContent = fs.readFileSync(path.join(__dirname, "../src/config/site.ts"), "utf-8");

console.log("==================================================");
console.log("BUYWISE AI — FOOTER & SITE CONFIG TEST RUNNER");
console.log("==================================================");

let pass = 0, fail = 0;
function test(name, cond) {
  if (cond) {
    console.log(`✅ PASS: ${name}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    fail++;
  }
}

test("1. Central site config file exists", fs.existsSync(path.join(__dirname, "../src/config/site.ts")));
test("2. Support email defined in siteConfig", siteConfigContent.includes('supportEmail: "aibuywise@gmail.com"'));
test("3. Footer uses siteConfig.supportEmail", fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8").includes("siteConfig.supportEmail"));
test("4. Mailto link format used in Footer", fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8").includes("mailto:${siteConfig.supportEmail}"));
test("5. Email Support action button present", fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8").includes("Email Support"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
