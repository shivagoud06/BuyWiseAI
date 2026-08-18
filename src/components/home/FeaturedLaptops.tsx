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
  // Select 6 prominent laptops from central dataset representing diverse price tiers and workloads
  const featuredIds = [
    "lenovo-loq-15iax9-rtx3050",   // Lenovo LOQ 15 Gen 9 (Top Value Gaming/Coding)
    "apple-macbook-air-13-m2",     // Apple MacBook Air M2 (Best Ultrabook)
    "lenovo-ideapad-slim-3-15iah8",// Lenovo IdeaPad Slim 3 i5 H-Series (Best Coding Under ₹50k)
    "acer-swift-go-14-sfg14-71",   // Acer Swift Go 14 OLED (Best Display)
    "asus-tuf-a15-fa507nv",        // ASUS TUF Gaming A15 RTX 4060 (Best Gaming Deal)
    "apple-macbook-pro-14-m3-pro", // Apple MacBook Pro 14 M3 Pro (Pro Creator King)
  ];

  const popularLaptops = featuredIds
    .map((id) => LAPTOPS.find((l) => l.id === id))
    .filter((l): l is typeof LAPTOPS[0] => l !== undefined);

  return (
    <section className="py-16 sm:py-20 border-t border-surface-850/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Real Catalog Preview
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
                Explore real laptops in India
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-surface-400 font-normal">
                Verified models from official manufacturer specs across student, coding, gaming, and pro creator tiers.
              </p>
            </div>

            <Link
              href="/laptops"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <span>View all {LAPTOPS.length} laptops</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 6 Laptop Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLaptops.map((laptop, index) => (
            <ScrollReveal key={laptop.id} delay={index * 60}>
              <LaptopCard laptop={laptop} />
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom CTA Link */}
        <ScrollReveal delay={100}>
          <div className="mt-10 text-center">
            <Link
              href="/laptops"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900/80 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:border-surface-600 hover:bg-surface-800 transition-all shadow-md"
            >
              <span>View all {LAPTOPS.length} verified laptops in Indian catalog</span>
              <ArrowRight className="h-4 w-4 text-brand-400" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
