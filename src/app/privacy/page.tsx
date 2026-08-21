import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy | BuyWise AI",
  description: "Learn how BuyWise AI respects and protects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Last Updated: 2026-08-20 • Version 2.0
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-6 text-sm text-[#475569] leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-600" />
              1. Information We Collect
            </h2>
            <p>
              BuyWise AI is designed as a privacy-friendly shopping decision engine. We do not require account registration, passwords, or personal identity documents to explore catalog laptops, use the AI Advisor, or compare prices.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-600" />
              2. How We Use Information
            </h2>
            <p>
              Search queries, filter selections, and advisor preferences are processed client-side in your browser to generate relevant laptop recommendations and comparative rankings.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              3. Contact Information
            </h2>
            <p>
              If you have any questions or inquiries regarding our privacy policy, please reach out to our team at{" "}
              <strong className="text-[#111827]">{siteConfig.supportEmail}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
