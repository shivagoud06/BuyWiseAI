import { Laptop } from "@/types";

export type InterestEventType =
  | "product_view"
  | "search"
  | "compare"
  | "advisor_use"
  | "advisor_recommendation_click"
  | "retailer_click"
  | "feedback_submit";

export interface BaseInterestEvent {
  id: string;
  type: InterestEventType;
  timestamp: string; // ISO 8601 string
  anonymousSessionId: string;
}

export interface ProductViewInterestEvent extends BaseInterestEvent {
  type: "product_view";
  productId: string;
  isRepeat?: boolean;
}

export interface SearchInterestEvent extends BaseInterestEvent {
  type: "search";
  query: string;
  normalizedQuery: string;
  matchedProductIds?: string[];
}

export interface CompareInterestEvent extends BaseInterestEvent {
  type: "compare";
  productIds: string[];
}

export interface AdvisorUseInterestEvent extends BaseInterestEvent {
  type: "advisor_use";
  category?: string;
  useCase?: string;
  budget?: string;
  recommendedProductIds?: string[];
}

export interface AdvisorRecommendationClickInterestEvent extends BaseInterestEvent {
  type: "advisor_recommendation_click";
  productId: string;
}

export interface RetailerClickInterestEvent extends BaseInterestEvent {
  type: "retailer_click";
  retailerId: string;
  productId: string;
  clickType?: "affiliate" | "product";
}

export interface FeedbackInterestEvent extends BaseInterestEvent {
  type: "feedback_submit";
  productId?: string;
  rating?: number;
  category?: string;
}

export type InterestEvent =
  | ProductViewInterestEvent
  | SearchInterestEvent
  | CompareInterestEvent
  | AdvisorUseInterestEvent
  | AdvisorRecommendationClickInterestEvent
  | RetailerClickInterestEvent
  | FeedbackInterestEvent;

export type InterestEventInput =
  | { type: "product_view"; productId: string; timestamp?: string }
  | { type: "search"; query: string; matchedProductIds?: string[]; timestamp?: string }
  | { type: "compare"; productIds: string[]; timestamp?: string }
  | { type: "advisor_use"; category?: string; useCase?: string; budget?: string; recommendedProductIds?: string[]; timestamp?: string }
  | { type: "advisor_recommendation_click"; productId: string; timestamp?: string }
  | { type: "retailer_click"; retailerId: string; productId: string; clickType?: "affiliate" | "product"; timestamp?: string }
  | { type: "feedback_submit"; productId?: string; rating?: number; category?: string; timestamp?: string };

export interface ScoreBreakdownDetails {
  productViews: number;
  searchMatches: number;
  compares: number;
  advisorInteractions: number;
  retailerClicks: number;
  feedback: number;
}

export interface InterestScoreResult {
  productId: string;
  score: number; // Final score after time decay (rounded to 2 decimal places)
  rawScore: number; // Score before time decay
  interactionCount: number;
  lastInteractedAt: string;
  breakdown: ScoreBreakdownDetails;
}

export interface TopInterestedProduct {
  laptop: Laptop;
  score: number;
  rawScore: number;
  lastInteractedAt: string;
  interactionCount: number;
  breakdown: ScoreBreakdownDetails;
}

export interface InterestScoringWeights {
  productView: number;
  repeatProductView: number;
  searchMatch: number;
  compare: number;
  advisorMatch: number;
  advisorRecommendationClick: number;
  retailerClick: number;
  feedback: number;
}

export interface InterestScoringOptions {
  now?: number | Date;
  halfLifeDays?: number;
  halfLifeMs?: number;
  weights?: Partial<InterestScoringWeights>;
  minScore?: number;
}

export interface PrivacyPreferences {
  trackingEnabled: boolean;
  anonymousId: string;
  totalEventsStored: number;
}
