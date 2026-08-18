"use client";

import React from "react";
import { ParsedRequirements } from "@/lib/nlpParser";
import { formatCurrency } from "@/lib/utils";
import { CurrencyCode } from "@/types";
import {
  Sparkles,
  Wallet,
  Briefcase,
  Sliders,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface InterpretedRequirementsCardProps {
  parsed: ParsedRequirements;
  onConfirm: () => void;
  onEdit: () => void;
}

const GPU_LABELS: Record<string, string> = {
  integrated: "Integrated Graphics (Battery-focused)",
  "dedicated-preferred": "Dedicated GPU Preferred",
  "gaming-required": "Gaming GPU Required (RTX series)",
  "no-preference": "No specific GPU preference",
};

export function InterpretedRequirementsCard({
  parsed,
  onConfirm,
  onEdit,
}: InterpretedRequirementsCardProps) {
  const cur: CurrencyCode = parsed.currency || "INR";

  const getBudgetLabel = (b: string, currency: CurrencyCode) => {
    if (currency === "USD") {
      switch (b) {
        case "under-40k": return "Under $500";
        case "40k-50k": return "$500 – $750";
        case "50k-75k": return "$750 – $1,000";
        case "75k-100k": return "$1,000 – $1,400";
        case "above-100k": return "Above $1,400";
      }
    } else if (currency === "GBP") {
      switch (b) {
        case "under-40k": return "Under £450";
        case "40k-50k": return "£450 – £650";
        case "50k-75k": return "£650 – £900";
        case "75k-100k": return "£900 – £1,200";
        case "above-100k": return "Above £1,200";
      }
    } else if (currency === "EUR") {
      switch (b) {
        case "under-40k": return "Under €500";
        case "40k-50k": return "€500 – €750";
        case "50k-75k": return "€750 – €1,000";
        case "75k-100k": return "€1,000 – €1,500";
        case "above-100k": return "Above €1,500";
      }
    }

    // Default INR
    switch (b) {
      case "under-40k": return "Under ₹40,000";
      case "40k-50k": return "₹40,000 – ₹50,000";
      case "50k-75k": return "₹50,000 – ₹75,000";
      case "75k-100k": return "₹75,000 – ₹1,00,000";
      case "above-100k": return "Above ₹1,00,000";
      default: return b;
    }
  };

  const budgetDisplay = parsed.rawBudgetAmount
    ? `${formatCurrency(parsed.rawBudgetAmount, cur)} (${getBudgetLabel(parsed.budget, cur)})`
    : getBudgetLabel(parsed.budget, cur);

  return (
    <Card className="p-6 sm:p-10 rounded-3xl border-brand-500/40 bg-surface-900/90 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto space-y-7 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Here&apos;s what we understood
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
              Extracted from your request: <span className="text-surface-300 italic">&ldquo;{parsed.rawQuery}&rdquo;</span>
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="border-surface-700 text-xs font-semibold self-start sm:self-auto"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit Preferences</span>
        </Button>
      </div>

      {/* Interpreted Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Budget */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-brand-400">
            <Wallet className="h-4 w-4" />
            <span>Target Budget</span>
          </div>
          <div className="text-sm font-bold text-white font-sans">{budgetDisplay}</div>
        </div>

        {/* Market & Region */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Globe className="h-4 w-4" />
            <span>Detected Market</span>
          </div>
          <div className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <span>{cur} ({parsed.country || "IN"})</span>
            <span className="text-[10px] text-surface-500 font-normal">Auto-detected</span>
          </div>
        </div>

        {/* Primary Use */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <Briefcase className="h-4 w-4" />
            <span>Primary Workload</span>
          </div>
          <div className="text-sm font-bold text-white font-sans">{parsed.primaryUse}</div>
        </div>

        {/* RAM Preference */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
            <Layers className="h-4 w-4" />
            <span>Memory (RAM)</span>
          </div>
          <div className="text-sm font-bold text-white font-sans">
            {parsed.ramPreference === "no-preference" ? "Balanced for workload" : `${parsed.ramPreference} RAM`}
          </div>
        </div>

        {/* GPU Preference */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Graphics (GPU)</span>
          </div>
          <div className="text-sm font-bold text-white font-sans">
            {GPU_LABELS[parsed.gpuPreference] || parsed.gpuPreference}
          </div>
        </div>

        {/* Storage Preference (if specified) */}
        {parsed.storagePreference && (
          <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Layers className="h-4 w-4" />
              <span>Storage (SSD)</span>
            </div>
            <div className="text-sm font-bold text-white font-sans">
              {parsed.storagePreference} NVMe SSD
            </div>
          </div>
        )}

        {/* CPU Preference (if specified) */}
        {parsed.minCpu && (
          <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>Processor Requirement</span>
            </div>
            <div className="text-sm font-bold text-white font-sans">
              {parsed.minCpu} Tier or equivalent
            </div>
          </div>
        )}

        {/* Preferred Brands (if specified) */}
        {parsed.preferredBrands && parsed.preferredBrands.length > 0 && (
          <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span>Preferred Brands</span>
            </div>
            <div className="text-sm font-bold text-white font-sans">
              {parsed.preferredBrands.join(", ")}
            </div>
          </div>
        )}

        {/* Priorities */}
        <div className="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-teal-400">
            <Sliders className="h-4 w-4" />
            <span>Key Priorities</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {parsed.priorities.map((p) => (
              <span
                key={p}
                className="rounded-lg bg-surface-900 border border-surface-700 px-2 py-0.5 text-xs font-semibold text-teal-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-800">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onEdit}
          className="w-full sm:w-auto text-xs font-semibold border-surface-700 justify-center"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Adjust Requirements</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onConfirm}
          className="w-full sm:w-auto font-bold text-sm justify-center shadow-lg shadow-brand-500/20 px-8 py-3"
        >
          <span>Find My Laptop</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
