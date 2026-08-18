import React from "react";
import { FileCheck, ShieldAlert, Scale, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Terms of Service | BuyWise AI",
  description: "Terms and conditions for using BuyWise AI laptop shopping engine.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-surface-400">
            Last Updated: 2026-08-18 • Version 1.0
          </p>
        </div>

        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-6 text-sm text-surface-300 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-400" />
              1. Platform Purpose &amp; Information Accuracy
            </h2>
            <p>
              BuyWise AI provides product information, specification analysis, and price comparisons for research and informational purposes. While we strive to maintain verified product specifications, product configurations, prices, and stock availability may change on third-party retailer websites. Always verify details with the seller prior to checkout.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              2. Third-Party Transactions
            </h2>
            <p>
              BuyWise AI does not directly sell products or process payments. When you click retailer buttons, you are redirected to third-party merchant platforms (such as Amazon, Flipkart, or Croma). All purchases are subject to the terms and return policies of the respective merchant.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              3. Questions &amp; Support
            </h2>
            <p>
              For inquiries regarding terms or platform features, contact us at{" "}
              <strong className="text-white">{siteConfig.supportEmail}</strong>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
