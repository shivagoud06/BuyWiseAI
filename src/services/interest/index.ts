import { LAPTOPS } from "@/data/laptops";
import { Laptop } from "@/types";
import { calculateProductInterestScores } from "./scoring";
import { getStoredInterestEvents, interestTracker } from "./tracker";
import {
  InterestScoringOptions,
  InterestScoreResult,
  TopInterestedProduct,
} from "./types";

export * from "./types";
export * from "./scoring";
export * from "./tracker";

/**
 * Returns the user's top interested catalog products ranked by decaying interest score.
 * 
 * @param limit Optional maximum number of products to return (default 5)
 * @param options Optional calculation options (custom now timestamp, half life, custom catalog)
 */
export function getTopInterestedProducts(
  limit: number = 5,
  options: InterestScoringOptions & { catalog?: Laptop[] } = {}
): TopInterestedProduct[] {
  const events = getStoredInterestEvents();
  if (!events || events.length === 0) {
    return [];
  }

  const catalog = options.catalog || LAPTOPS;
  const scoredResults = calculateProductInterestScores(events, options);

  const topProducts: TopInterestedProduct[] = [];

  for (const item of scoredResults) {
    const laptop = catalog.find((l) => l.id === item.productId);
    if (laptop) {
      topProducts.push({
        laptop,
        score: item.score,
        rawScore: item.rawScore,
        lastInteractedAt: item.lastInteractedAt,
        interactionCount: item.interactionCount,
        breakdown: item.breakdown,
      });
    }

    if (topProducts.length >= limit) {
      break;
    }
  }

  return topProducts;
}

/**
 * Returns top interested product IDs only
 */
export function getTopInterestedProductIds(
  limit: number = 5,
  options: InterestScoringOptions = {}
): string[] {
  const events = getStoredInterestEvents();
  if (!events || events.length === 0) {
    return [];
  }

  const scoredResults = calculateProductInterestScores(events, options);
  return scoredResults.slice(0, limit).map((r) => r.productId);
}
