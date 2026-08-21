"use client";

import React, { useState } from "react";
import {
  AdvisorInput,
  PriceRangeFilter,
  UseCaseType,
  PriorityType,
  RamPreferenceType,
  GpuPreferenceType
} from "@/types";
import {
  Wallet,
  Briefcase,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

interface AdvisorWizardProps {
  initialValues?: Partial<AdvisorInput>;
  onSubmit: (values: AdvisorInput) => void;
}

const BUDGET_OPTIONS: { id: PriceRangeFilter; title: string; subtitle: string }[] = [
  { id: "under-40k", title: "Under ₹40,000", subtitle: "Essential everyday browsing & studies" },
  { id: "40k-50k", title: "₹40,000 – ₹50,000", subtitle: "Capable multitasking & college work" },
  { id: "50k-75k", title: "₹50,000 – ₹75,000", subtitle: "Sweet spot for coding & entry gaming" },
  { id: "75k-100k", title: "₹75,000 – ₹1,00,000", subtitle: "High performance & discrete GPUs" },
  { id: "above-100k", title: "Above ₹1,00,000", subtitle: "Premium flagship power & creator laptops" },
];

const USE_CASE_OPTIONS: { id: UseCaseType; title: string; subtitle: string; icon: string }[] = [
  { id: "Programming", title: "Programming", subtitle: "VS Code, Docker, web dev & compilation", icon: "💻" },
  { id: "Gaming", title: "Gaming", subtitle: "High FPS gameplay & discrete ray-tracing graphics", icon: "🎮" },
  { id: "Student", title: "Student", subtitle: "Assignments, online lectures & lightweight mobility", icon: "🎓" },
  { id: "Office", title: "Office", subtitle: "Spreadsheets, multitasking & video meetings", icon: "💼" },
  { id: "Content Creation", title: "Content Creation", subtitle: "Video editing, 3D rendering & color accuracy", icon: "🎨" },
];

const PRIORITY_OPTIONS: { id: PriorityType; title: string; subtitle: string }[] = [
  { id: "Performance", title: "Performance", subtitle: "Fast CPU speeds & smooth responsiveness" },
  { id: "Battery", title: "Battery Endurance", subtitle: "All-day unplugged working freedom" },
  { id: "Portability", title: "Portability", subtitle: "Slim, lightweight build under 1.5kg" },
  { id: "Display", title: "Display Quality", subtitle: "High resolution, OLED / 100% sRGB accuracy" },
  { id: "Value for Money", title: "Value for Money", subtitle: "Maximum hardware specifications per Rupee" },
];

const RAM_OPTIONS: { id: RamPreferenceType; title: string; subtitle: string }[] = [
  { id: "8GB", title: "8GB RAM", subtitle: "Good for everyday basic tasks & office apps" },
  { id: "16GB", title: "16GB RAM", subtitle: "Recommended for programming & modern gaming" },
  { id: "32GB", title: "32GB RAM", subtitle: "For heavy VMs, Docker & 4K editing" },
  { id: "no-preference", title: "No preference", subtitle: "Let BuyWise suggest the best balanced size" },
];

const GPU_OPTIONS: { id: GpuPreferenceType; title: string; subtitle: string }[] = [
  { id: "integrated", title: "Integrated is enough", subtitle: "Longer battery, runs cool & quiet" },
  { id: "dedicated-preferred", title: "Dedicated GPU preferred", subtitle: "Entry-to-mid NVIDIA/AMD graphics" },
  { id: "gaming-required", title: "Gaming GPU required", subtitle: "RTX 4050/4060/4070 for AAA gaming" },
  { id: "no-preference", title: "No preference", subtitle: "Open to integrated or dedicated graphics" },
];

export function AdvisorWizard({ initialValues, onSubmit }: AdvisorWizardProps) {
  const [step, setStep] = useState(1);

  const [budget, setBudget] = useState<PriceRangeFilter>(initialValues?.budget || "50k-75k");
  const [primaryUse, setPrimaryUse] = useState<UseCaseType>(initialValues?.primaryUse || "Programming");
  const [priorities, setPriorities] = useState<PriorityType[]>(
    initialValues?.priorities && initialValues.priorities.length > 0
      ? initialValues.priorities
      : ["Performance", "Value for Money"]
  );
  const [ramPreference, setRamPreference] = useState<RamPreferenceType>(
    initialValues?.ramPreference || "16GB"
  );
  const [gpuPreference, setGpuPreference] = useState<GpuPreferenceType>(
    initialValues?.gpuPreference || "no-preference"
  );

  const togglePriority = (p: PriorityType) => {
    if (priorities.includes(p)) {
      if (priorities.length > 1) {
        setPriorities(priorities.filter((item) => item !== p));
      }
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onSubmit({
        budget,
        primaryUse,
        priorities,
        ramPreference,
        gpuPreference,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progressPercent = (step / 5) * 100;

  return (
    <div className="p-5 sm:p-8 rounded-3xl border border-[#E2E8F0] bg-white shadow-xl max-w-3xl mx-auto space-y-7 sm:space-y-8">
      {/* Top Step Counter & Progress Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-teal-700 uppercase tracking-wider font-mono font-bold">
            Step {step} of 5
          </span>
          <span className="text-[#64748B] font-medium">
            {step === 1 && "Budget Selection"}
            {step === 2 && "Primary Usage"}
            {step === 3 && "Key Priorities"}
            {step === 4 && "Memory (RAM)"}
            {step === 5 && "Graphics (GPU)"}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Budget */}
      {step === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <Wallet className="h-4 w-4" />
              <span>Step 1 — Budget</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              What is your target budget?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Select your budget in Indian Rupees (INR) to filter laptops within range.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBudget(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/80 text-[#111827] shadow-sm ring-1 ring-teal-500/30"
                      : "border-[#E2E8F0] bg-white text-[#334155] hover:border-teal-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#111827] font-sans">{opt.title}</div>
                    <div className="text-xs text-[#64748B]">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Primary Use */}
      {step === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
              <Briefcase className="h-4 w-4" />
              <span>Step 2 — Primary Use</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              How will you use this laptop most?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Choose the primary workload you need this laptop to excel at.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {USE_CASE_OPTIONS.map((opt) => {
              const isSelected = primaryUse === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPrimaryUse(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/80 text-[#111827] shadow-sm ring-1 ring-cyan-500/30"
                      : "border-[#E2E8F0] bg-white text-[#334155] hover:border-cyan-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt.icon}</span>
                      <span className="text-sm font-bold text-[#111827] font-sans">{opt.title}</span>
                    </div>
                    <div className="text-xs text-[#64748B]">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Priorities (Multi-select) */}
      {step === 3 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <Sliders className="h-4 w-4" />
              <span>Step 3 — Priorities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              What matters most to you?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Select one or more priorities (e.g. Battery, Display, Raw Performance).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = priorities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => togglePriority(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/80 text-[#111827] shadow-sm ring-1 ring-teal-500/30"
                      : "border-[#E2E8F0] bg-white text-[#334155] hover:border-teal-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#111827] font-sans">{opt.title}</div>
                    <div className="text-xs text-[#64748B]">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: RAM Preference */}
      {step === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              <Layers className="h-4 w-4" />
              <span>Step 4 — RAM Preference</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              How much memory (RAM) do you need?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              More RAM ensures smooth performance when running multiple apps and tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RAM_OPTIONS.map((opt) => {
              const isSelected = ramPreference === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRamPreference(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/80 text-[#111827] shadow-sm ring-1 ring-indigo-500/30"
                      : "border-[#E2E8F0] bg-white text-[#334155] hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#111827] font-sans">{opt.title}</div>
                    <div className="text-xs text-[#64748B]">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: GPU Preference */}
      {step === 5 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Step 5 — Graphics (GPU) Preference</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-sans">
              Do you need a dedicated graphics card?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Integrated graphics are lighter and more battery-friendly; dedicated GPUs excel at 3D games and video editing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GPU_OPTIONS.map((opt) => {
              const isSelected = gpuPreference === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGpuPreference(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/80 text-[#111827] shadow-sm ring-1 ring-amber-500/30"
                      : "border-[#E2E8F0] bg-white text-[#334155] hover:border-amber-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#111827] font-sans">{opt.title}</div>
                    <div className="text-xs text-[#64748B]">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-5 border-t border-[#E2E8F0] gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 hover:text-[#111827] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl px-6 py-2.5 transition-all shadow-md"
        >
          {step === 5 ? (
            <>
              <span>Find My Laptop</span>
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
