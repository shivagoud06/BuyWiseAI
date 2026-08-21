"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const POPULAR_SEARCH_LINKS = [
  { title: "Best laptops under ₹50,000", href: "/laptops?budget=40k-50k" },
  { title: "Best laptop for programming", href: "/laptops?useCase=Programming" },
  { title: "Best laptop for students", href: "/laptops?useCase=Student" },
  { title: "Best gaming laptop", href: "/laptops?useCase=Gaming" },
  { title: "Best battery life", href: "/laptops?q=battery" },
  { title: "Best value laptop", href: "/laptops?sort=score-desc" },
];

export function PopularSearches() {
  return (
    <section className="py-4 pb-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
            <span>Popular:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCH_LINKS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
              >
                <span>{item.title}</span>
                <ArrowUpRight className="h-3 w-3 text-[#9CA3AF] group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
