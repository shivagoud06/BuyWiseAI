"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Laptop } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCompare } from "@/context/CompareContext";
import {
  Cpu,
  Monitor,
  Layers,
  Star,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface LaptopCardProps {
  laptop: Laptop;
}

export function LaptopCard({ laptop }: LaptopCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isComparing, toggleLaptop } = useCompare();
  const compared = isComparing(laptop.id);

  const discount =
    laptop.originalPrice && laptop.price
      ? Math.round(((laptop.originalPrice - laptop.price) / laptop.originalPrice) * 100)
      : 0;

  const getVerdictBadge = () => {
    switch (laptop.verdict) {
      case "BUY":
        return (
          <Badge variant="verdict-buy" size="sm" className="font-medium text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            BUY
          </Badge>
        );
      case "WAIT":
        return (
          <Badge variant="verdict-wait" size="sm" className="font-medium text-[11px]">
            <Clock className="h-3 w-3" />
            WAIT
          </Badge>
        );
      case "SKIP":
        return (
          <Badge variant="verdict-skip" size="sm" className="font-medium text-[11px]">
            <AlertTriangle className="h-3 w-3" />
            SKIP
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 80) return "text-brand-400 border-brand-500/40 bg-brand-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  const shortProcessor = laptop.processor.split("(")[0].trim();

  return (
    <Card
      glow
      className="group flex flex-col justify-between p-0 overflow-hidden border-surface-800 bg-surface-900/60 hover:border-surface-700 transition-all duration-300 rounded-2xl"
    >
      <div>
        {/* Top Image Area */}
        <Link
          href={`/laptops/${laptop.id}`}
          className="relative aspect-[16/10] w-full block bg-surface-950/80 overflow-hidden border-b border-surface-800/80"
        >
          <img
            src={laptop.image}
            alt={`${laptop.brand} ${laptop.name} laptop`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-900 animate-pulse">
              <Cpu className="h-8 w-8 text-surface-600 animate-spin" />
            </div>
          )}

          {/* Top Overlays: Brand & Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="rounded-md bg-surface-950/85 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-surface-700/50">
              {laptop.brand}
            </span>
            {laptop.badge && (
              <span className="rounded-md bg-brand-500/90 px-2 py-0.5 text-[11px] font-semibold text-surface-950 shadow-sm backdrop-blur-md">
                {laptop.badge}
              </span>
            )}
          </div>

          {/* Top Right: BuyWise Score (Inter 700) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
            <div
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 backdrop-blur-md text-xs font-bold ${getScoreColor(
                laptop.buyWiseScore
              )}`}
              title="BuyWise AI Spec-to-Value Score"
            >
              <Sparkles className="h-3 w-3" />
              <span>{laptop.buyWiseScore}</span>
              <span className="text-[10px] opacity-70 font-medium">/100</span>
            </div>
          </div>

          {/* Bottom Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-900 to-transparent" />
        </Link>

        {/* Content Area */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Rating & Verdict */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-surface-200">{laptop.rating.toFixed(1)}</span>
              <span className="text-surface-500 text-[11px] font-normal">
                ({laptop.reviewCount.toLocaleString("en-IN")})
              </span>
            </div>
            <div>{getVerdictBadge()}</div>
          </div>

          {/* Product Name (Inter 600) */}
          <Link href={`/laptops/${laptop.id}`}>
            <h3 className="text-base font-semibold text-white leading-snug group-hover:text-brand-300 transition-colors line-clamp-1">
              {laptop.name}
            </h3>
          </Link>

          {/* Compact Hardware Summary line */}
          <p className="text-xs font-medium text-surface-300 truncate">
            {shortProcessor.split(" ")[0]} {shortProcessor.split(" ")[1] || ""} • {laptop.ram.split(" ")[0]} RAM • {laptop.storage.split(" ")[0]} SSD
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Processor */}
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-950/60 border border-surface-800/80 p-2 text-surface-300">
              <Cpu className="h-3.5 w-3.5 text-brand-400 shrink-0" />
              <span className="truncate font-medium text-[11px]" title={laptop.processor}>
                {shortProcessor}
              </span>
            </div>

            {/* RAM & Storage */}
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-950/60 border border-surface-800/80 p-2 text-surface-300">
              <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate font-medium text-[11px]">
                {laptop.ram.split(" ")[0]} | {laptop.storage.split(" ")[0]}
              </span>
            </div>

            {/* GPU */}
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-950/60 border border-surface-800/80 p-2 text-surface-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <span className="truncate font-medium text-[11px]" title={laptop.gpu}>
                {laptop.gpu.replace("NVIDIA GeForce ", "")}
              </span>
            </div>

            {/* Display */}
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-950/60 border border-surface-800/80 p-2 text-surface-300">
              <Monitor className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="truncate font-medium text-[11px]" title={laptop.display}>
                {laptop.display.split("(")[0].trim()}
              </span>
            </div>
          </div>

          {/* Use Case Tags (Inter 500) */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {laptop.useCases.map((uc) => (
              <span
                key={uc}
                className="rounded-md bg-surface-800/50 px-2 py-0.5 text-[10px] font-medium text-surface-300 border border-surface-700/40"
              >
                {uc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="border-t border-surface-800/80 bg-surface-950/40 p-4 sm:p-5">
        {/* Price (Inter 700) */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            {laptop.price && laptop.price > 0 ? (
              <>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                  {formatINR(laptop.price)}
                </div>
                {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                  <div className="flex items-center gap-1.5 text-xs text-surface-500 font-normal">
                    <span className="line-through">{formatINR(laptop.originalPrice)}</span>
                    <span className="font-semibold text-emerald-400">({discount}% off)</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm font-semibold text-surface-400">
                Price unavailable
              </div>
            )}
          </div>
          <div className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">
            INR Price
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={compared ? "primary" : "secondary"}
            size="sm"
            onClick={() => toggleLaptop(laptop)}
            className="w-full text-xs font-semibold"
          >
            {compared ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Compare</span>
              </>
            )}
          </Button>

          <Link href={`/laptops/${laptop.id}`} className="w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
