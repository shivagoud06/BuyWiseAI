"use client";

import React, { useState } from "react";
import {
  BrandType,
  FilterState,
  GpuCategoryType,
  PriceRangeFilter,
  ProcessorFamilyType,
  RamSizeType,
  UseCaseType
} from "@/types";
import {
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface LaptopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const BRANDS: BrandType[] = ["Lenovo", "HP", "Dell", "ASUS", "Acer", "MSI", "Apple"];

const PRICE_RANGES: { id: PriceRangeFilter; label: string; sub: string }[] = [
  { id: "under-40k", label: "Under ₹40,000", sub: "Budget" },
  { id: "40k-50k", label: "₹40,000 – ₹50,000", sub: "Value" },
  { id: "50k-75k", label: "₹50,000 – ₹75,000", sub: "Mid-Range" },
  { id: "75k-100k", label: "₹75,000 – ₹1,00,000", sub: "High Performance" },
  { id: "above-100k", label: "Above ₹1,00,000", sub: "Flagship" },
];

const RAM_OPTIONS: { size: RamSizeType; label: string }[] = [
  { size: 8, label: "8GB" },
  { size: 16, label: "16GB" },
  { size: 32, label: "32GB" },
];

const PROCESSOR_FAMILIES: ProcessorFamilyType[] = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "AMD Ryzen 9",
  "Apple M-series",
];

const GPU_CATEGORIES: { id: GpuCategoryType; label: string }[] = [
  { id: "Integrated", label: "Integrated (Intel/Radeon)" },
  { id: "NVIDIA", label: "NVIDIA Dedicated" },
  { id: "AMD", label: "AMD Radeon Dedicated" },
  { id: "Apple", label: "Apple Silicon GPU" },
];

const USE_CASES: UseCaseType[] = [
  "Student",
  "Programming",
  "Gaming",
  "Office",
  "Content Creation",
];

export function LaptopFilters({
  filters,
  onChange,
  onReset,
  totalResults,
}: LaptopFiltersProps) {
  const [openSections, setOpenSections] = useState({
    price: true,
    useCase: true,
    brand: true,
    ram: true,
    processor: true,
    gpu: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandToggle = (brand: BrandType) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: updated });
  };

  const handlePriceToggle = (priceId: PriceRangeFilter) => {
    const updated = filters.priceRanges.includes(priceId)
      ? filters.priceRanges.filter((p) => p !== priceId)
      : [...filters.priceRanges, priceId];
    onChange({ ...filters, priceRanges: updated });
  };

  const handleRamToggle = (ram: RamSizeType) => {
    const updated = filters.ramSizes.includes(ram)
      ? filters.ramSizes.filter((r) => r !== ram)
      : [...filters.ramSizes, ram];
    onChange({ ...filters, ramSizes: updated });
  };

  const handleProcessorToggle = (proc: ProcessorFamilyType) => {
    const updated = filters.processorFamilies.includes(proc)
      ? filters.processorFamilies.filter((p) => p !== proc)
      : [...filters.processorFamilies, proc];
    onChange({ ...filters, processorFamilies: updated });
  };

  const handleGpuToggle = (gpu: GpuCategoryType) => {
    const updated = filters.gpuCategories.includes(gpu)
      ? filters.gpuCategories.filter((g) => g !== gpu)
      : [...filters.gpuCategories, gpu];
    onChange({ ...filters, gpuCategories: updated });
  };

  const handleUseCaseToggle = (uc: UseCaseType) => {
    const updated = filters.useCases.includes(uc)
      ? filters.useCases.filter((u) => u !== uc)
      : [...filters.useCases, uc];
    onChange({ ...filters, useCases: updated });
  };

  const activeCount =
    filters.brands.length +
    filters.priceRanges.length +
    filters.ramSizes.length +
    filters.processorFamilies.length +
    filters.gpuCategories.length +
    filters.useCases.length;

  return (
    <div className="space-y-5">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-semibold px-2 py-0.5">
              {activeCount} active
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-brand-400 transition-colors font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>

      {/* 1. Price Range */}
      <div className="border-b border-surface-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>Price (Indian Rupees)</span>
          {openSections.price ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.price && (
          <div className="space-y-1">
            {PRICE_RANGES.map((range) => {
              const checked = filters.priceRanges.includes(range.id);
              return (
                <label
                  key={range.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-500/15 text-white border border-brand-500/30"
                      : "text-surface-300 hover:bg-surface-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handlePriceToggle(range.id)}
                      className="rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-400 h-3.5 w-3.5"
                    />
                    <span>{range.label}</span>
                  </div>
                  <span className="text-[10px] text-surface-500 font-normal">{range.sub}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Use Case */}
      <div className="border-b border-surface-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("useCase")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>Use Case</span>
          {openSections.useCase ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.useCase && (
          <div className="flex flex-wrap gap-1.5">
            {USE_CASES.map((uc) => {
              const checked = filters.useCases.includes(uc);
              return (
                <button
                  key={uc}
                  type="button"
                  onClick={() => handleUseCaseToggle(uc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    checked
                      ? "bg-brand-500 text-surface-950 border-brand-400 font-semibold shadow-sm"
                      : "bg-surface-800/40 border-surface-700/60 text-surface-300 hover:bg-surface-800 hover:text-white"
                  }`}
                >
                  {uc}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Brand */}
      <div className="border-b border-surface-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("brand")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>Brand</span>
          {openSections.brand ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.brand && (
          <div className="grid grid-cols-2 gap-1">
            {BRANDS.map((brand) => {
              const checked = filters.brands.includes(brand);
              return (
                <label
                  key={brand}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-500/15 text-white border border-brand-500/30 font-semibold"
                      : "text-surface-300 hover:bg-surface-800/60 hover:text-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-400 h-3.5 w-3.5"
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RAM */}
      <div className="border-b border-surface-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("ram")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>RAM</span>
          {openSections.ram ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.ram && (
          <div className="grid grid-cols-3 gap-1.5">
            {RAM_OPTIONS.map((item) => {
              const checked = filters.ramSizes.includes(item.size);
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => handleRamToggle(item.size)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    checked
                      ? "bg-brand-500 text-surface-950 border-brand-400 font-semibold shadow-sm"
                      : "bg-surface-800/40 border-surface-700/60 text-surface-300 hover:bg-surface-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Processor */}
      <div className="border-b border-surface-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("processor")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>Processor</span>
          {openSections.processor ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.processor && (
          <div className="space-y-1">
            {PROCESSOR_FAMILIES.map((proc) => {
              const checked = filters.processorFamilies.includes(proc);
              return (
                <label
                  key={proc}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-500/15 text-white border border-brand-500/30"
                      : "text-surface-300 hover:bg-surface-800/60 hover:text-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleProcessorToggle(proc)}
                    className="rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-400 h-3.5 w-3.5"
                  />
                  <span>{proc}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. GPU */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("gpu")}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2.5 hover:text-white"
        >
          <span>GPU</span>
          {openSections.gpu ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.gpu && (
          <div className="space-y-1">
            {GPU_CATEGORIES.map((gpu) => {
              const checked = filters.gpuCategories.includes(gpu.id);
              return (
                <label
                  key={gpu.id}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-500/15 text-white border border-brand-500/30"
                      : "text-surface-300 hover:bg-surface-800/60 hover:text-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleGpuToggle(gpu.id)}
                    className="rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-400 h-3.5 w-3.5"
                  />
                  <span>{gpu.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
