import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AdvisorBox } from "@/components/home/AdvisorBox";
import { PopularSearches } from "@/components/home/PopularSearches";
import { WhyBuyWise } from "@/components/home/WhyBuyWise";
import { FeaturedLaptops } from "@/components/home/FeaturedLaptops";
import { ScoreExplainer } from "@/components/home/ScoreExplainer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Interactive Buying Box */}
      <AdvisorBox />

      {/* 3. Popular Searches */}
      <PopularSearches />

      {/* 4. Why BuyWise */}
      <WhyBuyWise />

      {/* 5. Trending / Popular Laptops */}
      <FeaturedLaptops />

      {/* 6. BuyWise Score Explanation */}
      <ScoreExplainer />

      {/* 7. How It Works (01, 02, 03) */}
      <HowItWorks />

      {/* 8. Final CTA */}
      <FinalCTA />
    </div>
  );
}
