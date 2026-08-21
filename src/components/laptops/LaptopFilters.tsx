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
  ChevronDown,
  ChevronUp,
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
  { id: "75k-100k", label: "₹75,000 – ₹1,00,000", sub: "Performance" },
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

// Reusable section header button
function SectionHeader({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-widest text-shop-muted mb-2.5 hover:text-shop-text transition-colors"
    >
      <span>{label}</span>
      {isOpen ? (
        <ChevronUp className="h-3.5 w-3.5 text-shop-muted" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-shop-muted" />
      )}
    </button>
  );
}

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
    processor: false,
    gpu: false,
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
    <div className="space-y-4">
      {/* Filter Header row */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-shop-border">
          <span className="text-xs text-shop-muted font-medium">
            <span className="font-bold text-shop-text">{activeCount}</span> active filter{activeCount !== 1 && "s"}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        </div>
      )}

      {/* 1. Price Range */}
      <div className="border-b border-shop-border pb-4">
        <SectionHeader
          label="Price (INR)"
          isOpen={openSections.price}
          onToggle={() => toggleSection("price")}
        />
        {openSections.price && (
          <div className="space-y-0.5">
            {PRICE_RANGES.map((range) => {
              const checked = filters.priceRanges.includes(range.id);
              return (
                <label
                  key={range.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-shop-text hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handlePriceToggle(range.id)}
                      className="shop-checkbox rounded border-shop-border h-3.5 w-3.5"
                    />
                    <span>{range.label}</span>
                  </div>
                  <span className={`text-[10px] font-normal ${checked ? "text-brand-500" : "text-shop-muted"}`}>
                    {range.sub}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Use Case */}
      <div className="border-b border-shop-border pb-4">
        <SectionHeader
          label="Use Case"
          isOpen={openSections.useCase}
          onToggle={() => toggleSection("useCase")}
        />
        {openSections.useCase && (
          <div className="flex flex-wrap gap-1.5">
            {USE_CASES.map((uc) => {
              const checked = filters.useCases.includes(uc);
              return (
                <button
                  key={uc}
                  type="button"
                  onClick={() => handleUseCaseToggle(uc)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    checked
                      ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                      : "bg-white border-shop-border text-shop-text hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50"
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
      <div className="border-b border-shop-border pb-4">
        <SectionHeader
          label="Brand"
          isOpen={openSections.brand}
          onToggle={() => toggleSection("brand")}
        />
        {openSections.brand && (
          <div className="grid grid-cols-2 gap-1">
            {BRANDS.map((brand) => {
              const checked = filters.brands.includes(brand);
              return (
                <label
                  key={brand}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-shop-text hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(brand)}
                    className="shop-checkbox rounded border-shop-border h-3.5 w-3.5"
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RAM */}
      <div className="border-b border-shop-border pb-4">
        <SectionHeader
          label="RAM"
          isOpen={openSections.ram}
          onToggle={() => toggleSection("ram")}
        />
        {openSections.ram && (
          <div className="grid grid-cols-3 gap-1.5">
            {RAM_OPTIONS.map((item) => {
              const checked = filters.ramSizes.includes(item.size);
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => handleRamToggle(item.size)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                    checked
                      ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                      : "bg-white border-shop-border text-shop-text hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50"
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
      <div className="border-b border-shop-border pb-4">
        <SectionHeader
          label="Processor"
          isOpen={openSections.processor}
          onToggle={() => toggleSection("processor")}
        />
        {openSections.processor && (
          <div className="space-y-0.5">
            {PROCESSOR_FAMILIES.map((proc) => {
              const checked = filters.processorFamilies.includes(proc);
              return (
                <label
                  key={proc}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-shop-text hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleProcessorToggle(proc)}
                    className="shop-checkbox rounded border-shop-border h-3.5 w-3.5"
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
        <SectionHeader
          label="GPU"
          isOpen={openSections.gpu}
          onToggle={() => toggleSection("gpu")}
        />
        {openSections.gpu && (
          <div className="space-y-0.5">
            {GPU_CATEGORIES.map((gpu) => {
              const checked = filters.gpuCategories.includes(gpu.id);
              return (
                <label
                  key={gpu.id}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    checked
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-shop-text hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleGpuToggle(gpu.id)}
                    className="shop-checkbox rounded border-shop-border h-3.5 w-3.5"
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
