import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AdvisorBox } from "@/components/home/AdvisorBox";
import { PopularSearches } from "@/components/home/PopularSearches";
import { WhyBuyWise } from "@/components/home/WhyBuyWise";
import { RetailerLogoMarquee } from "@/components/retailers/RetailerLogoMarquee";
import { FeaturedLaptops } from "@/components/home/FeaturedLaptops";
import { ScoreExplainer } from "@/components/home/ScoreExplainer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* 1. Hero Section ("Find the right laptop") */}
      <HeroSection />

      {/* 2. Interactive Search & Buying Box (Search bar, Find My Laptop / Compare) */}
      <AdvisorBox />

      {/* 3. Popular Searches (Student, Programming, Gaming, Creator, Business, Budget) */}
      <PopularSearches />

      {/* 4. Retailer Logo Marquee */}
      <RetailerLogoMarquee />

      {/* 5. Featured / Recommended Laptops */}
      <FeaturedLaptops />

      {/* 6. How BuyWise Works */}
      <HowItWorks />

      {/* 7. Why BuyWise */}
      <WhyBuyWise />

      {/* 8. BuyWise Score Explanation */}
      <ScoreExplainer />

      {/* 9. Final CTA */}
      <FinalCTA />
    </div>
  );
}
