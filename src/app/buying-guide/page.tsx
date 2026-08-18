import React from "react";
import Link from "next/link";
import { BookOpen, Cpu, Layers, HardDrive, Monitor, Battery, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Laptop Buying Guide (India Edition) | BuyWise AI",
  description: "Comprehensive guide to choosing the right laptop processor, RAM, GPU, display, and battery for your budget in India.",
};

export default function BuyingGuidePage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Essential Buyer Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Laptop Buying Guide (2026 India Edition)
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to evaluate processors, memory, graphics, displays, and battery life to pick the perfect laptop.
          </p>
        </div>

        {/* Section 1: Processors */}
        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-4">
          <div className="flex items-center gap-3 text-brand-400">
            <Cpu className="h-6 w-6" />
            <h2 className="text-xl font-bold text-white">1. Choosing the Right Processor (CPU)</h2>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed">
            The CPU is the brain of your laptop. For basic web browsing and office productivity, an <strong>Intel Core i3 (12th/13th Gen)</strong> or <strong>AMD Ryzen 3</strong> is sufficient. For programming, multitasking, and STEM coursework, prioritize <strong>Intel Core i5 (H/P-series)</strong> or <strong>AMD Ryzen 5/7</strong>. For heavy gaming, 3D rendering, or 4K video editing, look for <strong>Intel Core i7/i9</strong> or <strong>Apple M-series</strong>.
          </p>
        </Card>

        {/* Section 2: RAM */}
        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <Layers className="h-6 w-6" />
            <h2 className="text-xl font-bold text-white">2. Memory (RAM) Guidelines</h2>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed">
            <strong>8GB RAM</strong> is the minimum for entry-level use. However, for seamless multitasking and future-proofing, <strong>16GB RAM</strong> (DDR5 or LPDDR5) is highly recommended for all modern users. Ensure dual-channel RAM configurations for peak integrated GPU bandwidth.
          </p>
        </Card>

        {/* Section 3: Storage */}
        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <HardDrive className="h-6 w-6" />
            <h2 className="text-xl font-bold text-white">3. Storage: Always Choose NVMe SSDs</h2>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed">
            Never purchase a laptop with traditional spinning HDDs as the primary boot drive. Aim for at least <strong>512GB PCIe NVMe SSD</strong> storage to accommodate Windows updates, software development tools, or game installations comfortably.
          </p>
        </Card>

        {/* Section 4: Display & Battery */}
        <Card className="p-6 sm:p-8 rounded-2xl border-surface-800 bg-surface-900/60 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <Monitor className="h-6 w-6" />
            <h2 className="text-xl font-bold text-white">4. Display Quality &amp; Battery</h2>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed">
            Look for <strong>Full HD (1920x1080) IPS panels</strong> with at least 250–300 nits brightness and 100% sRGB if you do creative work. For portable productivity, look for battery capacities above 50Wh with USB-C fast charging support.
          </p>
        </Card>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-950/80 to-surface-900/90 border border-brand-500/30 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Want tailored recommendations for your budget?</h3>
          <p className="text-xs sm:text-sm text-surface-400 max-w-lg mx-auto">
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
