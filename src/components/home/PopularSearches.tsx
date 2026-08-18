"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const POPULAR_SEARCH_LINKS = [
  {
    title: "Best laptops under ₹50,000",
    href: "/laptops?budget=40k-50k",
  },
  {
    title: "Best laptop for programming",
    href: "/laptops?useCase=Programming",
  },
  {
    title: "Best laptop for students",
    href: "/laptops?useCase=Student",
  },
  {
    title: "Best gaming laptop",
    href: "/laptops?useCase=Gaming",
  },
  {
    title: "Best battery life",
    href: "/laptops?q=battery",
  },
  {
    title: "Best value laptop",
    href: "/laptops?sort=score-desc",
  },
];

export function PopularSearches() {
  return (
    <section className="py-4 pb-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-400 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-brand-400" />
              <span>Popular searches:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_LINKS.map((item, idx) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5 text-xs font-medium text-surface-300 hover:border-surface-700 hover:bg-surface-800 hover:text-white transition-all"
                >
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-3 w-3 text-surface-500 group-hover:text-brand-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
