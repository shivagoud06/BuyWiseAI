"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LAPTOPS } from "@/data/laptops";
import { FilterState, Laptop, PriceRangeFilter, SortOption, UseCaseType } from "@/types";
import { LaptopFilters } from "@/components/laptops/LaptopFilters";
import { LaptopGrid } from "@/components/laptops/LaptopGrid";
import { findSmartSearchResults } from "@/lib/smartSearch";
import {
  Search,
  SlidersHorizontal,
  X,
  Laptop as LaptopIcon,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function LaptopFinderContent() {
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    brands: [],
    priceRanges: [],
    ramSizes: [],
    processorFamilies: [],
    gpuCategories: [],
    useCases: [],
  });

  // Sync state with URL search params whenever they change
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const useCase = searchParams.get("useCase");
    const budget = searchParams.get("budget") as PriceRangeFilter | null;
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort") as SortOption | null;

    if (q) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
    if (useCase) {
      setFilters((prev) => ({ ...prev, useCases: [useCase as UseCaseType] }));
    }
    if (budget) {
      setFilters((prev) => ({ ...prev, priceRanges: [budget] }));
    }
    if (brand) {
      setFilters((prev) => ({ ...prev, brands: [brand as any] }));
    }
    if (sort) {
      setSortOption(sort);
    }
  }, [searchParams]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      brands: [],
      priceRanges: [],
      ramSizes: [],
      processorFamilies: [],
      gpuCategories: [],
      useCases: [],
    });
    setSortOption("recommended");
  };

  // Instant Smart Search & Proximity Fallback Engine
  const searchResult = useMemo(() => {
    return findSmartSearchResults(LAPTOPS, filters, sortOption);
  }, [filters, sortOption]);

  const displayedLaptops = searchResult.exactMatches.length > 0 ? searchResult.exactMatches : searchResult.fallbackMatches;
  const availableCatalogCount = LAPTOPS.filter((l) => !l.isUpcoming).length;

  const activeFilterCount =
    filters.brands.length +
    filters.priceRanges.length +
    filters.ramSizes.length +
    filters.processorFamilies.length +
    filters.gpuCategories.length +
    filters.useCases.length;

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="brand" size="sm" className="font-medium text-xs">
              <LaptopIcon className="h-3.5 w-3.5 text-brand-400" />
              <span>India Edition • Verified INR Pricing</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 font-sans">
            Find the Right Laptop
          </h1>
          <p className="text-sm sm:text-base text-surface-300 max-w-2xl font-normal">
            Compare real laptop configurations across Indian market retailers by verified price, BuyWise specs rating, battery, and workload fit.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
          <input
            type="text"
            placeholder="Search by brand, exact model, CPU, RTX GPU, or workload (e.g. 'OLED', 'MacBook Air M2', 'RTX 4060', 'Ryzen 7')..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-12 pr-12 py-3.5 bg-surface-900/90 border border-surface-750 focus:border-brand-400 rounded-2xl text-sm sm:text-base text-white placeholder-surface-500 transition-all outline-none shadow-lg shadow-black/20"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white p-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Top Controls Bar: Mobile filter trigger + Active Filter Badges + Sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-surface-800/80">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Mobile Filter Sheet Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 border-surface-700 text-xs font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4 text-brand-400" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full bg-brand-500 text-surface-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Laptop Count Indicator */}
            <span className="text-xs sm:text-sm text-surface-400 font-medium ml-1">
              Showing <strong className="text-white font-semibold">{displayedLaptops.length}</strong> {searchResult.isFallback ? "closest alternatives " : ""}of {availableCatalogCount} verified laptops
            </span>

            {/* Clear all active filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold ml-2 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all ({activeFilterCount})</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-xs text-surface-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              aria-label="Sort laptops"
              className="bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 rounded-xl px-3.5 py-2 focus:border-brand-400 focus:outline-none transition-all cursor-pointer hover:border-surface-600 shadow-sm"
            >
              <option value="recommended">BuyWise Recommended</option>
              <option value="lowest-listed-price">Lowest Listed Price</option>
              <option value="score-desc">BuyWise Score (High to Low)</option>
              <option value="best-value">Best Value Rating</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Main Workspace: Desktop Sidebar Filters + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 space-y-6">
            <div className="p-5 rounded-2xl bg-surface-900/60 border border-surface-800 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-surface-800/80">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white font-sans">
                    Refine Results
                  </h2>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-surface-400 hover:text-brand-400 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              <LaptopFilters
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                totalResults={displayedLaptops.length}
              />
            </div>
          </aside>

          {/* Product Grid / Empty State */}
          <main className="lg:col-span-3">
            <LaptopGrid
              laptops={displayedLaptops}
              upcomingLaptops={searchResult.upcomingMatches}
              isFallback={searchResult.isFallback}
              fallbackReason={searchResult.fallbackReason}
              hasBroadSuggestions={searchResult.hasBroadSuggestions}
              broadSuggestions={searchResult.broadSuggestions}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onResetFilters={handleResetFilters}
              onSelectSuggestion={(sug) => setFilters((prev) => ({ ...prev, searchQuery: sug }))}
            />
          </main>
        </div>

        {/* Mobile Filter Drawer Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm animate-fadeIn"
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Slide-over panel */}
            <div className="relative ml-auto w-full max-w-xs h-full bg-surface-900 border-l border-surface-800 p-6 flex flex-col justify-between shadow-2xl z-10 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-surface-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-400" />
                  <h3 className="text-base font-bold text-white font-sans">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="brand" size="sm" className="text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-surface-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 overflow-y-auto flex-1 pr-1 space-y-6">
                <LaptopFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                  totalResults={displayedLaptops.length}
                />
              </div>

              <div className="pt-4 border-t border-surface-800 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="w-1/2 text-xs font-semibold border-surface-700"
                >
                  Reset All
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-1/2 text-xs font-bold"
                >
                  Apply ({displayedLaptops.length})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LaptopsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-surface-400 font-medium">Loading BuyWise catalog...</p>
          </div>
        </div>
      }
    >
      <LaptopFinderContent />
    </Suspense>
  );
}
