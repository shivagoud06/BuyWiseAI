import React from "react";
import { Info, ExternalLink, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Affiliate Disclosure | BuyWise AI",
  description: "Transparency disclosure regarding affiliate partnerships and links on BuyWise AI.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Info className="h-3.5 w-3.5" />
            <span>Transparency &amp; Ethics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
            Affiliate Disclosure
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Last Updated: 2026-08-20 • Version 2.0
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-6 text-sm text-[#475569] leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-teal-600" />
              1. How We Maintain Free Access
            </h2>
            <p>
              BuyWise AI is free for consumers to research, score, and compare laptops. In order to sustain platform infrastructure and engineering, we may earn an affiliate commission when you click outbound retailer links and complete a qualifying purchase.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              2. Editorial Independence &amp; Algorithmic Scoring
            </h2>
            <p>
              Our 5-pillar BuyWise scores, specifications evaluations, and AI recommendation rankings are computed entirely objectively from hardware parameters. Affiliate partnerships have zero influence on scores, verdicts, or algorithmic rankings.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              3. No Extra Cost to You
            </h2>
            <p>
              Clicking an affiliate link never increases the price you pay at the retailer. You always receive the identical price or any applicable discounts directly from the merchant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
