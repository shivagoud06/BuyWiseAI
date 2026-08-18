const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — FOOTER & ROUTES COMPREHENSIVE TEST");
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

const footerPath = path.join(__dirname, "../src/components/layout/Footer.tsx");
const footerContent = fs.readFileSync(footerPath, "utf-8");

// 1. Customer Support
test("1. Customer Support header present", footerContent.includes("Customer Support"));
test("2. 'Have a question or need help?' present", footerContent.includes("Have a question or need help?"));
test("3. 'Email:' label present", footerContent.includes("Email:"));
test("4. Email uses siteConfig.supportEmail", footerContent.includes("siteConfig.supportEmail"));

// 5. NO mailto links in footer
test("5. NO mailto links in Footer", !footerContent.includes("mailto:"));

// 6. NO phone numbers in footer
test("6. NO phone number or tel: in Footer", !footerContent.includes("tel:") && !footerContent.includes("+91"));

// 7. Copyright & Dynamic Year
test("7. Copyright BuyWise AI present", footerContent.includes("BuyWise AI. All rights reserved."));
test("8. Dynamic year used", footerContent.includes("currentYear"));
test("9. 'Laptop Edition • India' present", footerContent.includes("Laptop Edition • India"));

// 10. Disclaimer text exact match
const disclaimer = "Product information and prices may change. Always verify the latest price, availability and product details with the retailer before purchasing.";
test("10. Exact disclaimer text present", footerContent.includes(disclaimer));

// 11. Navigation Links in Footer
test("11. Home link (/) present", footerContent.includes('href="/"'));
test("12. Laptops link (/laptops) present", footerContent.includes('href="/laptops"'));
test("13. Compare link (/compare) present", footerContent.includes('href="/compare"'));
test("14. AI Advisor link (/advisor) present", footerContent.includes('href="/advisor"'));
test("15. Buying Guide link (/buying-guide) present", footerContent.includes('href="/buying-guide"'));
test("16. How BuyWise Works link (/how-it-works) present", footerContent.includes('href="/how-it-works"'));
test("17. Privacy link (/privacy) present", footerContent.includes('href="/privacy"'));
test("18. Terms link (/terms) present", footerContent.includes('href="/terms"'));
test("19. Affiliate Disclosure link (/affiliate-disclosure) present", footerContent.includes('href="/affiliate-disclosure"'));
test("20. Find My Laptop links to /advisor", footerContent.includes('href="/advisor"'));

// 21. Route page files exist (No 404s)
test("21. /buying-guide page file exists", fs.existsSync(path.join(__dirname, "../src/app/buying-guide/page.tsx")));
test("22. /how-it-works page file exists", fs.existsSync(path.join(__dirname, "../src/app/how-it-works/page.tsx")));
test("23. /privacy page file exists", fs.existsSync(path.join(__dirname, "../src/app/privacy/page.tsx")));
test("24. /terms page file exists", fs.existsSync(path.join(__dirname, "../src/app/terms/page.tsx")));
test("25. /affiliate-disclosure page file exists", fs.existsSync(path.join(__dirname, "../src/app/affiliate-disclosure/page.tsx")));

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
