import * as fs from "fs";
import * as path from "path";
import { LAPTOPS } from "../src/data/laptops";

const outputDir = path.join(__dirname, "../public/images/laptops/normalized");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface LaptopStyle {
  bodyColor: string;
  bodyGradientStart: string;
  bodyGradientEnd: string;
  screenBezel: string;
  screenWallpaperStart: string;
  screenWallpaperEnd: string;
  accentColor: string;
  keyboardColor: string;
  isGaming?: boolean;
  isMacBook?: boolean;
  badgeText?: string;
  lidAccents?: string;
}

function getStyleForLaptop(laptop: (typeof LAPTOPS)[0]): LaptopStyle {
  const name = laptop.name.toLowerCase();
  const brand = laptop.brand.toLowerCase();
  const isMac = brand.includes("apple");
  const isGaming =
    name.includes("tuf") ||
    name.includes("loq") ||
    name.includes("nitro") ||
    name.includes("victus") ||
    name.includes("katana") ||
    name.includes("omen") ||
    name.includes("legion") ||
    name.includes("rog") ||
    name.includes("g15");

  if (isMac) {
    if (laptop.id.includes("pro")) {
      return {
        bodyColor: "#1E2022",
        bodyGradientStart: "#2C2E33",
        bodyGradientEnd: "#141517",
        screenBezel: "#0B0C0E",
        screenWallpaperStart: "#1E3A8A",
        screenWallpaperEnd: "#0F172A",
        accentColor: "#38BDF8",
        keyboardColor: "#0F1012",
        isMacBook: true,
        badgeText: "M3 Pro",
      };
    }
    return {
      bodyColor: "#E2E8F0",
      bodyGradientStart: "#F1F5F9",
      bodyGradientEnd: "#CBD5E1",
      screenBezel: "#0F172A",
      screenWallpaperStart: "#06B6D4",
      screenWallpaperEnd: "#3B82F6",
      accentColor: "#0EA5A4",
      keyboardColor: "#1E293B",
      isMacBook: true,
      badgeText: laptop.id.includes("m3") ? "M3" : "M2",
    };
  }

  if (isGaming) {
    if (name.includes("rog") || name.includes("zephyrus")) {
      return {
        bodyColor: "#F8FAFC",
        bodyGradientStart: "#FFFFFF",
        bodyGradientEnd: "#E2E8F0",
        screenBezel: "#0F172A",
        screenWallpaperStart: "#4F46E5",
        screenWallpaperEnd: "#06B6D4",
        accentColor: "#06B6D4",
        keyboardColor: "#334155",
        isGaming: true,
        badgeText: "ROG OLED",
      };
    }
    if (name.includes("loq") || name.includes("legion")) {
      return {
        bodyColor: "#1E293B",
        bodyGradientStart: "#334155",
        bodyGradientEnd: "#0F172A",
        screenBezel: "#0F172A",
        screenWallpaperStart: "#0EA5A4",
        screenWallpaperEnd: "#0F172A",
        accentColor: "#0EA5A4",
        keyboardColor: "#020617",
        isGaming: true,
        badgeText: "LENOVO AI",
      };
    }
    if (name.includes("victus") || name.includes("omen")) {
      return {
        bodyColor: "#18181B",
        bodyGradientStart: "#27272A",
        bodyGradientEnd: "#09090B",
        screenBezel: "#09090B",
        screenWallpaperStart: "#2563EB",
        screenWallpaperEnd: "#1E1B4B",
        accentColor: "#38BDF8",
        keyboardColor: "#09090B",
        isGaming: true,
        badgeText: "OMEN / VICTUS",
      };
    }
    return {
      bodyColor: "#1F2937",
      bodyGradientStart: "#374151",
      bodyGradientEnd: "#111827",
      screenBezel: "#111827",
      screenWallpaperStart: "#DC2626",
      screenWallpaperEnd: "#1E1B4B",
      accentColor: "#F59E0B",
      keyboardColor: "#030712",
      isGaming: true,
      badgeText: "GAMING",
    };
  }

  // Everyday / OLED Ultrabooks
  if (name.includes("zenbook") || name.includes("swift") || name.includes("yoga")) {
    return {
      bodyColor: "#0F172A",
      bodyGradientStart: "#1E293B",
      bodyGradientEnd: "#020617",
      screenBezel: "#020617",
      screenWallpaperStart: "#0EA5A4",
      screenWallpaperEnd: "#6366F1",
      accentColor: "#2DD4BF",
      keyboardColor: "#0F172A",
      badgeText: "OLED",
    };
  }

  // Standard everyday silver
  return {
    bodyColor: "#E2E8F0",
    bodyGradientStart: "#F8FAFC",
    bodyGradientEnd: "#CBD5E1",
    screenBezel: "#1E293B",
    screenWallpaperStart: "#0284C7",
    screenWallpaperEnd: "#0EA5A4",
    accentColor: "#0EA5A4",
    keyboardColor: "#334155",
    badgeText: laptop.brand.toUpperCase(),
  };
}

function generateSvg(laptop: (typeof LAPTOPS)[0]): string {
  const style = getStyleForLaptop(laptop);
  const uid = laptop.id.replace(/[^a-z0-9]/gi, "_");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" fill="none">
  <defs>
    <!-- Screen Gradient -->
    <linearGradient id="screen_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.screenWallpaperStart}" />
      <stop offset="100%" stop-color="${style.screenWallpaperEnd}" />
    </linearGradient>
    <!-- Body Base Gradient -->
    <linearGradient id="body_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.bodyGradientStart}" />
      <stop offset="100%" stop-color="${style.bodyGradientEnd}" />
    </linearGradient>
    <!-- Hinge / Depth Shadow -->
    <linearGradient id="shadow_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
    </linearGradient>
    <!-- Keyboard Accent Lighting -->
    <linearGradient id="kb_glow_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${style.accentColor}" stop-opacity="0.6" />
      <stop offset="50%" stop-color="${style.accentColor}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${style.accentColor}" stop-opacity="0.6" />
    </linearGradient>
  </defs>

  <!-- Ground Soft Drop Shadow -->
  <ellipse cx="200" cy="272" rx="145" ry="14" fill="#0F172A" fill-opacity="0.1" filter="blur(4px)" />
  <ellipse cx="200" cy="270" rx="125" ry="8" fill="#0F172A" fill-opacity="0.14" />

  <!-- ── 1. LAPTOP DISPLAY / LID (Angled Open Perspective) ── -->
  <g id="screen-assembly">
    <!-- Screen Outer Shell Bezel -->
    <rect x="70" y="32" width="260" height="170" rx="10" fill="${style.bodyColor}" stroke="#CBD5E1" stroke-width="1.5" />
    
    <!-- Screen Inner Bezel -->
    <rect x="74" y="36" width="252" height="160" rx="6" fill="${style.screenBezel}" />

    <!-- Webcam Notch / Dot -->
    <circle cx="200" cy="42" r="2" fill="#38BDF8" fill-opacity="0.8" />
    <circle cx="200" cy="42" r="1" fill="#FFFFFF" />

    <!-- Active Display Screen Glass -->
    <rect x="80" y="46" width="240" height="142" rx="3" fill="url(#screen_${uid})" />

    <!-- Wallpaper Abstract Graphics -->
    <path d="M80 140 Q 140 80, 200 120 T 320 70 L 320 188 L 80 188 Z" fill="#FFFFFF" fill-opacity="0.08" />
    <path d="M80 160 Q 160 110, 240 140 T 320 110 L 320 188 L 80 188 Z" fill="${style.accentColor}" fill-opacity="0.2" />
    <circle cx="270" cy="85" r="30" fill="#FFFFFF" fill-opacity="0.12" />

    <!-- Brand / Series Logo inside Screen -->
    <rect x="160" y="100" width="80" height="24" rx="12" fill="#000000" fill-opacity="0.35" backdrop-filter="blur(4px)" />
    <text x="200" y="116" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
      ${laptop.brand.toUpperCase()}
    </text>

    <!-- Glass Glare Reflection -->
    <polygon points="80,46 160,46 80,188" fill="#FFFFFF" fill-opacity="0.06" />
  </g>

  <!-- ── 2. LAPTOP BASE / KEYBOARD DECK (Standard 4:3 Proportion) ── -->
  <g id="base-assembly">
    <!-- Hinge Bar -->
    <rect x="130" y="196" width="140" height="8" rx="3" fill="#1E293B" />

    <!-- Main Chassis / Palmrest -->
    <polygon points="40,256 360,256 332,198 68,198" fill="url(#body_${uid})" stroke="#94A3B8" stroke-width="1.5" />
    
    <!-- Base Front Edge Lip -->
    <polygon points="40,256 360,256 356,264 44,264" fill="${style.bodyColor}" stroke="#94A3B8" stroke-width="1" />
    <!-- Front Opening Notch -->
    <rect x="180" y="256" width="40" height="3" rx="1" fill="#64748B" />

    <!-- Keyboard Well Recess -->
    <polygon points="86,236 314,236 304,204 96,204" fill="${style.keyboardColor}" stroke="${style.bodyColor}" stroke-width="1" />
    <!-- Keyboard Key Grid -->
    <line x1="94" y1="212" x2="306" y2="212" stroke="#475569" stroke-width="1" stroke-dasharray="8 3" />
    <line x1="91" y1="220" x2="309" y2="220" stroke="#475569" stroke-width="1" stroke-dasharray="9 3" />
    <line x1="88" y1="228" x2="312" y2="228" stroke="#475569" stroke-width="1" stroke-dasharray="10 3" />
    <!-- Spacebar -->
    <rect x="160" y="230" width="80" height="4" rx="1.5" fill="#64748B" />

    <!-- Keyboard Accent Glow for Gaming Laptops -->
    ${
      style.isGaming
        ? `<rect x="90" y="206" width="220" height="28" rx="2" fill="url(#kb_glow_${uid})" />`
        : ""
    }

    <!-- Precision Touchpad -->
    <polygon points="166,252 234,252 230,240 170,240" fill="${style.bodyColor}" stroke="#94A3B8" stroke-width="1" />
  </g>
</svg>`;
}

let count = 0;
for (const laptop of LAPTOPS) {
  const svg = generateSvg(laptop);
  const filePath = path.join(outputDir, `${laptop.id}.svg`);
  fs.writeFileSync(filePath, svg, "utf-8");
  count++;
}

console.log(`Successfully generated ${count} normalized laptop image assets in ${outputDir}!`);
