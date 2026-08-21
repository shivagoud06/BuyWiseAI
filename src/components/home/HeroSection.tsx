"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Search, Scale, GraduationCap, Code2, Gamepad2, Palette, Briefcase, IndianRupee } from "lucide-react";

const CATEGORIES = [
  { name: "Student", href: "/laptops?useCase=Student", icon: GraduationCap },
  { name: "Programming", href: "/laptops?useCase=Programming", icon: Code2 },
  { name: "Gaming", href: "/laptops?useCase=Gaming", icon: Gamepad2 },
  { name: "Creator", href: "/laptops?useCase=Content Creation", icon: Palette },
  { name: "Business", href: "/laptops?useCase=Office", icon: Briefcase },
  { name: "Budget", href: "/laptops?budget=under-40k", icon: IndianRupee },
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/laptops?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/laptops");
    }
  };

  return (
    <section className="relative pt-10 pb-6 sm:pt-14 sm:pb-8 text-center overflow-hidden max-w-full">
      {/* Subtle teal ambient glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="h-[300px] w-[min(600px,100vw)] rounded-full bg-gradient-to-tr from-[#0EA5A4]/10 via-cyan-400/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0EA5A4] bg-[#E6FFFE] border border-[#99F6F3] px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="h-3 w-3 text-[#0EA5A4]" />
            AI-Powered Laptop Buying Assistant
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.15] font-sans break-words">
          Find the{" "}
          <span className="bg-gradient-to-r from-[#0EA5A4] via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            right laptop
          </span>
          .<br className="hidden sm:inline" /> Not just the most expensive one.
        </h1>

        {/* Subtext */}
        <p className="mt-3.5 sm:mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto font-normal">
          Tell BuyWise your budget and workload. We compare verified specs, live retailer prices, and calculate deterministic value scores.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brand, model, CPU (e.g. i5, M2, RTX 4060, student)..."
              className="w-full pl-11 pr-28 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#111827] placeholder-[#94A3B8] shadow-xs focus:outline-none focus:border-[#0EA5A4] focus:ring-2 focus:ring-[#0EA5A4]/20 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 rounded-lg bg-[#0EA5A4] hover:bg-[#087F7E] text-white text-xs font-bold transition-all shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Primary Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/advisor">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] px-5 py-2.5 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Find My Laptop
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
          <Link href="/compare">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#111827] bg-white border border-[#E2E8F0] hover:border-[#0EA5A4] hover:text-[#0EA5A4] hover:bg-[#E6FFFE] px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Scale className="h-3.5 w-3.5 text-[#0EA5A4]" />
              Compare Laptops
            </button>
          </Link>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-medium text-[#475569] hover:border-[#0EA5A4] hover:text-[#0EA5A4] hover:bg-[#E6FFFE] transition-all shadow-xs"
              >
                <Icon className="h-3.5 w-3.5 text-[#64748B]" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
