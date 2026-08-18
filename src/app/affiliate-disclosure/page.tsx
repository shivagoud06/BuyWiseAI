import React from "react";
import { Info, ExternalLink, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Affiliate Disclosure | BuyWise AI",
  description: "Transparency disclosure regarding affiliate partnerships and links on BuyWise AI.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Info className="h-3.5 w-3.5" />
            <span>Transparency &amp; Ethics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Affiliate Disclosure
          </h1>
          <p className="text-xs sm:text-sm text-surface-400">
            Last Updated: 2026-08-18 • Version 1.0
          </p>
        </div>

        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-6 text-sm text-surface-300 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-brand-400" />
              1. How We Maintain Free Access
            </h2>
            <p>
              BuyWise AI is free for consumers to research, score, and compare laptops. In order to sustain platform infrastructure and engineering, we may earn an affiliate commission when you click outbound retailer links and complete a qualifying purchase.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              2. Editorial Independence &amp; Algorithmic Scoring
            </h2>
            <p>
              Our 5-pillar BuyWise scores, specifications evaluations, and AI recommendation rankings are computed entirely objectively from hardware parameters. Affiliate partnerships have zero influence on scores, verdicts, or algorithmic rankings.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              3. No Extra Cost to You
            </h2>
            <p>
              Clicking an affiliate link never increases the price you pay at the retailer. You always receive the identical price or any applicable discounts directly from the merchant.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
