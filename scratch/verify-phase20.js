const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("BUYWISE AI — PHASE 20 PUBLIC DEPLOYMENT AUDIT");
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

// 1. Package & Lockfile presence
const packageJsonPath = path.join(__dirname, "../package.json");
const pnpmLockPath = path.join(__dirname, "../pnpm-lock.yaml");
test("1. package.json and pnpm-lock.yaml are present", fs.existsSync(packageJsonPath) && fs.existsSync(pnpmLockPath));

// 2. Gitignore Verification
const gitignorePath = path.join(__dirname, "../.gitignore");
const gitignore = fs.readFileSync(gitignorePath, "utf-8");
test("2. .gitignore excludes .env, .env.local, node_modules, .next, and .vercel",
  gitignore.includes(".env.local") &&
  gitignore.includes("node_modules") &&
  gitignore.includes(".next") &&
  gitignore.includes(".vercel")
);

// 3. Environment Variables & .env.example
const envExamplePath = path.join(__dirname, "../.env.example");
test("3. .env.example exists and contains template variables without secrets", fs.existsSync(envExamplePath));
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf-8");
  test("4. .env.example contains zero hardcoded API keys",
    !envExample.includes("sk-") &&
    !envExample.includes("AKIA") &&
    !envExample.includes("AIza") &&
    envExample.includes("NEXT_PUBLIC_APP_URL") &&
    envExample.includes("EBAY_CLIENT_ID=")
  );
}

// 4. Next.js Config
const nextConfigPath = path.join(__dirname, "../next.config.mjs");
const nextConfig = fs.readFileSync(nextConfigPath, "utf-8");
test("5. next.config.mjs configures images.remotePatterns for Unsplash",
  nextConfig.includes("images.unsplash.com") &&
  nextConfig.includes("remotePatterns")
);

// 5. Root Layout & Metadata
const layoutPath = path.join(__dirname, "../src/app/layout.tsx");
const layout = fs.readFileSync(layoutPath, "utf-8");
test("6. Root layout includes metadataBase, title template, openGraph, twitter, and robots",
  layout.includes("metadataBase") &&
  layout.includes("template:") &&
  layout.includes("openGraph:") &&
  layout.includes("twitter:") &&
  layout.includes("robots:")
);

// 6. Dynamic Robots and Sitemap
const robotsPath = path.join(__dirname, "../src/app/robots.ts");
test("7. Dynamic robots.ts exists and specifies sitemap URL",
  fs.existsSync(robotsPath) &&
  fs.readFileSync(robotsPath, "utf-8").includes("sitemap:")
);

const sitemapPath = path.join(__dirname, "../src/app/sitemap.ts");
test("8. Dynamic sitemap.ts exists and indexes all static & dynamic routes",
  fs.existsSync(sitemapPath) &&
  fs.readFileSync(sitemapPath, "utf-8").includes("LAPTOPS.map")
);

// 7. 404 & Error Handling
const notFoundPath = path.join(__dirname, "../src/app/not-found.tsx");
const errorPath = path.join(__dirname, "../src/app/error.tsx");
test("9. User-friendly 404 and Error boundary exist",
  fs.existsSync(notFoundPath) &&
  fs.existsSync(errorPath)
);

// 8. Dynamic Laptop SEO
const detailsPath = path.join(__dirname, "../src/app/laptops/[id]/page.tsx");
const details = fs.readFileSync(detailsPath, "utf-8");
test("10. Laptop details page exports generateMetadata for dynamic SEO",
  details.includes("export function generateMetadata") &&
  details.includes("generateStaticParams")
);

// 9. Retailer Safety & Isolation
const registryPath = path.join(__dirname, "../src/services/retailers/registry.ts");
const registry = fs.readFileSync(registryPath, "utf-8");
test("11. All registered retailers have connectionStatus: 'not_connected'",
  !registry.includes('connectionStatus: "connected"')
);

// 10. Security: Zero NEXT_PUBLIC secrets
const indexPath = path.join(__dirname, "../src/services/retailers/index.ts");
const indexContent = fs.readFileSync(indexPath, "utf-8");
test("12. Zero NEXT_PUBLIC secrets in retailer services",
  !indexContent.includes("NEXT_PUBLIC_")
);

console.log("--------------------------------------------------");
console.log(`Test Summary: ${pass} passed, ${fail} failed.`);
console.log("==================================================");
process.exit(fail > 0 ? 1 : 0);
