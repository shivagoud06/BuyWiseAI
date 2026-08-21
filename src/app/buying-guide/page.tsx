import React from "react";
import Link from "next/link";
import { BookOpen, Cpu, Layers, HardDrive, Monitor, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Laptop Buying Guide (India Edition) | BuyWise AI",
  description: "Comprehensive guide to choosing the right laptop processor, RAM, GPU, display, and battery for your budget in India.",
};

export default function BuyingGuidePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Essential Buyer Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
            Laptop Buying Guide (2026 India Edition)
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to evaluate processors, memory, graphics, displays, and battery life to pick the perfect laptop.
          </p>
        </div>

        {/* Section 1: Processors */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-teal-600">
            <Cpu className="h-6 w-6" />
            <h2 className="text-xl font-bold text-[#111827]">1. Choosing the Right Processor (CPU)</h2>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">
            The CPU is the brain of your laptop. For basic web browsing and office productivity, an <strong className="text-[#111827]">Intel Core i3 (12th/13th Gen)</strong> or <strong className="text-[#111827]">AMD Ryzen 3</strong> is sufficient. For programming, multitasking, and STEM coursework, prioritize <strong className="text-[#111827]">Intel Core i5 (H/P-series)</strong> or <strong className="text-[#111827]">AMD Ryzen 5/7</strong>. For heavy gaming, 3D rendering, or 4K video editing, look for <strong className="text-[#111827]">Intel Core i7/i9</strong> or <strong className="text-[#111827]">Apple M-series</strong>.
          </p>
        </div>

        {/* Section 2: RAM */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-cyan-600">
            <Layers className="h-6 w-6" />
            <h2 className="text-xl font-bold text-[#111827]">2. Memory (RAM) Guidelines</h2>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">
            <strong className="text-[#111827]">8GB RAM</strong> is the minimum for entry-level use. However, for seamless multitasking and future-proofing, <strong className="text-[#111827]">16GB RAM</strong> (DDR5 or LPDDR5) is highly recommended for all modern users. Ensure dual-channel RAM configurations for peak integrated GPU bandwidth.
          </p>
        </div>

        {/* Section 3: Storage */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-emerald-600">
            <HardDrive className="h-6 w-6" />
            <h2 className="text-xl font-bold text-[#111827]">3. Storage: Always Choose NVMe SSDs</h2>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">
            Never purchase a laptop with traditional spinning HDDs as the primary boot drive. Aim for at least <strong className="text-[#111827]">512GB PCIe NVMe SSD</strong> storage to accommodate Windows updates, software development tools, or game installations comfortably.
          </p>
        </div>

        {/* Section 4: Display & Battery */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-amber-600">
            <Monitor className="h-6 w-6" />
            <h2 className="text-xl font-bold text-[#111827]">4. Display Quality &amp; Battery</h2>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">
            Look for <strong className="text-[#111827]">Full HD (1920x1080) IPS panels</strong> with at least 250–300 nits brightness and 100% sRGB if you do creative work. For portable productivity, look for battery capacities above 50Wh with USB-C fast charging support.
          </p>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827]">Want tailored recommendations for your budget?</h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto">
            Use our interactive AI Advisor to find the exact configuration matched to your daily workflow.
          </p>
          <div className="pt-2">
            <Link href="/advisor">
              <Button variant="primary" size="lg" className="gap-2">
                <span>Find My Laptop</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
