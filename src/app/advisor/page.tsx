"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AdvisorInput,
  PriceRangeFilter,
  UseCaseType,
  PriorityType,
  RamPreferenceType,
  GpuPreferenceType,
  CurrencyCode,
  CountryCode,
} from "@/types";
import { LAPTOPS } from "@/data/laptops";
import { getLaptopRecommendations } from "@/lib/recommendationEngine";
import { ParsedRequirements } from "@/lib/nlpParser";
import { NaturalLanguageInput } from "@/components/advisor/NaturalLanguageInput";
import { InterpretedRequirementsCard } from "@/components/advisor/InterpretedRequirementsCard";
import { AdvisorWizard } from "@/components/advisor/AdvisorWizard";
import { AdvisorResults } from "@/components/advisor/AdvisorResults";
import { Compass, MessageSquare, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type AdvisorMode = "nlp" | "guided";
type AdvisorState = "input" | "interpreted" | "results";

function AdvisorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<AdvisorMode>("nlp");
  const [advisorState, setAdvisorState] = useState<AdvisorState>("input");

  const [lastRawQuery, setLastRawQuery] = useState<string>("");
  const [parsedRequirements, setParsedRequirements] = useState<ParsedRequirements | null>(null);
  const [activeInput, setActiveInput] = useState<AdvisorInput | null>(null);

  // Parse initial query params if present in URL
  useEffect(() => {
    const budget = searchParams.get("budget") as PriceRangeFilter | null;
    const amountStr = searchParams.get("amount");
    const use = searchParams.get("use") as UseCaseType | null;
    const ram = searchParams.get("ram") as RamPreferenceType | null;
    const gpu = searchParams.get("gpu") as GpuPreferenceType | null;
    const currency = (searchParams.get("cur") || "INR") as CurrencyCode;
    const country = (searchParams.get("country") || "IN") as CountryCode;
    const prioritiesStr = searchParams.get("priorities");

    if (budget && use) {
      const parsedPriorities: PriorityType[] = prioritiesStr
        ? (prioritiesStr.split(",") as PriorityType[])
        : ["Performance", "Value for Money"];

      const input: AdvisorInput = {
        budget,
        rawBudgetAmount: amountStr ? parseInt(amountStr, 10) : undefined,
        currency,
        country,
        primaryUse: use,
        priorities: parsedPriorities,
        ramPreference: ram || "16GB",
        gpuPreference: gpu || "no-preference",
      };

      setActiveInput(input);
      setAdvisorState("results");
    }
  }, [searchParams]);

  // Handle Natural Language Parse
  const handleNaturalLanguageParsed = (parsed: ParsedRequirements) => {
    setParsedRequirements(parsed);
    setLastRawQuery(parsed.rawQuery);
    const input: AdvisorInput = {
      budget: parsed.budget,
      rawBudgetAmount: parsed.rawBudgetAmount,
      budgetMode: parsed.budgetMode,
      currency: parsed.currency,
      country: parsed.country,
      primaryUse: parsed.primaryUse,
      priorities: parsed.priorities,
      ramPreference: parsed.ramPreference,
      gpuPreference: parsed.gpuPreference,
      preferredBrands: parsed.preferredBrands,
      minRam: parsed.minRam,
      minStorage: parsed.minStorage,
      storagePreference: parsed.storagePreference,
      minCpu: parsed.minCpu,
      minGpuTier: parsed.minGpuTier,
      displayRequirements: parsed.displayRequirements,
    };
    setActiveInput(input);

    // If unsupported market, show message immediately in results
    if (parsed.isUnsupportedMarket) {
      setAdvisorState("results");
    } else {
      setAdvisorState("interpreted");
    }
  };

  // Confirm interpreted requirements and view results
  const handleConfirmInterpreted = () => {
    if (!activeInput) return;
    setAdvisorState("results");

    // Sync to URL parameters
    const params = new URLSearchParams();
    params.set("budget", activeInput.budget);
    params.set("use", activeInput.primaryUse);
    params.set("ram", activeInput.ramPreference);
    params.set("gpu", activeInput.gpuPreference);
    if (activeInput.rawBudgetAmount) {
      params.set("amount", activeInput.rawBudgetAmount.toString());
    }
    if (activeInput.currency && activeInput.currency !== "INR") {
      params.set("cur", activeInput.currency);
    }
    if (activeInput.country && activeInput.country !== "IN") {
      params.set("country", activeInput.country);
    }
    if (activeInput.priorities.length > 0) {
      params.set("priorities", activeInput.priorities.join(","));
    }
    router.push(`/advisor?${params.toString()}`);
  };

  // Switch to Step-by-Step Wizard with pre-populated values
  const handleEditFromInterpreted = () => {
    setMode("guided");
    setAdvisorState("input");
  };

  // Submit from guided step-by-step wizard
  const handleGuidedSubmit = (input: AdvisorInput) => {
    setActiveInput(input);
    setAdvisorState("results");

    const params = new URLSearchParams();
    params.set("budget", input.budget);
    params.set("use", input.primaryUse);
    params.set("ram", input.ramPreference);
    params.set("gpu", input.gpuPreference);
    if (input.currency && input.currency !== "INR") {
      params.set("cur", input.currency);
    }
    if (input.country && input.country !== "IN") {
      params.set("country", input.country);
    }
    if (input.priorities.length > 0) {
      params.set("priorities", input.priorities.join(","));
    }
    router.push(`/advisor?${params.toString()}`);
  };

  // Reset / modify to initial input state retaining previous text
  const handleReset = () => {
    setAdvisorState("input");
    router.push("/advisor");
  };

  // Compute recommendations using the deterministic engine
  const recommendationData =
    advisorState === "results" && activeInput
      ? getLaptopRecommendations(activeInput, LAPTOPS)
      : null;

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge variant="brand" size="md" className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider font-mono">
              <Compass className="h-3.5 w-3.5 text-brand-400" />
              <span>BUYWISE LAPTOP ADVISOR</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
            Find the laptop that&apos;s right for you.
          </h1>
          <p className="text-sm sm:text-base text-surface-300 font-normal max-w-xl mx-auto">
            Tell BuyWise what you need. We&apos;ll compare your options and find the laptops that fit.
          </p>

          {/* Mode Switcher Tabs (Only shown when on input state) */}
          {advisorState === "input" && (
            <div className="pt-3 flex items-center justify-center">
              <div className="inline-flex rounded-2xl bg-surface-900/90 border border-surface-800 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMode("nlp")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    mode === "nlp"
                      ? "bg-brand-500 text-surface-950 shadow-md font-bold"
                      : "text-surface-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Natural Language</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("guided")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    mode === "guided"
                      ? "bg-brand-500 text-surface-950 shadow-md font-bold"
                      : "text-surface-400 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Step-by-Step Form</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Flow */}
        {/* 1. Results View */}
        {advisorState === "results" && activeInput && recommendationData && (
          <AdvisorResults
            results={recommendationData.recommendations}
            input={activeInput}
            isRelaxed={recommendationData.isRelaxed}
            relaxedReason={recommendationData.relaxedReason}
            isUnsupportedMarket={
              parsedRequirements?.isUnsupportedMarket ||
              recommendationData.isUnsupportedMarket
            }
            unsupportedMessage={
              parsedRequirements?.unsupportedMessage ||
              recommendationData.unsupportedMessage
            }
            isAmbiguousCurrency={parsedRequirements?.isAmbiguousCurrency}
            onReset={handleReset}
          />
        )}

        {/* 2. Interpreted Requirements Confirmation View */}
        {advisorState === "interpreted" && parsedRequirements && (
          <InterpretedRequirementsCard
            parsed={parsedRequirements}
            onConfirm={handleConfirmInterpreted}
            onEdit={handleEditFromInterpreted}
          />
        )}

        {/* 3. Input State: Natural Language OR Guided Form */}
        {advisorState === "input" && mode === "nlp" && (
          <NaturalLanguageInput
            initialQuery={lastRawQuery}
            onParsed={handleNaturalLanguageParsed}
            onSwitchToGuided={() => setMode("guided")}
          />
        )}

        {advisorState === "input" && mode === "guided" && (
          <AdvisorWizard
            initialValues={activeInput || undefined}
            onSubmit={handleGuidedSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-surface-400">Loading advisor...</div>}>
      <AdvisorContent />
    </Suspense>
  );
}
