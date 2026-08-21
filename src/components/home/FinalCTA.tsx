import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 border-t border-[#E5E7EB] text-center relative overflow-hidden max-w-full">
      {/* Subtle teal glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="h-[240px] w-[min(500px,100vw)] rounded-full bg-gradient-to-tr from-brand-400/8 via-cyan-400/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Make A Confident Decision
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827] font-sans">
              Still not sure what to buy?
            </h2>

            <p className="text-base sm:text-lg text-[#6B7280] max-w-xl mx-auto font-normal">
              Let BuyWise help you narrow it down. Tell us your budget and use case — we&apos;ll handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/#advisor-box" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 px-8 py-3.5 rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Find My Laptop
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <Link href="/laptops" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#374151] bg-white border border-[#E5E7EB] hover:border-brand-400 hover:text-brand-600 px-8 py-3.5 rounded-xl transition-all shadow-sm"
                >
                  Browse Laptops
                </button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
