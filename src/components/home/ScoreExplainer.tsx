import React from "react";
import { Sparkles, Cpu, Wallet, Layers, Monitor, Battery, Info } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ScoreExplainer() {
  const pillars = [
    { icon: Cpu, label: "Performance", value: 93, color: "bg-brand-500" },
    { icon: Wallet, label: "Value", value: 92, color: "bg-cyan-500" },
    { icon: Layers, label: "Features", value: 90, color: "bg-teal-500" },
    { icon: Monitor, label: "Display", value: 92, color: "bg-indigo-500" },
    { icon: Battery, label: "Battery", value: 78, color: "bg-emerald-500" },
  ];

  return (
    <section id="score-explainer" className="py-12 sm:py-16 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Explanation */}
          <div className="space-y-4">
            <ScrollReveal>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Evaluation System
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
                  One score. A clearer decision.
                </h2>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-normal">
                  BuyWise Score combines the product information we have into an easy-to-understand score — balancing performance, value, features, display, and battery.
                </p>
                <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-4 text-xs text-[#6B7280] leading-relaxed flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    BuyWise Score represents an internal product assessment based on hardware specs, thermal design, and pricing. It is not an external scientific certification.
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Example Score Card */}
          <div>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <span className="text-xs font-semibold text-[#6B7280] block uppercase tracking-wider">Score Example</span>
                    <h3 className="text-base font-bold text-[#111827] font-sans mt-0.5">BuyWise Composite Rating</h3>
                  </div>
                  <div className="flex items-baseline gap-1 rounded-2xl bg-brand-50 border border-brand-200 px-3.5 py-1.5 text-brand-700 font-bold text-xl font-sans">
                    <span>92</span>
                    <span className="text-xs text-brand-400 font-normal">/ 100</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  {pillars.map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-[#374151]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Icon className="h-3.5 w-3.5 text-[#6B7280]" />
                          {label}
                        </span>
                        <span className="font-bold text-[#111827]">{value}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
