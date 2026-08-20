import {
  InterestEvent,
  InterestScoreResult,
  InterestScoringOptions,
  InterestScoringWeights,
  ScoreBreakdownDetails,
} from "./types";

export const DEFAULT_INTEREST_WEIGHTS: InterestScoringWeights = {
  productView: 1,
  repeatProductView: 2,
  searchMatch: 2,
  compare: 3,
  advisorMatch: 3,
  advisorRecommendationClick: 3,
  retailerClick: 5,
  feedback: 2,
};

// Default decay half-life: 7 days in milliseconds
export const DEFAULT_HALF_LIFE_DAYS = 7;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const DEFAULT_HALF_LIFE_MS = DEFAULT_HALF_LIFE_DAYS * MS_PER_DAY;

/**
 * Calculates exponential time decay factor using half-life.
 * 
 * decayFactor = 0.5 ^ (elapsedTime / halfLife)
 * 
 * - An event happening now has decayFactor = 1.0 (100% weight).
 * - An event from 1 half-life ago has decayFactor = 0.5 (50% weight).
 * - An event from 2 half-lives ago has decayFactor = 0.25 (25% weight).
 */
export function calculateTimeDecayFactor(
  eventTimestampMs: number,
  nowMs: number = Date.now(),
  halfLifeMs: number = DEFAULT_HALF_LIFE_MS
): number {
  if (halfLifeMs <= 0) return 1.0;
  const elapsedMs = Math.max(0, nowMs - eventTimestampMs);
  const halfLives = elapsedMs / halfLifeMs;
  return Math.pow(0.5, halfLives);
}

/**
 * Computes interest scores per product from an array of interest events.
 */
export function calculateProductInterestScores(
  events: InterestEvent[],
  options: InterestScoringOptions = {}
): InterestScoreResult[] {
  const weights: InterestScoringWeights = {
    ...DEFAULT_INTEREST_WEIGHTS,
    ...(options.weights || {}),
  };

  const nowMs =
    options.now instanceof Date
      ? options.now.getTime()
      : typeof options.now === "number"
      ? options.now
      : Date.now();

  const halfLifeMs =
    options.halfLifeMs !== undefined
      ? options.halfLifeMs
      : (options.halfLifeDays || DEFAULT_HALF_LIFE_DAYS) * MS_PER_DAY;

  // Track product view counts to determine initial vs repeated views
  const productViewCounts: Record<string, number> = {};

  // Sort events chronologically to properly attribute repeat views
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  interface ProductAcc {
    rawScore: number;
    decayedScore: number;
    interactionCount: number;
    lastInteractedMs: number;
    lastInteractedAt: string;
    breakdown: ScoreBreakdownDetails;
  }

  const productMap: Record<string, ProductAcc> = {};

  const getOrInitProduct = (productId: string, timestamp: string): ProductAcc => {
    if (!productMap[productId]) {
      productMap[productId] = {
        rawScore: 0,
        decayedScore: 0,
        interactionCount: 0,
        lastInteractedMs: new Date(timestamp).getTime(),
        lastInteractedAt: timestamp,
        breakdown: {
          productViews: 0,
          searchMatches: 0,
          compares: 0,
          advisorInteractions: 0,
          retailerClicks: 0,
          feedback: 0,
        },
      };
    }
    return productMap[productId];
  };

  const applyPoints = (
    productId: string,
    eventTimeIso: string,
    basePoints: number,
    categoryKey: keyof ScoreBreakdownDetails
  ) => {
    if (!productId || typeof productId !== "string" || productId.trim().length === 0) return;
    const cleanId = productId.trim();
    const eventTimeMs = new Date(eventTimeIso).getTime();
    const decay = calculateTimeDecayFactor(eventTimeMs, nowMs, halfLifeMs);

    const acc = getOrInitProduct(cleanId, eventTimeIso);
    acc.rawScore += basePoints;
    acc.decayedScore += basePoints * decay;
    acc.interactionCount += 1;
    acc.breakdown[categoryKey] += basePoints;

    if (eventTimeMs > acc.lastInteractedMs) {
      acc.lastInteractedMs = eventTimeMs;
      acc.lastInteractedAt = eventTimeIso;
    }
  };

  for (const event of sortedEvents) {
    const eventTime = event.timestamp || new Date().toISOString();

    switch (event.type) {
      case "product_view": {
        const pId = event.productId;
        const previousViews = productViewCounts[pId] || 0;
        productViewCounts[pId] = previousViews + 1;

        // First view gives +1, repeat views give +2
        const points = previousViews === 0 ? weights.productView : weights.repeatProductView;
        applyPoints(pId, eventTime, points, "productViews");
        break;
      }

      case "search": {
        if (Array.isArray(event.matchedProductIds)) {
          for (const pId of event.matchedProductIds) {
            applyPoints(pId, eventTime, weights.searchMatch, "searchMatches");
          }
        }
        break;
      }

      case "compare": {
        if (Array.isArray(event.productIds)) {
          for (const pId of event.productIds) {
            applyPoints(pId, eventTime, weights.compare, "compares");
          }
        }
        break;
      }

      case "advisor_use": {
        if (Array.isArray(event.recommendedProductIds)) {
          for (const pId of event.recommendedProductIds) {
            applyPoints(pId, eventTime, weights.advisorMatch, "advisorInteractions");
          }
        }
        break;
      }

      case "advisor_recommendation_click": {
        if (event.productId) {
          applyPoints(event.productId, eventTime, weights.advisorRecommendationClick, "advisorInteractions");
        }
        break;
      }

      case "retailer_click": {
        if (event.productId) {
          applyPoints(event.productId, eventTime, weights.retailerClick, "retailerClicks");
        }
        break;
      }

      case "feedback_submit": {
        if (event.productId) {
          applyPoints(event.productId, eventTime, weights.feedback, "feedback");
        }
        break;
      }
    }
  }

  const results: InterestScoreResult[] = Object.entries(productMap).map(
    ([productId, acc]) => ({
      productId,
      score: Math.round(acc.decayedScore * 100) / 100,
      rawScore: Math.round(acc.rawScore * 100) / 100,
      interactionCount: acc.interactionCount,
      lastInteractedAt: acc.lastInteractedAt,
      breakdown: acc.breakdown,
    })
  );

  // Sort descending by score, and break ties by most recent interaction
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.lastInteractedAt).getTime() - new Date(a.lastInteractedAt).getTime();
  });

  const minScore = options.minScore || 0;
  return results.filter((r) => r.score >= minScore);
}
