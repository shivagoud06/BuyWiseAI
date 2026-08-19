import { RetailerId } from "@/types";

export type AnalyticsEventType =
  | "retailer_click"
  | "search"
  | "product_view"
  | "compare"
  | "advisor_use"
  | "feedback_open"
  | "feedback_submit"
  | "recommendation_helpful"
  | "recommendation_not_helpful";

export interface RetailerClickAnalyticsPayload {
  productId: string;
  productName?: string;
  retailerId: RetailerId;
  retailerName?: string;
  price: number;
  clickType: "affiliate" | "product";
  targetUrl: string;
  trackingProvider?: string;
  timestamp?: string;
}

export interface SearchAnalyticsPayload {
  query: string;
  resultCount: number;
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
  productCount: number;
  timestamp?: string;
}

export interface AdvisorUseAnalyticsPayload {
  primaryUse: string;
  budget: string;
  recommendationsCount: number;
  isRelaxed: boolean;
  timestamp?: string;
}

export interface FeedbackOpenAnalyticsPayload {
  source?: string;
  productId?: string;
  timestamp?: string;
}

export interface FeedbackSubmitAnalyticsPayload {
  rating: number;
  category: string;
  hasComment: boolean;
  hasEmail: boolean;
  productId?: string;
  timestamp?: string;
}

export interface RecommendationVoteAnalyticsPayload {
  productId?: string;
  productName?: string;
  isHelpful: boolean;
  timestamp?: string;
}

const FORBIDDEN_KEYS = ["apiKey", "secret", "clientSecret", "password", "token", "authHeader", "authorization", "comment"];

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
 * Dispatches a safe internal analytics event
 */
export function trackEvent(eventName: AnalyticsEventType, payload: Record<string, any>): void {
  const sanitized = sanitizePayload(payload);
  const event = {
    event: eventName,
    ...sanitized,
    timestamp: sanitized.timestamp || new Date().toISOString(),
  };

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
  trackFeedbackOpen: (payload?: FeedbackOpenAnalyticsPayload) => trackEvent("feedback_open", payload || {}),
  trackFeedbackSubmit: (payload: FeedbackSubmitAnalyticsPayload) => trackEvent("feedback_submit", payload),
  trackRecommendationHelpful: (payload: RecommendationVoteAnalyticsPayload) => trackEvent("recommendation_helpful", payload),
  trackRecommendationNotHelpful: (payload: RecommendationVoteAnalyticsPayload) => trackEvent("recommendation_not_helpful", payload),
};
