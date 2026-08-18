import React from "react";
import { MessageSquare, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Tell us what you need",
      description: "Choose your budget and primary use.",
      icon: MessageSquare,
      color: "text-brand-400 border-brand-500/20 bg-brand-500/10",
    },
    {
      num: "02",
      title: "Compare your options",
      description: "See the differences between suitable laptops.",
      icon: SlidersHorizontal,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    },
    {
      num: "03",
      title: "Make your decision",
      description: "Use BuyWise's recommendation to narrow your choice.",
      icon: CheckCircle2,
      color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-t border-surface-850/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
              How BuyWise Works
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-surface-400 leading-relaxed font-normal">
              From initial requirements to a confident laptop choice in seconds.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Steps with Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} delay={idx * 80}>
                <Card className="h-full p-6 sm:p-7 rounded-2xl border-surface-800 bg-surface-900/50 hover:border-surface-700 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-surface-500">
                      STEP {step.num}
                    </span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${step.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-surface-400 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
