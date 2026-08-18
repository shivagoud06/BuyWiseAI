import React from "react";
import { Sparkles, Cpu, Wallet, Layers, Monitor, Battery, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ScoreExplainer() {
  return (
    <section id="score-explainer" className="py-16 sm:py-20 border-t border-surface-850/80">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <ScrollReveal>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Evaluation System
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
                  One score. A clearer decision.
                </h2>
                <p className="text-sm sm:text-base text-surface-300 leading-relaxed font-normal">
                  BuyWise Score combines the product information we have into an easy-to-understand score.
                </p>
                <div className="rounded-xl border border-surface-800 bg-surface-900/60 p-4 text-xs text-surface-400 leading-relaxed flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    BuyWise Score represents an internal product assessment based on hardware specs, thermal design, and pricing. It is not an external scientific certification.
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Example Visual Score Card */}
          <div className="lg:col-span-6">
            <ScrollReveal delay={100}>
              <Card className="p-6 sm:p-8 rounded-3xl border-surface-750 bg-surface-900/90 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-800">
                  <div>
                    <span className="text-xs font-semibold text-surface-400 block uppercase tracking-wider">
                      Score Example
                    </span>
                    <h3 className="text-base font-bold text-white font-sans mt-0.5">
                      BuyWise Composite Rating
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-1 rounded-2xl bg-brand-500/15 border border-brand-400/40 px-3.5 py-1.5 text-brand-300 font-bold text-xl font-sans">
                    <span>92</span>
                    <span className="text-xs text-brand-400/70 font-normal">/ 100</span>
                  </div>
                </div>

                {/* 5 Pillars */}
                <div className="space-y-3.5 text-xs">
                  {/* 1. Performance */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Cpu className="h-3.5 w-3.5 text-brand-400" />
                        Performance
                      </span>
                      <span className="font-bold text-white">93%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full w-[93%]" />
                    </div>
                  </div>

                  {/* 2. Value */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Wallet className="h-3.5 w-3.5 text-cyan-400" />
                        Value
                      </span>
                      <span className="font-bold text-white">92%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full w-[92%]" />
                    </div>
                  </div>

                  {/* 3. Features */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Layers className="h-3.5 w-3.5 text-teal-400" />
                        Features
                      </span>
                      <span className="font-bold text-white">90%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full w-[90%]" />
                    </div>
                  </div>

                  {/* 4. Display */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Monitor className="h-3.5 w-3.5 text-indigo-400" />
                        Display
                      </span>
                      <span className="font-bold text-white">92%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full w-[92%]" />
                    </div>
                  </div>

                  {/* 5. Battery */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-surface-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Battery className="h-3.5 w-3.5 text-emerald-400" />
                        Battery
                      </span>
                      <span className="font-bold text-white">78%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full w-[78%]" />
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
