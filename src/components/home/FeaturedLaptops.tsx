import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LAPTOPS } from "@/data/laptops";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * Featured Laptops Section on the Homepage
 * Pulls directly from the central single-source-of-truth dataset (LAPTOPS in src/data/laptops.ts).
 * Uses the exact same shared LaptopCard component and real product IDs as /laptops.
 */
export function FeaturedLaptops() {
  const featuredIds = [
    "lenovo-loq-15iax9-rtx3050",
    "apple-macbook-air-13-m2",
    "lenovo-ideapad-slim-3-15iah8",
    "acer-swift-go-14-sfg14-71",
    "asus-tuf-a15-fa507nv",
    "apple-macbook-pro-14-m3-pro",
    "asus-vivobook-16-m1605ya",
    "hp-pavilion-15-eg3001tu",
  ];

  const popularLaptops = featuredIds
    .map((id) => LAPTOPS.find((l) => l.id === id))
    .filter((l): l is typeof LAPTOPS[0] => l !== undefined)
    .slice(0, 8);

  return (
    <section className="py-12 sm:py-16 border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-[#0EA5A4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0EA5A4]">
                  Real Catalog Preview
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
                Explore real laptops in India
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] font-normal">
                Verified models from official specs across student, coding, gaming, and pro creator tiers.
              </p>
            </div>
            <Link
              href="/laptops"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0EA5A4] hover:text-[#087F7E] transition-colors shrink-0"
            >
              <span>View all {LAPTOPS.length} laptops</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 4-Column Laptop Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {popularLaptops.map((laptop, index) => (
            <ScrollReveal key={laptop.id} delay={index * 50}>
              <LaptopCard laptop={laptop} />
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={100}>
          <div className="mt-8 text-center">
            <Link href="/laptops" id="view-all-laptops-cta">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] px-6 py-3 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]"
              >
                <span>View all {LAPTOPS.length} verified laptops in Indian catalog</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
