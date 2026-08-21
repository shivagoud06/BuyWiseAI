import React from "react";
import { MessageSquare, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Tell us what you need",
      description: "Choose your budget and primary use — student, gaming, programming, or creator.",
      icon: MessageSquare,
      iconClass: "text-brand-600 border-brand-200 bg-brand-50",
    },
    {
      num: "02",
      title: "Compare your options",
      description: "See the spec, score, and price differences between suitable laptops side by side.",
      icon: SlidersHorizontal,
      iconClass: "text-cyan-600 border-cyan-200 bg-cyan-50",
    },
    {
      num: "03",
      title: "Make your decision",
      description: "Use BuyWise's BUY / WAIT / SKIP verdict to narrow your choice and shop with confidence.",
      icon: CheckCircle2,
      iconClass: "text-teal-600 border-teal-200 bg-teal-50",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              How BuyWise Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B7280] leading-relaxed font-normal">
              From initial requirements to a confident laptop choice in seconds.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} delay={idx * 80}>
                <div className="h-full bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#9CA3AF]">STEP {step.num}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${step.iconClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#111827] font-sans">{step.title}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed font-normal">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
