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
  Zap,
  Battery,
  Monitor,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <Card className="p-6 sm:p-10 rounded-3xl border-surface-750 bg-surface-900/85 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto space-y-8">
      {/* Top Step Counter & Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-brand-400 uppercase tracking-wider font-mono">
            Step {step} of 5
          </span>
          <span className="text-surface-400 font-normal">
            {step === 1 && "Budget Selection"}
            {step === 2 && "Primary Usage"}
            {step === 3 && "Key Priorities"}
            {step === 4 && "Memory (RAM)"}
            {step === 5 && "Graphics (GPU)"}
          </span>
        </div>
        <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Budget */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
              <Wallet className="h-4 w-4" />
              <span>Step 1 — Budget</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              What is your target budget?
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-1">
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-brand-400 bg-brand-500/15 shadow-md shadow-brand-500/10 text-white"
                      : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-sans">{opt.title}</div>
                    <div className="text-xs text-surface-400">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-brand-400 bg-brand-500 text-surface-950"
                        : "border-surface-700 bg-surface-900"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Primary Use */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Briefcase className="h-4 w-4" />
              <span>Step 2 — Primary Use</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              How will you use this laptop most?
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-1">
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/10 text-white"
                      : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt.icon}</span>
                      <span className="text-sm font-bold text-white font-sans">{opt.title}</span>
                    </div>
                    <div className="text-xs text-surface-400">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500 text-surface-950"
                        : "border-surface-700 bg-surface-900"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Priorities (Multi-select) */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
              <Sliders className="h-4 w-4" />
              <span>Step 3 — Priorities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              What matters most to you?
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-1">
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-teal-400 bg-teal-500/15 shadow-md shadow-teal-500/10 text-white"
                      : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-sans">{opt.title}</div>
                    <div className="text-xs text-surface-400">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-teal-400 bg-teal-500 text-surface-950"
                        : "border-surface-700 bg-surface-900"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: RAM Preference */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <Layers className="h-4 w-4" />
              <span>Step 4 — RAM Preference</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              How much memory (RAM) do you need?
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-1">
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-500/15 shadow-md shadow-indigo-500/10 text-white"
                      : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-sans">{opt.title}</div>
                    <div className="text-xs text-surface-400">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500 text-surface-950"
                        : "border-surface-700 bg-surface-900"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: GPU Preference */}
      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Step 5 — Graphics (GPU) Preference</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Do you need a dedicated graphics card?
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-1">
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 text-white"
                      : "border-surface-800 bg-surface-950/60 text-surface-300 hover:border-surface-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-sans">{opt.title}</div>
                    <div className="text-xs text-surface-400">{opt.subtitle}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-amber-400 bg-amber-500 text-surface-950"
                        : "border-surface-700 bg-surface-900"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-surface-800 gap-4">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleBack}
            className="border-surface-700 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleNext}
          className="font-bold text-xs px-6 py-2.5 shadow-md shadow-brand-500/20"
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
        </Button>
      </div>
    </Card>
  );
}
