"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Briefcase,
  Sliders,
  ArrowRight,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
  { id: "Content Creation", label: "Content Creation" },
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
        <Card className="p-4 sm:p-8 md:p-10 rounded-3xl border-surface-750/90 bg-surface-900/80 shadow-2xl backdrop-blur-xl space-y-7 sm:space-y-8">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                What are you looking for?
              </h2>
            </div>
            <span className="text-xs text-surface-400 font-medium">
              Interactive Laptop Advisor
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* 1. Budget Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-300">
                <Wallet className="h-3.5 w-3.5 text-brand-400" />
                <span>1. Select Your Budget (INR)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = selectedBudget === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBudget(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-brand-400 bg-brand-500/15 text-white shadow-sm shadow-brand-500/10"
                          : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Primary Use Case */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-300">
                <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                <span>2. Primary Use</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {USE_CASE_OPTIONS.map((opt) => {
                  const isSelected = selectedUseCase === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedUseCase(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/15 text-white shadow-sm shadow-cyan-500/10"
                          : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Optional Priority/Preference */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-300">
                <Sliders className="h-3.5 w-3.5 text-teal-400" />
                <span>3. Key Priority (Optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {PREFERENCE_OPTIONS.map((opt) => {
                  const isSelected = selectedPreference === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPreference(opt.id)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center border ${
                        isSelected
                          ? "border-teal-400 bg-teal-500/15 text-white shadow-sm shadow-teal-500/10"
                          : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center text-sm font-bold shadow-lg shadow-brand-500/20 py-3.5"
              >
                <span>Find My Laptop</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
