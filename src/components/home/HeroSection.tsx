import React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-6 sm:pt-20 sm:pb-8 text-center overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[280px] w-[540px] rounded-full bg-gradient-to-tr from-brand-500/12 via-cyan-500/8 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Small Top Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="brand" size="md" className="px-3.5 py-1 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3 w-3 text-brand-400" />
            AI-Powered Buying Assistant
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.12] font-sans break-words">
          Buy the{" "}
          <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            right laptop
          </span>
          .<br className="hidden sm:inline" /> Not the most expensive one.
        </h1>

        {/* Supporting text */}
        <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-surface-300 leading-relaxed max-w-2xl mx-auto font-normal">
          Tell BuyWise your budget and what you need. We compare the options and help you make a smarter buying decision.
        </p>
      </div>
    </section>
  );
}
