import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-24 border-t border-surface-850/80 text-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[240px] w-[500px] rounded-full bg-gradient-to-tr from-brand-500/10 via-cyan-500/8 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Make A Confident Decision
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
              Still not sure what to buy?
            </h2>

            <p className="text-base sm:text-lg text-surface-300 max-w-xl mx-auto font-normal">
              Let BuyWise help you narrow it down.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/#advisor-box" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-sm justify-center shadow-lg shadow-brand-500/20 px-8 py-3.5">
                  <span>Find My Laptop</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/laptops" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold text-sm justify-center border-surface-700 hover:border-surface-600 px-8 py-3.5">
                  Browse Laptops
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
