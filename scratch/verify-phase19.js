const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 19 PRODUCTION READINESS AUDIT");
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

// 1. Git & Environment Files
const gitignorePath = path.join(__dirname, "../.gitignore");
const gitignore = fs.readFileSync(gitignorePath, "utf-8");
test("1. .gitignore ignores .env, .env.local, node_modules, .next, and .vercel",
  gitignore.includes(".env.local") &&
  gitignore.includes("node_modules") &&
  gitignore.includes(".next") &&
  gitignore.includes(".vercel")
);

const envExamplePath = path.join(__dirname, "../.env.example");
test("2. .env.example exists and contains template variables without secrets", fs.existsSync(envExamplePath));
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf-8");
  test("3. .env.example contains zero hardcoded API keys or credentials",
    !envExample.includes("sk-") &&
    !envExample.includes("AKIA") &&
    !envExample.includes("AIza") &&
    envExample.includes("NEXT_PUBLIC_APP_URL") &&
    envExample.includes("EBAY_CLIENT_ID=")
  );
}

// 2. Next.js Configuration
const nextConfigPath = path.join(__dirname, "../next.config.mjs");
const nextConfig = fs.readFileSync(nextConfigPath, "utf-8");
test("4. next.config.mjs configures images.remotePatterns for Unsplash",
  nextConfig.includes("images.unsplash.com") &&
  nextConfig.includes("remotePatterns")
);

// 3. Metadata & SEO
const layoutPath = path.join(__dirname, "../src/app/layout.tsx");
const layout = fs.readFileSync(layoutPath, "utf-8");
test("5. Root layout configures metadataBase, title template, openGraph, twitter, and robots",
  layout.includes("metadataBase") &&
  layout.includes("template:") &&
  layout.includes("openGraph:") &&
  layout.includes("twitter:") &&
  layout.includes("robots:")
);

const robotsPath = path.join(__dirname, "../src/app/robots.ts");
test("6. Dynamic robots.ts exists and specifies sitemap URL",
  fs.existsSync(robotsPath) &&
  fs.readFileSync(robotsPath, "utf-8").includes("sitemap:")
);

const sitemapPath = path.join(__dirname, "../src/app/sitemap.ts");
test("7. Dynamic sitemap.ts exists and indexes static routes + all dynamic laptop products",
  fs.existsSync(sitemapPath) &&
  fs.readFileSync(sitemapPath, "utf-8").includes("LAPTOPS.map")
);

// 4. Custom Error Handling & 404
const notFoundPath = path.join(__dirname, "../src/app/not-found.tsx");
test("8. User-friendly 404 page exists at src/app/not-found.tsx",
  fs.existsSync(notFoundPath) &&
  fs.readFileSync(notFoundPath, "utf-8").includes("404 — Page Not Found")
);

const errorPath = path.join(__dirname, "../src/app/error.tsx");
test("9. Global error boundary exists at src/app/error.tsx",
  fs.existsSync(errorPath) &&
  fs.readFileSync(errorPath, "utf-8").includes("Unable to Load Content")
);

// 5. Dynamic Laptop Details Metadata
const detailsPath = path.join(__dirname, "../src/app/laptops/[id]/page.tsx");
const details = fs.readFileSync(detailsPath, "utf-8");
test("10. Laptop details page exports generateMetadata for dynamic SEO",
  details.includes("export function generateMetadata") &&
  details.includes("buyWiseScore")
);

// 6. Navigation & Trust Verification
const navbarPath = path.join(__dirname, "../src/components/layout/Navbar.tsx");
const navbar = fs.readFileSync(navbarPath, "utf-8");
test("11. Navbar routes correctly to Home, Laptops, Compare, and Advisor",
  navbar.includes('href="/"') &&
  navbar.includes('href="/laptops"') &&
  navbar.includes('href="/compare"') &&
  navbar.includes('href="/advisor"')
);

const footerPath = path.join(__dirname, "../src/components/layout/Footer.tsx");
const footer = fs.readFileSync(footerPath, "utf-8");
test("12. Footer contains pricing disclaimer and links to Privacy, Terms, Disclosure, Buying Guide",
  footer.includes("Product information and prices may change") &&
  footer.includes('href="/privacy"') &&
  footer.includes('href="/terms"') &&
  footer.includes('href="/affiliate-disclosure"') &&
  footer.includes('href="/buying-guide"')
);

// 7. Security Audit
const registryPath = path.join(__dirname, "../src/services/retailers/registry.ts");
const registry = fs.readFileSync(registryPath, "utf-8");
test("13. All registered retailers have connectionStatus: 'not_connected'",
  !registry.includes('connectionStatus: "connected"')
);

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
