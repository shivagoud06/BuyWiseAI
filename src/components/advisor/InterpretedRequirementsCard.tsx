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
    <div className="p-5 sm:p-8 rounded-3xl border border-[#E2E8F0] bg-white shadow-xl max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] font-sans">
              Here&apos;s what we understood
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Extracted from: <span className="text-[#334155] font-medium italic">&ldquo;{parsed.rawQuery}&rdquo;</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#475569] hover:text-[#111827] hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit Preferences</span>
        </button>
      </div>

      {/* Interpreted Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Budget */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-teal-700">
            <Wallet className="h-4 w-4" />
            <span>Target Budget</span>
          </div>
          <div className="text-sm font-bold text-[#111827] font-sans">{budgetDisplay}</div>
        </div>

        {/* Market & Region */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <Globe className="h-4 w-4" />
            <span>Detected Market</span>
          </div>
          <div className="text-sm font-bold text-[#111827] font-sans flex items-center gap-2">
            <span>{cur} ({parsed.country || "IN"})</span>
            <span className="text-[10px] text-[#64748B] font-normal">Auto-detected</span>
          </div>
        </div>

        {/* Primary Use */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-cyan-700">
            <Briefcase className="h-4 w-4" />
            <span>Primary Workload</span>
          </div>
          <div className="text-sm font-bold text-[#111827] font-sans">{parsed.primaryUse}</div>
        </div>

        {/* RAM Preference */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700">
            <Layers className="h-4 w-4" />
            <span>Memory (RAM)</span>
          </div>
          <div className="text-sm font-bold text-[#111827] font-sans">
            {parsed.ramPreference === "no-preference" ? "Balanced for workload" : `${parsed.ramPreference} RAM`}
          </div>
        </div>

        {/* GPU Preference */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-700">
            <Sparkles className="h-4 w-4" />
            <span>Graphics (GPU)</span>
          </div>
          <div className="text-sm font-bold text-[#111827] font-sans">
            {GPU_LABELS[parsed.gpuPreference] || parsed.gpuPreference}
          </div>
        </div>

        {/* Storage Preference (if specified) */}
        {parsed.storagePreference && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <Layers className="h-4 w-4" />
              <span>Storage (SSD)</span>
            </div>
            <div className="text-sm font-bold text-[#111827] font-sans">
              {parsed.storagePreference} NVMe SSD
            </div>
          </div>
        )}

        {/* CPU Preference (if specified) */}
        {parsed.minCpu && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span>Processor Requirement</span>
            </div>
            <div className="text-sm font-bold text-[#111827] font-sans">
              {parsed.minCpu} Tier or equivalent
            </div>
          </div>
        )}

        {/* Preferred Brands (if specified) */}
        {parsed.preferredBrands && parsed.preferredBrands.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-700">
              <Sparkles className="h-4 w-4" />
              <span>Preferred Brands</span>
            </div>
            <div className="text-sm font-bold text-[#111827] font-sans">
              {parsed.preferredBrands.join(", ")}
            </div>
          </div>
        )}

        {/* Priorities */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-teal-700">
            <Sliders className="h-4 w-4" />
            <span>Key Priorities</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {parsed.priorities.map((p) => (
              <span
                key={p}
                className="rounded-lg bg-white border border-[#CBD5E1] px-2 py-0.5 text-xs font-semibold text-teal-800 shadow-xs"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={onEdit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 hover:text-[#111827] transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Adjust Requirements</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 shadow-md rounded-2xl px-8 py-3 transition-all"
        >
          <span>Find My Laptop</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
