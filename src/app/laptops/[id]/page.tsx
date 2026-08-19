import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LAPTOPS } from "@/data/laptops";
import { formatINR } from "@/lib/utils";
import { LaptopClientDetails } from "./LaptopClientDetails";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface LaptopPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: LaptopPageProps): Metadata {
  const laptop = LAPTOPS.find((l) => l.id === params.id);
  if (!laptop) {
    return {
      title: "Laptop Not Found",
    };
  }

  const priceStr = laptop.price ? `₹${laptop.price.toLocaleString("en-IN")}` : "Price on Request";
  const desc = `${laptop.fullName}. Specifications: ${laptop.processor}, ${laptop.ram}, ${laptop.storage}, ${laptop.gpu}. BuyWise Score: ${laptop.buyWiseScore}/100. Reference Price: ${priceStr}.`;

  return {
    title: `${laptop.name} (${laptop.processorFamily}, ${laptop.ram}) Specs & Price`,
    description: desc,
    openGraph: {
      title: `${laptop.name} — BuyWise AI Score ${laptop.buyWiseScore}/100`,
      description: desc,
      type: "website",
      images: laptop.image ? [{ url: laptop.image }] : undefined,
    },
  };
}

import { getRetailerOffers } from "@/services/retailers";

export function generateStaticParams() {
  return LAPTOPS.map((laptop) => ({
    id: laptop.id,
  }));
}

export default async function LaptopDetailsPage({ params }: LaptopPageProps) {
  const laptop = LAPTOPS.find((l) => l.id === params.id);

  if (!laptop) {
    notFound();
  }

  // Invoke the server-side live retailer pipeline (Amazon, Flipkart, eBay)
  const countryCode = laptop.currency === "USD" ? "US" : "IN";
  const initialOffers = await getRetailerOffers(laptop, countryCode);

  // Find similar laptops based on price range or overlapping use cases
  const similarLaptops = LAPTOPS.filter((l) => l.id !== laptop.id)
    .map((l) => {
      let similarityScore = 0;
      // Overlapping use cases
      const sharedUseCases = l.useCases.filter((uc) => laptop.useCases.includes(uc)).length;
      similarityScore += sharedUseCases * 3;
      // Similar price (within 35%)
      if (l.price && laptop.price) {
        const priceDiffRatio = Math.abs(l.price - laptop.price) / laptop.price;
        if (priceDiffRatio < 0.25) similarityScore += 5;
        else if (priceDiffRatio < 0.45) similarityScore += 2;
      }
      // Same brand bonus
      if (l.brand === laptop.brand) similarityScore += 2;
      return { laptop: l, score: similarityScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.laptop);

  const primaryCategory = laptop.useCases[0] || "Everyday";

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-surface-400 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-white transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-surface-600" />
          <Link href="/laptops" className="hover:text-white transition-colors font-medium">
            Laptops
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-surface-600" />
          <span className="text-surface-200 font-medium truncate max-w-[200px] sm:max-w-none">
            {laptop.name}
          </span>
        </nav>

        {/* Client Interactive Product Header & Info Area */}
        <React.Suspense fallback={<div className="p-12 text-center text-surface-400">Loading product details...</div>}>
          <LaptopClientDetails laptop={laptop} initialOffers={initialOffers} />
        </React.Suspense>

        {/* Similar Laptops Section */}
        {similarLaptops.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-surface-800/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Alternative Choices
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Similar {primaryCategory} Laptops to Compare
                </h2>
              </div>
              <Link
                href="/laptops"
                className="text-xs sm:text-sm text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                View all in catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarLaptops.map((simLaptop) => (
                <LaptopCard key={simLaptop.id} laptop={simLaptop} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
