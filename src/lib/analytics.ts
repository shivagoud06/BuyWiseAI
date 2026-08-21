import { RetailerId } from "@/types";
import { interestTracker } from "@/services/interest/tracker";

export * from "@/services/interest";

export type AnalyticsEventType =
  | "retailer_click"
  | "search"
  | "product_view"
  | "compare"
  | "advisor_use"
  | "advisor_recommendation_click"
  | "feedback_open"
  | "feedback_submit"
  | "feedback_helpful"
  | "feedback_not_helpful"
  | "feedback_approved"
  | "recommendation_helpful"
  | "recommendation_not_helpful";

export interface RetailerClickAnalyticsPayload {
  productId: string;
  productName?: string;
  retailerId: RetailerId | string;
  retailerName?: string;
  price?: number;
  clickType?: "affiliate" | "product";
  targetUrl?: string;
  trackingProvider?: string;
  timestamp?: string;
}

export interface SearchAnalyticsPayload {
  query: string;
  resultCount?: number;
  matchedProductIds?: string[];
  timestamp?: string;
}

export interface ProductViewAnalyticsPayload {
  productId: string;
  productName?: string;
  price?: number;
  timestamp?: string;
}

export interface CompareAnalyticsPayload {
  productIds: string[];
  productCount?: number;
  timestamp?: string;
}

export interface AdvisorUseAnalyticsPayload {
  primaryUse?: string;
  category?: string;
  budget?: string;
  recommendationsCount?: number;
  recommendedProductIds?: string[];
  isRelaxed?: boolean;
  timestamp?: string;
}

export interface AdvisorRecommendationClickPayload {
  productId: string;
  productName?: string;
  timestamp?: string;
}

export interface FeedbackOpenAnalyticsPayload {
  source?: string;
  productId?: string;
  timestamp?: string;
}

export interface FeedbackSubmitAnalyticsPayload {
  rating?: number;
  category?: string;
  hasComment?: boolean;
  hasEmail?: boolean;
  productId?: string;
  timestamp?: string;
}

export interface FeedbackVoteAnalyticsPayload {
  feedbackId?: string;
  timestamp?: string;
}

export interface RecommendationVoteAnalyticsPayload {
  productId?: string;
  productName?: string;
  isHelpful?: boolean;
  timestamp?: string;
}

const FORBIDDEN_KEYS = [
  "apiKey",
  "secret",
  "clientSecret",
  "password",
  "token",
  "authHeader",
  "authorization",
  "cardNumber",
  "cvv",
  "creditCard",
  "comment",
  "message",
  "email",
  "phone",
];

/**
 * Sanitizes an analytics payload to prevent secret or sensitive credential leaks
 */
function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!FORBIDDEN_KEYS.some((f) => k.toLowerCase().includes(f.toLowerCase()))) {
      clean[k] = v;
    }
  }
  return clean as T;
}

/**
 * Dispatches a safe internal analytics event and forwards to interest tracking system
 */
export function trackEvent(eventName: AnalyticsEventType, payload: Record<string, any>): void {
  const sanitized = sanitizePayload(payload);
  const event = {
    event: eventName,
    ...sanitized,
    timestamp: sanitized.timestamp || new Date().toISOString(),
  };

  // Forward into smart interest tracker
  try {
    switch (eventName) {
      case "product_view":
        if (sanitized.productId) {
          interestTracker.recordProductView(sanitized.productId, event.timestamp);
        }
        break;

      case "search":
        if (sanitized.query) {
          interestTracker.recordSearch(sanitized.query, sanitized.matchedProductIds, event.timestamp);
        }
        break;

      case "compare":
        if (Array.isArray(sanitized.productIds)) {
          interestTracker.recordCompare(sanitized.productIds, event.timestamp);
        }
        break;

      case "advisor_use":
        interestTracker.recordAdvisorUse({
          category: sanitized.category || sanitized.primaryUse,
          useCase: sanitized.primaryUse || sanitized.category,
          budget: sanitized.budget,
          recommendedProductIds: sanitized.recommendedProductIds,
          timestamp: event.timestamp,
        });
        break;

      case "advisor_recommendation_click":
        if (sanitized.productId) {
          interestTracker.recordAdvisorRecommendationClick(sanitized.productId, event.timestamp);
        }
        break;

      case "retailer_click":
        if (sanitized.retailerId && sanitized.productId) {
          interestTracker.recordRetailerClick(
            sanitized.retailerId,
            sanitized.productId,
            sanitized.clickType,
            event.timestamp
          );
        }
        break;

      case "feedback_submit":
        interestTracker.recordFeedback({
          productId: sanitized.productId,
          rating: sanitized.rating,
          category: sanitized.category,
          timestamp: event.timestamp,
        });
        break;
    }
  } catch {
    // Interest tracking fail-safe
  }

  if (process.env.NODE_ENV === "development") {
    // console.debug(`[Analytics: ${eventName}]`, event);
  }
}

export const analytics = {
  trackRetailerClick: (payload: RetailerClickAnalyticsPayload) => trackEvent("retailer_click", payload),
  trackSearch: (payload: SearchAnalyticsPayload) => trackEvent("search", payload),
  trackProductView: (payload: ProductViewAnalyticsPayload) => trackEvent("product_view", payload),
  trackCompare: (payload: CompareAnalyticsPayload) => trackEvent("compare", payload),
  trackAdvisorUse: (payload: AdvisorUseAnalyticsPayload) => trackEvent("advisor_use", payload),
  trackAdvisorRecommendationClick: (payload: AdvisorRecommendationClickPayload) =>
    trackEvent("advisor_recommendation_click", payload),
  trackFeedbackOpen: (payload?: FeedbackOpenAnalyticsPayload) => trackEvent("feedback_open", payload || {}),
  trackFeedbackSubmit: (payload: FeedbackSubmitAnalyticsPayload) => trackEvent("feedback_submit", payload),
  trackFeedbackHelpful: (payload: FeedbackVoteAnalyticsPayload) => trackEvent("feedback_helpful", payload),
  trackFeedbackNotHelpful: (payload: FeedbackVoteAnalyticsPayload) => trackEvent("feedback_not_helpful", payload),
  trackRecommendationHelpful: (payload: RecommendationVoteAnalyticsPayload) =>
    trackEvent("recommendation_helpful", payload),
  trackRecommendationNotHelpful: (payload: RecommendationVoteAnalyticsPayload) =>
    trackEvent("recommendation_not_helpful", payload),
};
