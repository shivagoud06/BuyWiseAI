import React from "react";
import { Scale, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhyBuyWise() {
  return (
    <section className="py-16 sm:py-20 border-t border-surface-850/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
              Shopping shouldn&apos;t feel like research.
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-surface-400 leading-relaxed font-normal">
              Specifications tell you what a product has. BuyWise helps you understand what actually matters for your needs.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Feature Cards with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <ScrollReveal delay={0}>
            <Card className="h-full p-6 sm:p-7 rounded-2xl border-surface-800 bg-surface-900/50 hover:border-surface-700 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                Compare Smarter
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed font-normal">
                See the differences that actually matter.
              </p>
            </Card>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={80}>
            <Card className="h-full p-6 sm:p-7 rounded-2xl border-surface-800 bg-surface-900/50 hover:border-surface-700 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                Understand Value
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed font-normal">
                Look beyond specifications and price.
              </p>
            </Card>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={160}>
            <Card className="h-full p-6 sm:p-7 rounded-2xl border-surface-800 bg-surface-900/50 hover:border-surface-700 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                Decide Confidently
              </h3>
              <p className="text-xs sm:text-sm text-surface-400 leading-relaxed font-normal">
                Get a clear recommendation instead of endless tabs.
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
