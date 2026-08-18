const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — FOOTER BUTTON REMOVAL TEST RUNNER");
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

const footerContent = fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8");
const navbarContent = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
const siteConfigContent = fs.readFileSync(path.join(__dirname, "../src/config/site.ts"), "utf-8");

// 1. Verify left brand column does NOT have Find My Laptop
const brandCol = footerContent.substring(footerContent.indexOf("{/* Brand Column */}"), footerContent.indexOf("{/* Navigation Column */}"));
test("1. Left brand column has NO Find My Laptop button", !brandCol.includes("Find My Laptop"));

// 2. Verify Resources column still has Find My Laptop
const resourcesCol = footerContent.substring(footerContent.indexOf("{/* Resources Column */}"), footerContent.indexOf("{/* Customer Support Column */}"));
test("2. Resources column retains Find My Laptop link", resourcesCol.includes("Find My Laptop") && resourcesCol.includes('href="/advisor"'));

// 3. Verify Navbar retains Find My Laptop button
test("3. Top navigation retains Find My Laptop button", navbarContent.includes("Find My Laptop") && navbarContent.includes('href="/advisor"'));

// 4. Customer Support email as plain text
test("4. Customer support email is plain text without copy button", siteConfigContent.includes("aibuywise@gmail.com") && footerContent.includes("siteConfig.supportEmail") && !footerContent.includes("<button") && !footerContent.includes("<Copy"));

// 5. Copyright preserved
test("5. Copyright preserved", footerContent.includes("BuyWise AI. All rights reserved.") && footerContent.includes("Laptop Edition • India"));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
