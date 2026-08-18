"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Code2,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Video,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const USE_CASES = [
  { id: "Programming", label: "Programming & CS", icon: Code2, hint: "16GB+ RAM, fast multicore CPU" },
  { id: "Gaming", label: "Gaming & GPU", icon: Gamepad2, hint: "Dedicated RTX GPU & 144Hz+" },
  { id: "Student", label: "Student & College", icon: GraduationCap, hint: "Battery life, lightweight, durable" },
  { id: "Office", label: "Office & Work", icon: Briefcase, hint: "Reliable, clear display, silent fans" },
  { id: "Video Editing", label: "Video & Design", icon: Video, hint: "100% sRGB/DCI-P3 color accuracy" },
];

const BUDGET_RANGES = [
  { id: "under-40k", label: "Under ₹40,000" },
  { id: "40k-50k", label: "₹40,000 – ₹50,000" },
  { id: "50k-75k", label: "₹50,000 – ₹75,000" },
  { id: "75k-100k", label: "₹75,000 – ₹1,00,000" },
  { id: "above-100k", label: "Above ₹1,00,000" },
];

interface SearchAreaProps {
  onSearchSelect?: (query: string, useCase: string, budget: string) => void;
  activeQuery?: string;
}

export function SearchArea({ onSearchSelect, activeQuery }: SearchAreaProps) {
  const router = useRouter();
  const [selectedUseCase, setSelectedUseCase] = useState<string>("Programming");
  const [selectedBudget, setSelectedBudget] = useState<string>("50k-75k");
  const [customQuery, setCustomQuery] = useState<string>("");

  React.useEffect(() => {
    if (activeQuery) {
      setCustomQuery(activeQuery);
    }
  }, [activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSelect) {
      onSearchSelect(customQuery, selectedUseCase, selectedBudget);
    }
    const params = new URLSearchParams();
    if (customQuery) params.set("q", customQuery);
    if (selectedUseCase) params.set("useCase", selectedUseCase);
    router.push(`/laptops?${params.toString()}`);
  };

  return (
    <section id="laptop-finder" className="py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-surface-700/80 bg-gradient-to-b from-surface-900/90 via-surface-900/60 to-surface-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Subtle decorative edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />

          <form onSubmit={handleSearchSubmit} className="space-y-6">
            {/* Step 1: Intended Usage */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-surface-300 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-bold">
                    1
                  </span>
                  Select Primary Usage
                </label>
                <span className="text-xs text-surface-400 hidden sm:inline">
                  Select the main workload for your laptop
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {USE_CASES.map((uc) => {
                  const Icon = uc.icon;
                  const isSelected = selectedUseCase === uc.id;
                  return (
                    <button
                      key={uc.id}
                      type="button"
                      onClick={() => setSelectedUseCase(uc.id)}
                      className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                        isSelected
                          ? "bg-brand-500/15 border-brand-400 text-white shadow-sm shadow-brand-500/20 ring-1 ring-brand-400/40"
                          : "bg-surface-800/40 border-surface-700/60 text-surface-300 hover:bg-surface-800 hover:border-surface-600 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 mb-1.5 transition-colors ${
                          isSelected ? "text-brand-400" : "text-surface-400 group-hover:text-surface-200"
                        }`}
                      />
                      <span className="text-xs font-medium leading-tight">{uc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Budget Range (INR) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-surface-300 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-bold">
                    2
                  </span>
                  Your Target Budget (Indian Rupees)
                </label>
                <span className="text-xs text-surface-400 hidden sm:inline">
                  Find the highest value within your price ceiling
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {BUDGET_RANGES.map((range) => {
                  const isSelected = selectedBudget === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setSelectedBudget(range.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                        isSelected
                          ? "bg-white text-surface-950 border-white font-semibold shadow-md"
                          : "bg-surface-800/50 border-surface-700/60 text-surface-300 hover:bg-surface-800 hover:text-white"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Specific Needs or Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-surface-300 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-bold">
                    3
                  </span>
                  Specific Requirements or Keywords (Optional)
                </label>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-surface-400 pointer-events-none">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="e.g. Need 16GB RAM, lightweight OLED screen for CS coding under ₹70,000..."
                  className="w-full rounded-xl bg-surface-950/80 border border-surface-700 py-3.5 pl-11 pr-32 text-sm text-white placeholder-surface-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <div className="absolute right-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="font-semibold py-2 px-4 shadow-none"
                  >
                    <span>Browse Laptops</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
