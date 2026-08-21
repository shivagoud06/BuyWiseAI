"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Info, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/config/site";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E2E8F0] bg-slate-50 text-[#64748B]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-3">
              <Link href="/" className="inline-flex items-center transition-transform hover:opacity-90">
                <Logo size="md" />
              </Link>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                {siteConfig.description}
              </p>
            </div>

            {/* Navigation Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-4 font-sans">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link href="/" className="hover:text-teal-600 transition-colors">Home</Link></li>
                <li><Link href="/laptops" className="hover:text-teal-600 transition-colors">Laptops</Link></li>
                <li><Link href="/compare" className="hover:text-teal-600 transition-colors">Compare</Link></li>
                <li><Link href="/advisor" className="hover:text-teal-600 transition-colors">AI Advisor</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="hover:text-teal-600 transition-colors text-left text-xs sm:text-sm text-[#64748B]"
                  >
                    Give Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-4 font-sans">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link href="/buying-guide" className="hover:text-teal-600 transition-colors">Laptop Buying Guide</Link></li>
                <li><Link href="/how-it-works" className="hover:text-teal-600 transition-colors">How BuyWise Works</Link></li>
                <li><Link href="/advisor" className="hover:text-teal-600 transition-colors">Find My Laptop</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-4 font-sans flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-teal-600" />
                Support
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="text-[#64748B] text-xs leading-relaxed">Have a question or need help?</p>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block font-semibold">Email:</span>
                  <span className="text-[#1E293B] font-sans text-xs sm:text-sm break-all block">{siteConfig.supportEmail}</span>
                </div>
              </div>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-4 font-sans">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/affiliate-disclosure" className="hover:text-teal-600 transition-colors">Affiliate Disclosure</Link></li>
              </ul>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs text-[#64748B] leading-relaxed mb-6 flex items-start gap-2.5 shadow-sm">
            <Info className="h-4 w-4 text-[#94A3B8] shrink-0 mt-0.5" />
            <span>
              Product information and prices may change. Always verify the latest price, availability, and specifications with the retailer before making a purchase.
            </span>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-[#E2E8F0] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <p>© {currentYear} BuyWise AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Laptop Edition • India</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} source="footer" />
    </footer>
  );
}
