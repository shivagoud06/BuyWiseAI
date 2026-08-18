"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Cpu,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { parseUserRequirements, ParsedRequirements } from "@/lib/nlpParser";

interface NaturalLanguageInputProps {
  onParsed: (parsed: ParsedRequirements) => void;
  onSwitchToGuided: () => void;
  initialQuery?: string;
}

const EXAMPLE_PROMPTS = [
  "Gaming laptop under ₹75,000",
  "Best laptop for programming under ₹60,000",
  "Student laptop with long battery life",
  "16GB laptop for coding and college",
];

const BUDGET_CHIPS = [
  { label: "Under ₹40K", query: "under ₹40,000" },
  { label: "₹40K–₹50K", query: "between ₹40,000 and ₹50,000" },
  { label: "₹50K–₹75K", query: "under ₹75,000" },
  { label: "₹1L+", query: "above ₹1,00,000" },
];

const USE_CHIPS = [
  { label: "Programming", query: "for programming and coding" },
  { label: "Gaming", query: "for gaming" },
  { label: "Student", query: "for student and college" },
  { label: "Office", query: "for office and productivity" },
  { label: "Content Creation", query: "for video editing and content creation" },
];

export function NaturalLanguageInput({
  onParsed,
  onSwitchToGuided,
  initialQuery = "",
}: NaturalLanguageInputProps) {
  const [inputText, setInputText] = useState(initialQuery);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("Understanding your requirements...");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial query if passed
  useEffect(() => {
    if (initialQuery) {
      setInputText(initialQuery);
    }
  }, [initialQuery]);

  const processSubmission = () => {
    if (isLoading) return;

    if (!inputText.trim()) {
      setErrorMessage("Please tell us what kind of laptop you are looking for.");
      return;
    }

    const parsed = parseUserRequirements(inputText);

    if (!parsed.confidence.isSufficient) {
      setErrorMessage(
        "Tell us a little more (e.g., mention your budget like 'under ₹70,000' or primary use like coding, gaming, or college)."
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    // Multi-phase loading sequence
    setLoadingPhase("Understanding your requirements...");

    setTimeout(() => {
      setLoadingPhase("Finding matching laptops...");
    }, 280);

    setTimeout(() => {
      setLoadingPhase("Ranking your best options...");
    }, 560);

    setTimeout(() => {
      setIsLoading(false);
      onParsed(parsed);
    }, 850);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processSubmission();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processSubmission();
    }
  };

  const handleSelectExample = (promptText: string) => {
    setInputText(promptText);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleApplyChip = (chipQuery: string) => {
    setInputText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `I need a laptop ${chipQuery}`;
      if (trimmed.toLowerCase().includes(chipQuery.toLowerCase())) return trimmed;
      return `${trimmed} ${chipQuery}`;
    });
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Main Advisor Input Card */}
      <Card className="p-4 sm:p-9 rounded-3xl border-surface-750 bg-gradient-to-b from-surface-900/95 via-surface-900/90 to-surface-950/95 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-32 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        {/* Input Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-inner">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                Tell BuyWise what you need
              </h2>
              <p className="text-xs text-surface-400">
                Describe your budget, usage, and preferences in your own words.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToGuided}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-surface-800/50 disabled:opacity-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Use step-by-step form →</span>
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative rounded-2xl bg-surface-950/90 border border-surface-700/80 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all p-4 shadow-inner">
              <textarea
                ref={inputRef}
                value={inputText}
                disabled={isLoading}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Tell me what you're looking for..."
                className="w-full bg-transparent border-0 p-0 text-base sm:text-lg text-white placeholder-surface-500 focus:outline-none focus:ring-0 transition-all font-normal resize-none leading-relaxed"
                aria-label="Describe your laptop requirements"
              />

              {/* Bottom Input Helper Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 mt-1 border-t border-surface-800/80 text-xs text-surface-400">
                <span className="text-[11px] text-surface-500 truncate">
                  Example: I need a gaming laptop under ₹75,000 with good battery life
                </span>
                <div className="flex items-center gap-3 self-end sm:self-auto text-[11px]">
                  <span className="hidden sm:inline text-surface-400">
                    Press <kbd className="rounded bg-surface-800 px-1.5 py-0.5 text-[10px] text-surface-300 font-mono border border-surface-700">Enter ↵</kbd>
                  </span>
                  <span className="text-surface-500">Shift + Enter for newline</span>
                </div>
              </div>
            </div>

            {/* Error / Guidance Notice */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Requirement Chips */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 shrink-0">
                Budget:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleApplyChip(chip.query)}
                    className="rounded-lg bg-surface-950/70 border border-surface-800 px-2.5 py-1 text-xs font-semibold text-surface-300 hover:border-brand-500/50 hover:text-brand-300 hover:bg-surface-850 transition-all disabled:opacity-50"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 shrink-0">
                Workload:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {USE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleApplyChip(chip.query)}
                    className="rounded-lg bg-surface-950/70 border border-surface-800 px-2.5 py-1 text-xs font-semibold text-surface-300 hover:border-brand-500/50 hover:text-brand-300 hover:bg-surface-850 transition-all disabled:opacity-50"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Example Searches ("Try asking") */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-400 block">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectExample(prompt)}
                  className="text-left text-xs font-medium text-surface-300 bg-surface-950/60 border border-surface-800 rounded-xl px-3 py-2 hover:border-surface-700 hover:text-white hover:bg-surface-850 transition-all disabled:opacity-50 shadow-sm"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button & Multi-Phase Loading */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center text-sm sm:text-base font-bold shadow-xl shadow-brand-500/15 py-3.5 transition-all disabled:opacity-90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2.5 text-surface-950">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{loadingPhase}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Find My Laptop</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* How BuyWise Works (3 Steps) */}
      <section className="space-y-6 pt-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
            Simple 3-Step Process
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
            How BuyWise works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-surface-900/50 border border-surface-800/80 space-y-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono text-xs font-bold">
                01
              </span>
              <h4 className="text-sm font-bold text-white font-sans">
                Tell us what you need
              </h4>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Describe your budget, main workload, and must-have hardware preferences in your own words.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-900/50 border border-surface-800/80 space-y-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
                02
              </span>
              <h4 className="text-sm font-bold text-white font-sans">
                BuyWise compares your options
              </h4>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Our deterministic scoring engine analyzes specifications, displays, and thermals across the catalog.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-900/50 border border-surface-800/80 space-y-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs font-bold">
                03
              </span>
              <h4 className="text-sm font-bold text-white font-sans">
                Choose the laptop that fits you
              </h4>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Review match scores, verified specs, trade-offs, and multi-retailer store offers with zero confusion.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="p-6 sm:p-8 rounded-3xl border border-surface-800 bg-surface-900/40 backdrop-blur-sm space-y-4">
        <div className="text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-white font-sans">
            Recommendations built around what matters to you
          </h3>
          <p className="text-xs text-surface-400 mt-0.5">
            Transparent, unbiased product matching designed to save you hours of research.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800/80 text-xs text-surface-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Budget-aware filtering</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800/80 text-xs text-surface-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Use-case focused matching</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800/80 text-xs text-surface-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Side-by-side comparison</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800/80 text-xs text-surface-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Transparent match score</span>
          </div>
        </div>
      </section>
    </div>
  );
}
