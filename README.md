# BuyWise AI 💻🤖

> **Don't just buy. BuyWise.**  
> An AI-powered product buying assistant designed to help users cut through confusing spec sheets and find the right laptop based on their budget and exact workload.

---

## 🌟 Version 1 Scope

Version 1 is focused **strictly on laptops**:
- Intelligent workload & budget matching
- Real-world benchmark and spec-to-price value scoring
- Definite **Buy / Wait / Skip** verdicts with plain-English rationales
- Direct verified purchase links

---

## 📁 Scalable Directory Architecture

```
BuyWiseAI/
├── public/                       # Static public assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── globals.css           # Global CSS and custom themes
│   │   ├── layout.tsx            # App-wide layout with SEO & fonts
│   │   └── page.tsx              # Modern responsive homepage
│   ├── components/
│   │   ├── home/                 # Homepage sections
│   │   │   ├── HeroSection.tsx   # Hero title & highlights
│   │   │   ├── SearchArea.tsx    # Budget & usage input area
│   │   │   ├── PopularSearches.tsx # Curated popular queries
│   │   │   ├── HowItWorks.tsx    # 3-step walkthrough
│   │   │   └── ValueProps.tsx    # Buy/Wait/Skip system
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Responsive header & nav
│   │   │   └── Footer.tsx        # Tech-focused footer
│   │   └── ui/                   # Reusable UI component primitives
│   │       ├── Button.tsx        # Button variants
│   │       ├── Card.tsx          # Glassmorphic card container
│   │       └── Badge.tsx         # Semantic tags & badges
│   ├── lib/
│   │   └── utils.ts              # Tailwind merge utility (cn)
│   └── types/
│       └── index.ts              # Domain TypeScript types
├── tailwind.config.ts            # Custom design tokens & colors
├── tsconfig.json                 # TypeScript strict configuration
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Run the Development Server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 🛠️ Verification Commands

```bash
# Check TypeScript types
npm run type-check

# Build for production
npm run build
```
