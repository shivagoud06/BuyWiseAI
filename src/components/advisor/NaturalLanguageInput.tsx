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

  useEffect(() => {
    if (initialQuery && initialQuery !== inputText) {
      setInputText(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();

    if (!trimmed) {
      setErrorMessage("Please tell us what kind of laptop you're looking for.");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (trimmed.length < 3) {
      setErrorMessage("Please enter a slightly more descriptive request.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    // Multi-phase progress indicator
    setLoadingPhase("Analyzing requirements & budget...");
    await new Promise((resolve) => setTimeout(resolve, 200));

    setLoadingPhase("Comparing specs against Indian catalog...");
    await new Promise((resolve) => setTimeout(resolve, 200));

    const parsed = parseUserRequirements(trimmed);
    setIsLoading(false);
    onParsed(parsed);
  };

  const handleSelectExample = (prompt: string) => {
    setInputText(prompt);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
      <div className="p-5 sm:p-8 rounded-3xl border border-[#E2E8F0] bg-white shadow-xl space-y-6 relative overflow-hidden">
        {/* Input Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] font-sans">
                Tell BuyWise what you need
              </h2>
              <p className="text-xs text-[#64748B]">
                Describe your budget, usage, and preferences in your own words.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToGuided}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors self-start sm:self-auto py-1.5 px-3 rounded-xl hover:bg-teal-50 border border-transparent hover:border-teal-200 disabled:opacity-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Use step-by-step form →</span>
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative rounded-2xl bg-slate-50 border border-[#CBD5E1] focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 transition-all p-4 shadow-sm">
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
                className="w-full bg-transparent border-0 p-0 text-base sm:text-lg text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-0 transition-all font-normal resize-none leading-relaxed"
                aria-label="Describe your laptop requirements"
              />

              {/* Bottom Input Helper Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 mt-1 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                <span className="text-[11px] text-[#94A3B8] truncate">
                  Example: I need a gaming laptop under ₹75,000 with good battery life
                </span>
                <div className="flex items-center gap-3 self-end sm:self-auto text-[11px]">
                  <span className="hidden sm:inline text-[#64748B]">
                    Press <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-[#475569] font-mono border border-[#CBD5E1] shadow-xs">Enter ↵</kbd>
                  </span>
                  <span className="text-[#94A3B8]">Shift + Enter for newline</span>
                </div>
              </div>
            </div>

            {/* Error / Guidance Notice */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Requirement Chips */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
                Budget:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleApplyChip(chip.query)}
                    className="rounded-lg bg-white border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50 shadow-xs"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
                Workload:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {USE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleApplyChip(chip.query)}
                    className="rounded-lg bg-white border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50 shadow-xs"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Example Searches ("Try asking") */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectExample(prompt)}
                  className="text-left text-xs font-medium text-[#334155] bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50 shadow-xs"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button & Multi-Phase Loading */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 shadow-md rounded-2xl py-3.5 transition-all disabled:opacity-80"
            >
              {isLoading ? (
                <div className="flex items-center gap-2.5 text-white">
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
            </button>
          </div>
        </form>
      </div>

      {/* How BuyWise Works (3 Steps) */}
      <section className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
            Simple 3-Step Process
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
            How BuyWise works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold">
                01
              </span>
              <h4 className="text-sm font-bold text-[#111827] font-sans">
                Tell us what you need
              </h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Describe your budget, main workload, and must-have hardware preferences in your own words.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-xs font-bold">
                02
              </span>
              <h4 className="text-sm font-bold text-[#111827] font-sans">
                BuyWise compares your options
              </h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Our deterministic scoring engine analyzes specifications, displays, and thermals across the catalog.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold">
                03
              </span>
              <h4 className="text-sm font-bold text-[#111827] font-sans">
                Choose the laptop that fits you
              </h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Review match scores, verified specs, trade-offs, and multi-retailer store offers with zero confusion.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] bg-white shadow-sm space-y-4">
        <div className="text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-[#111827] font-sans">
            Recommendations built around what matters to you
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Transparent, unbiased product matching designed to save you hours of research.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#334155]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Budget-aware filtering</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#334155]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Use-case focused matching</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#334155]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Side-by-side comparison</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#334155]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Transparent match score</span>
          </div>
        </div>
      </section>
    </div>
  );
}
