"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Briefcase,
  Sliders,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BUDGET_OPTIONS = [
  { id: "under-40k", label: "Under ₹40,000" },
  { id: "40k-50k", label: "₹40,000 – ₹50,000" },
  { id: "50k-75k", label: "₹50,000 – ₹75,000" },
  { id: "75k-100k", label: "₹75,000 – ₹1,00,000" },
  { id: "above-100k", label: "Above ₹1,00,000" },
];

const USE_CASE_OPTIONS = [
  { id: "Programming", label: "Programming" },
  { id: "Gaming", label: "Gaming" },
  { id: "Student", label: "Student" },
  { id: "Office", label: "Office" },
  { id: "Content Creation", label: "Creator" },
];

const PREFERENCE_OPTIONS = [
  { id: "Performance", label: "Performance" },
  { id: "Battery", label: "Battery" },
  { id: "Portability", label: "Portability" },
  { id: "Display", label: "Display" },
  { id: "Value", label: "Value" },
];

export function AdvisorBox() {
  const router = useRouter();
  const [selectedBudget, setSelectedBudget] = useState<string>("50k-75k");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("Programming");
  const [selectedPreference, setSelectedPreference] = useState<string>("Value");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedBudget) params.set("budget", selectedBudget);
    if (selectedUseCase) params.set("useCase", selectedUseCase);
    if (selectedPreference) params.set("preference", selectedPreference);
    router.push(`/laptops?${params.toString()}`);
  };

  return (
    <section id="advisor-box" className="py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 sm:p-8 space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] font-sans">
                What are you looking for?
              </h2>
            </div>
            <span className="text-xs text-[#6B7280] font-medium">Interactive Laptop Advisor</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Budget */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                <Wallet className="h-3.5 w-3.5 text-brand-500" />
                <span>1. Your Budget (INR)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = selectedBudget === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBudget(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-brand-400 bg-brand-500 text-white shadow-sm"
                          : "border-[#E5E7EB] bg-white text-[#374151] hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Use Case */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                <Briefcase className="h-3.5 w-3.5 text-cyan-600" />
                <span>2. Primary Use</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {USE_CASE_OPTIONS.map((opt) => {
                  const isSelected = selectedUseCase === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedUseCase(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500 text-white shadow-sm"
                          : "border-[#E5E7EB] bg-white text-[#374151] hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Priority */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                <Sliders className="h-3.5 w-3.5 text-teal-600" />
                <span>3. Key Priority (Optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {PREFERENCE_OPTIONS.map((opt) => {
                  const isSelected = selectedPreference === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPreference(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-teal-500 bg-teal-500 text-white shadow-sm"
                          : "border-[#E5E7EB] bg-white text-[#374151] hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 px-6 py-3.5 rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span>Find My Laptop</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
