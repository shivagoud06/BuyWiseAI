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
import { Button } from "@/components/ui/Button";

interface LaptopGridProps {
  laptops: Laptop[];
  upcomingLaptops?: Laptop[];
  isFallback?: boolean;
  fallbackReason?: string | null;
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
  hasBroadSuggestions = false,
  broadSuggestions = [],
  sortOption,
  onSortChange,
  onResetFilters,
  onSelectSuggestion,
}: LaptopGridProps) {
  const { comparedLaptops, removeLaptop, clearCompare, count } = useCompare();

  return (
    <div className="space-y-6">
      {/* Fallback Explanation Alert Banner */}
      {isFallback && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 text-amber-200 backdrop-blur-md space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white font-sans">
              {fallbackReason || "Exact model unavailable. These are the closest available alternatives."}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-300/80 pl-6 font-normal leading-relaxed">
            We searched the verified Indian market catalog and found the closest alternatives matching your requested brand, GPU tier, CPU generation, and performance class.
          </p>
        </div>
      )}

      {/* Grid Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800/80">
        <div>
          <span className="text-sm font-semibold text-white">
            Showing <span className="text-brand-400 font-bold">{laptops.length}</span>{" "}
            {laptops.length === 1 ? "Laptop" : "Laptops"}
            {isFallback && <span className="text-xs text-amber-400 font-semibold ml-1.5">(Nearest Matches)</span>}
          </span>
          <span className="text-xs text-surface-400 ml-2 font-normal">
            (Indian Market Catalog)
          </span>
        </div>

        {/* Sort selector */}
        {laptops.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-surface-400 flex items-center gap-1 shrink-0 font-medium">
              <ArrowUpDown className="h-3.5 w-3.5 text-brand-400" />
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-xl bg-surface-900 border border-surface-700/80 px-3 py-1.5 text-xs font-semibold text-white focus:border-brand-400 focus:outline-none cursor-pointer"
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
        <div className="rounded-2xl border border-surface-800 bg-surface-900/30 p-8 sm:p-12 text-center backdrop-blur-sm space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800 text-surface-400">
            <SearchX className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">No matching or near-match laptops found</h3>
            <p className="text-sm text-surface-400 max-w-md mx-auto font-normal">
              We couldn&apos;t find any laptop or close alternatives matching your exact filters. Try exploring these popular search options:
            </p>
          </div>

          {broadSuggestions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-2">
              {broadSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectSuggestion?.(sug)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-surface-200 bg-surface-800/80 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/30 border border-surface-700 transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={onResetFilters} className="font-semibold">
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Laptop Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {laptops.map((laptop) => (
            <LaptopCard key={laptop.id} laptop={laptop} />
          ))}
        </div>
      )}

      {/* Separate Upcoming & Announced Section */}
      {upcomingLaptops.length > 0 && (
        <div className="pt-10 mt-10 border-t border-surface-800/80 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Announced & Upcoming Next-Gen Laptops
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-surface-400">
              Officially announced next-gen hardware. Verified India market pricing and live purchase links will be available upon retail launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingLaptops.map((laptop) => (
              <LaptopCard key={laptop.id} laptop={laptop} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Compare Bar */}
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
                <Button variant="primary" size="sm" className="font-semibold px-3 py-1.5 text-xs">
                  <span>Compare</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
