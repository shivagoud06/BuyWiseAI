import React from "react";
import { Scale, Sparkles, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhyBuyWise() {
  const features = [
    {
      icon: Scale,
      iconClass: "text-brand-600 bg-brand-50 border-brand-200",
      title: "Compare Smarter",
      desc: "See the differences that actually matter — specs, value, and workload fit side by side.",
    },
    {
      icon: Sparkles,
      iconClass: "text-cyan-600 bg-cyan-50 border-cyan-200",
      title: "Understand Value",
      desc: "Look beyond specifications and price. BuyWise Score weighs what matters for your budget.",
    },
    {
      icon: CheckCircle2,
      iconClass: "text-teal-600 bg-teal-50 border-teal-200",
      title: "Decide Confidently",
      desc: "Get a clear BUY / WAIT / SKIP verdict instead of endless browser tabs and spec sheets.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              Shopping shouldn&apos;t feel like research.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B7280] leading-relaxed font-normal">
              Specifications tell you what a product has. BuyWise helps you understand what actually matters for your needs.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={idx * 80}>
                <div className="h-full bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${f.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#111827] font-sans">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed font-normal">{f.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
