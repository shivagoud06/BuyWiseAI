import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy | BuyWise AI",
  description: "Learn how BuyWise AI respects and protects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-surface-400">
            Last Updated: 2026-08-18 • Version 1.0
          </p>
        </div>

        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-6 text-sm text-surface-300 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand-400" />
              1. Information We Collect
            </h2>
            <p>
              BuyWise AI is designed as a privacy-friendly shopping decision engine. We do not require account registration, passwords, or personal identity documents to explore catalog laptops, use the AI Advisor, or compare prices.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              2. How We Use Information
            </h2>
            <p>
              Search queries, filter selections, and advisor preferences are processed client-side in your browser to generate relevant laptop recommendations and comparative rankings.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              3. Contact Information
            </h2>
            <p>
              If you have any questions or inquiries regarding our privacy policy, please reach out to our team at{" "}
              <strong className="text-white">{siteConfig.supportEmail}</strong>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
