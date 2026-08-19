"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Laptop, Info, Mail, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/config/site";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-850 bg-surface-950/90 text-surface-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-surface-950 font-bold transition-transform group-hover:scale-105">
                  <Laptop className="h-4 w-4 stroke-[2.2]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  BuyWise <span className="text-brand-400">AI</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed font-normal">
                {siteConfig.description}
              </p>
            </div>

            {/* Navigation Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-200 mb-4 font-sans">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/" className="hover:text-brand-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/laptops" className="hover:text-brand-400 transition-colors">
                    Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-brand-400 transition-colors">
                    Compare
                  </Link>
                </li>
                <li>
                  <Link href="/advisor" className="hover:text-brand-400 transition-colors">
                    AI Advisor
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="hover:text-brand-400 transition-colors text-left flex items-center gap-1 text-xs sm:text-sm text-surface-400"
                  >
                    <span>Give Feedback</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-200 mb-4 font-sans">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/buying-guide" className="hover:text-brand-400 transition-colors">
                    Laptop Buying Guide
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-brand-400 transition-colors">
                    How BuyWise Works
                  </Link>
                </li>
                <li>
                  <Link href="/advisor" className="hover:text-brand-400 transition-colors">
                    Find My Laptop
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Support Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-200 mb-4 font-sans flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-brand-400" />
                Customer Support
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="text-surface-400 text-xs leading-relaxed">
                  Have a question or need help?
                </p>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-surface-500 uppercase tracking-wider block font-semibold">
                    Email:
                  </span>
                  <span className="text-surface-200 font-sans text-xs sm:text-sm break-all block">
                    {siteConfig.supportEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-200 mb-4 font-sans">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-brand-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-brand-400 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate-disclosure" className="hover:text-brand-400 transition-colors">
                    Affiliate Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="rounded-xl border border-surface-800/80 bg-surface-900/40 p-4 text-xs text-surface-400 leading-relaxed mb-8 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-surface-500 shrink-0 mt-0.5" />
            <span>
              Product information and prices may change. Always verify the latest price, availability and product details with the retailer before purchasing.
            </span>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-surface-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
            <p>© {currentYear} BuyWise AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Laptop Edition • India</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source="footer"
      />
    </footer>
  );
}
