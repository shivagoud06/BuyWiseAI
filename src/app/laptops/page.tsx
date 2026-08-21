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
  RotateCcw,
} from "lucide-react";
import { analytics } from "@/lib/analytics";

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

    if (q) setFilters((prev) => ({ ...prev, searchQuery: q }));
    if (useCase) setFilters((prev) => ({ ...prev, useCases: [useCase as UseCaseType] }));
    if (budget) setFilters((prev) => ({ ...prev, priceRanges: [budget] }));
    if (brand) setFilters((prev) => ({ ...prev, brands: [brand as any] }));
    if (sort) setSortOption(sort);
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

  const searchResult = useMemo(() => {
    return findSmartSearchResults(LAPTOPS, filters, sortOption);
  }, [filters, sortOption]);

  // Debounced search query interest tracking
  useEffect(() => {
    const q = filters.searchQuery?.trim();
    if (!q || q.length < 2) return;
    const timer = setTimeout(() => {
      const matchedIds = searchResult.exactMatches.slice(0, 5).map((l) => l.id);
      analytics.trackSearch({
        query: q,
        resultCount: searchResult.exactMatches.length,
        matchedProductIds: matchedIds,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [filters.searchQuery, searchResult.exactMatches]);

  const displayedLaptops =
    searchResult.exactMatches.length > 0
      ? searchResult.exactMatches
      : searchResult.fallbackMatches;

  const availableCatalogCount = LAPTOPS.filter((l) => !l.isUpcoming).length;

  const activeFilterCount =
    filters.brands.length +
    filters.priceRanges.length +
    filters.ramSizes.length +
    filters.processorFamilies.length +
    filters.gpuCategories.length +
    filters.useCases.length;

  return (
    /* ── SHOP PAGE LIGHT THEME WRAPPER ── */
    <div className="shop-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full">
              <LaptopIcon className="h-3 w-3" />
              India Edition · Verified INR Pricing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-shop-text mb-2">
            Find the Right Laptop
          </h1>
          <p className="text-sm text-shop-muted max-w-2xl font-normal">
            Compare real laptop configurations across Indian market retailers by verified price, BuyWise specs rating, battery, and workload fit.
          </p>
        </div>

        {/* ── Global Search Bar ── */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-shop-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search brand, model, CPU, GPU or workload (e.g. 'RTX 4060', 'MacBook Air M2', 'Ryzen 7')…"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-11 pr-11 py-3 bg-white border border-shop-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl text-sm text-shop-text placeholder-shop-muted transition-all outline-none shadow-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-shop-muted hover:text-shop-text p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Top Controls: Filter trigger + count + active filters ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-shop-border">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 text-xs font-semibold text-shop-text bg-white border border-shop-border px-3 py-1.5 rounded-lg hover:border-brand-400 hover:text-brand-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-brand-500" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Result count */}
            <span className="text-sm text-shop-muted font-normal">
              Showing{" "}
              <strong className="text-shop-text font-semibold">{displayedLaptops.length}</strong>
              {searchResult.isFallback ? " closest alternatives " : " "}
              of <strong className="text-shop-text font-semibold">{availableCatalogCount}</strong> verified laptops
            </span>

            {/* Clear all filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold ml-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset all ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-shop-muted font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              aria-label="Sort laptops"
              className="bg-white border border-shop-border text-xs font-semibold text-shop-text rounded-lg px-3 py-1.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all cursor-pointer hover:border-gray-400 shadow-sm"
            >
              <option value="recommended">BuyWise Recommended</option>
              <option value="lowest-listed-price">Lowest Listed Price</option>
              <option value="score-desc">BuyWise Score (High to Low)</option>
              <option value="best-value">Best Value Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* ── Main Workspace: Desktop Sidebar + Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block sticky top-24">
            <div className="bg-white border border-shop-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-shop-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-500" />
                  <h2 className="text-sm font-bold text-shop-text">Refine Results</h2>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
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

          {/* Product Grid */}
          <main>
            <LaptopGrid
              laptops={displayedLaptops}
              upcomingLaptops={searchResult.upcomingMatches}
              isFallback={searchResult.isFallback}
              fallbackReason={searchResult.fallbackReason}
              fallbackExplanations={searchResult.fallbackExplanations}
              hasBroadSuggestions={searchResult.hasBroadSuggestions}
              broadSuggestions={searchResult.broadSuggestions}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onResetFilters={handleResetFilters}
              onSelectSuggestion={(sug) =>
                setFilters((prev) => ({ ...prev, searchQuery: sug }))
              }
            />
          </main>
        </div>

        {/* ── Mobile Filter Drawer ── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Slide-over panel */}
            <div className="relative ml-auto w-full max-w-xs h-full bg-white border-l border-shop-border p-5 flex flex-col justify-between shadow-2xl z-10 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-shop-border">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-brand-500" />
                    <h3 className="text-base font-bold text-shop-text">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-lg text-shop-muted hover:text-shop-text hover:bg-gray-100 transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-180px)] pr-1 space-y-4">
                  <LaptopFilters
                    filters={filters}
                    onChange={setFilters}
                    onReset={handleResetFilters}
                    totalResults={displayedLaptops.length}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-shop-border flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 text-xs font-semibold text-shop-text bg-white border border-shop-border py-2 rounded-lg hover:border-gray-400 transition-all"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 py-2 rounded-lg transition-all"
                >
                  Show {displayedLaptops.length} Results
                </button>
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
        <div className="shop-page min-h-screen flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-shop-muted font-medium">Loading BuyWise catalog…</p>
          </div>
        </div>
      }
    >
      <LaptopFinderContent />
    </Suspense>
  );
}
