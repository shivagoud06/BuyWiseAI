import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Tag, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "How BuyWise Works | BuyWise AI",
  description: "Learn how BuyWise AI evaluates laptop specifications, scores value for money, and finds the best listed price in India.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Architecture &amp; Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            How BuyWise Works
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl mx-auto">
            A transparent, deterministic platform built to simplify laptop decision-making in India.
          </p>
        </div>

        {/* Step 1: Verified Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl border-surface-800 bg-surface-900/60 space-y-3">
            <div className="flex items-center gap-2.5 text-brand-400 font-bold text-lg">
              <ShieldCheck className="h-5 w-5" />
              <h3>1. Exact Configuration Sourcing</h3>
            </div>
            <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              Every laptop in the catalog is indexed with its exact model number, SKU, processor generation, RAM capacity, and GPU classification directly from manufacturer specification sheets.
            </p>
          </Card>

          {/* Step 2: 5-Pillar Score */}
          <Card className="p-6 rounded-2xl border-surface-800 bg-surface-900/60 space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-lg">
              <Scale className="h-5 w-5" />
              <h3>2. The BuyWise Score</h3>
            </div>
            <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              Our 5-pillar scoring algorithm evaluates Performance, Price Value, Features, Display, and Battery Life on a 0–100 scale, giving you an unbiased indicator of actual hardware value.
            </p>
          </Card>

          {/* Step 3: Multi-Retailer Comparison */}
          <Card className="p-6 rounded-2xl border-surface-800 bg-surface-900/60 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
              <Tag className="h-5 w-5" />
              <h3>3. Best Listed Price Discovery</h3>
            </div>
            <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              The universal retailer engine verifies prices across major stores (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales) for that identical hardware configuration to highlight the lowest listed price.
            </p>
          </Card>

          {/* Step 4: AI Advisor Matching */}
          <Card className="p-6 rounded-2xl border-surface-800 bg-surface-900/60 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
              <Sparkles className="h-5 w-5" />
              <h3>4. Interactive AI Advisor</h3>
            </div>
            <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              Answer 4 simple questions regarding your budget, primary use cases, and feature priorities, and the advisor scores and ranks all available catalog options in real-time.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/advisor">
            <Button variant="primary" size="lg" className="gap-2">
              <span>Find My Laptop</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
