"use client";

import React from "react";
import Link from "next/link";
import { Laptop, SortOption } from "@/types";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import { useCompare } from "@/context/CompareContext";
import {
  ArrowUpDown,
  SearchX,
  RotateCcw,
  X,
  Scale,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface LaptopGridProps {
  laptops: Laptop[];
  upcomingLaptops?: Laptop[];
  isFallback?: boolean;
  fallbackReason?: string | null;
  fallbackExplanations?: Record<string, string>;
  hasBroadSuggestions?: boolean;
  broadSuggestions?: string[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function LaptopGrid({
  laptops,
  upcomingLaptops = [],
  isFallback = false,
  fallbackReason,
  fallbackExplanations,
  hasBroadSuggestions = false,
  broadSuggestions = [],
  sortOption,
  onSortChange,
  onResetFilters,
  onSelectSuggestion,
}: LaptopGridProps) {
  const { comparedLaptops, removeLaptop, clearCompare, count } = useCompare();

  return (
    <div className="space-y-5">

      {/* Fallback Explanation Alert Banner */}
      {isFallback && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900">
              {fallbackReason || "Exact model unavailable. These are the closest available alternatives."}
            </h3>
          </div>
          <p className="text-xs text-amber-700 pl-6 font-normal leading-relaxed">
            We searched the verified Indian market catalog and found the closest alternatives matching your requested brand, GPU tier, CPU generation, and performance class.
          </p>
        </div>
      )}

      {/* Grid Top Bar — count + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-shop-text">
            <span className="text-brand-600 font-bold">{laptops.length}</span>{" "}
            {laptops.length === 1 ? "Laptop" : "Laptops"}
            {isFallback && (
              <span className="text-xs text-amber-600 font-semibold ml-1.5">(Nearest Matches)</span>
            )}
          </span>
          <span className="text-xs text-shop-muted font-normal hidden sm:inline">
            — Indian Market Catalog
          </span>
        </div>

        {/* Sort selector */}
        {laptops.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-select-grid" className="text-xs text-shop-muted flex items-center gap-1 font-medium whitespace-nowrap">
              <ArrowUpDown className="h-3.5 w-3.5 text-brand-500" />
              Sort by:
            </label>
            <select
              id="sort-select-grid"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-lg bg-white border border-shop-border px-3 py-1.5 text-xs font-semibold text-shop-text focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 cursor-pointer shadow-sm"
            >
              <option value="recommended">BuyWise Recommended</option>
              <option value="lowest-listed-price">Lowest Listed Price</option>
              <option value="score-desc">Highest BuyWise Score</option>
              <option value="best-value">Best Value Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Empty State / Broad Suggestions */}
      {laptops.length === 0 ? (
        <div className="rounded-xl border border-shop-border bg-white p-10 sm:p-14 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <SearchX className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-shop-text mb-2">No matching laptops found</h3>
            <p className="text-sm text-shop-muted max-w-md mx-auto font-normal">
              We couldn&apos;t find any laptop matching your exact filters. Try exploring these popular options:
            </p>
          </div>

          {broadSuggestions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-1">
              {broadSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectSuggestion?.(sug)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-shop-text bg-white border border-shop-border hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* ── Responsive Laptop Cards Grid ── */
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {laptops.map((laptop) => (
            <LaptopCard
              key={laptop.id}
              laptop={laptop}
              fallbackExplanation={isFallback ? fallbackExplanations?.[laptop.id] : undefined}
            />
          ))}
        </div>
      )}

      {/* Upcoming & Announced Section */}
      {upcomingLaptops.length > 0 && (
        <div className="pt-8 mt-8 border-t border-shop-border space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-xl font-bold tracking-tight text-shop-text">
                Announced &amp; Upcoming Next-Gen Laptops
              </h3>
            </div>
            <p className="text-xs text-shop-muted">
              Officially announced next-gen hardware. Verified India market pricing and live purchase links will be available upon retail launch.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcomingLaptops.map((laptop) => (
              <LaptopCard key={laptop.id} laptop={laptop} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Compare Bar — keeps dark brand colors to stand out over light page */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl rounded-2xl border border-brand-500/40 bg-surface-950/95 p-4 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white shrink-0">
                <Scale className="h-4 w-4 text-brand-400" />
                <span>Comparing ({count}/3):</span>
              </div>
              <div className="flex items-center gap-2">
                {comparedLaptops.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-1.5 rounded-lg bg-surface-800/80 border border-surface-700 px-2.5 py-1 text-xs text-surface-200"
                  >
                    <span className="font-semibold text-white truncate max-w-[120px]">{l.brand}</span>
                    <button
                      type="button"
                      onClick={() => removeLaptop(l.id)}
                      className="text-surface-400 hover:text-rose-400"
                      aria-label={`Remove ${l.name} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-surface-400 hover:text-white px-2 py-1 font-medium"
              >
                Clear
              </button>
              <Link href="/compare">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-950 bg-brand-400 hover:bg-brand-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  <span>Compare</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
