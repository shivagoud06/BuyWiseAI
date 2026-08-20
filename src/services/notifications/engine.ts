import { LAPTOPS } from "@/data/laptops";
import { Laptop, RetailerOffer } from "@/types";
import { validateRetailerOffer } from "@/services/retailers/validator";
import { calculateProductInterestScores } from "@/services/interest/scoring";
import { getStoredInterestEvents } from "@/services/interest/tracker";
import { getActiveNotificationAdapter } from "./adapter";
import {
  checkDuplicateOrCooldown,
  getNotificationConsent,
  isNotificationConsentGranted,
  recordDeliveredNotification,
} from "./consent";
import {
  NotificationTriggerEvaluationResult,
  NotificationTriggerType,
  SmartNotification,
} from "./types";

export const DEFAULT_HIGH_INTEREST_THRESHOLD = 3;
export const DEFAULT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export interface TriggerEvaluationContext {
  previousOffer?: RetailerOffer | null;
  currentOffer: RetailerOffer;
  otherOffers?: RetailerOffer[];
  now?: number | Date;
}

export interface TriggerEvaluationOptions {
  minInterestScore?: number;
  cooldownMs?: number;
  now?: number | Date;
  bypassConsent?: boolean;
  userInterestScore?: number; // override/explicit score for deterministic testing
}

/**
 * Returns catalog laptops detected as high-interest for the anonymous user
 */
export function getHighInterestProducts(
  minScore: number = DEFAULT_HIGH_INTEREST_THRESHOLD,
  catalog: Laptop[] = LAPTOPS
): (Laptop & { interestScore: number })[] {
  const events = getStoredInterestEvents();
  if (!events || events.length === 0) {
    return [];
  }

  const scores = calculateProductInterestScores(events);
  const highInterestList: (Laptop & { interestScore: number })[] = [];

  for (const item of scores) {
    if (item.score >= minScore) {
      const laptop = catalog.find((l) => l.id === item.productId);
      if (laptop) {
        highInterestList.push({
          ...laptop,
          interestScore: item.score,
        });
      }
    }
  }

  return highInterestList;
}

/**
 * Checks if a specific product is of high interest to the user
 */
export function isProductHighInterest(
  productId: string,
  minScore: number = DEFAULT_HIGH_INTEREST_THRESHOLD
): boolean {
  const events = getStoredInterestEvents();
  if (!events || events.length === 0) {
    return false;
  }

  const scores = calculateProductInterestScores(events);
  const match = scores.find((s) => s.productId === productId);
  return Boolean(match && match.score >= minScore);
}

/**
 * Validates a live retailer offer for notification safety.
 * Rejects mock sources, negative/zero prices, unsupported retailers, and invalid URLs.
 */
export function isValidLiveRetailerOffer(offer: unknown, expectedProduct?: Laptop): boolean {
  if (!offer || typeof offer !== "object") return false;
  const o = offer as Partial<RetailerOffer>;

  // Reject mock or fabricated data
  if (o.isMock || o.source === "mock") {
    return false;
  }

  const validation = validateRetailerOffer(offer, expectedProduct);
  if (!validation.isValid || !validation.offer) {
    return false;
  }

  const valid = validation.offer;
  if (typeof valid.price !== "number" || isNaN(valid.price) || valid.price <= 0) {
    return false;
  }

  return true;
}

/**
 * Core notification trigger evaluator
 * 
 * Evaluates whether a real validated retailer offer change qualifies for a Smart Notification.
 * Checks:
 * 1. High-interest score requirement
 * 2. Real validated retailer data (never compares against static catalog price)
 * 3. User consent & Quiet Mode
 * 4. Duplicate prevention
 * 5. Cooldown period
 */
export function evaluateNotificationTrigger(
  laptop: Laptop,
  context: TriggerEvaluationContext,
  options: TriggerEvaluationOptions = {}
): NotificationTriggerEvaluationResult {
  const minScore = options.minInterestScore ?? DEFAULT_HIGH_INTEREST_THRESHOLD;
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const nowMs =
    options.now instanceof Date
      ? options.now.getTime()
      : typeof options.now === "number"
      ? options.now
      : Date.now();

  // 1. High Interest Check
  const interestScore =
    options.userInterestScore !== undefined
      ? options.userInterestScore
      : (() => {
          const events = getStoredInterestEvents();
          const scores = calculateProductInterestScores(events);
          const match = scores.find((s) => s.productId === laptop.id);
          return match?.score ?? 0;
        })();

  if (interestScore < minScore) {
    return {
      shouldTrigger: false,
      skippedReason: "low_interest",
      reason: `Interest score ${interestScore} is below threshold ${minScore}`,
    };
  }

  // 2. Validate current retailer offer (reject fake/mock/invalid offers)
  const { currentOffer, previousOffer, otherOffers } = context;
  if (!isValidLiveRetailerOffer(currentOffer, laptop)) {
    return {
      shouldTrigger: false,
      skippedReason: currentOffer?.isMock || currentOffer?.source === "mock" ? "mock_offer" : "invalid_offer",
      reason: "Current retailer offer is invalid, mock, or malformed",
    };
  }

  // 3. Consent Check
  const consent = getNotificationConsent();
  if (!options.bypassConsent) {
    if (!isNotificationConsentGranted()) {
      return {
        shouldTrigger: false,
        skippedReason: "no_consent",
        reason: "User has not granted notification permission or notifications are disabled",
      };
    }

    if (consent.quietMode) {
      return {
        shouldTrigger: false,
        skippedReason: "quiet_mode",
        reason: "Quiet mode is active",
      };
    }
  }

  // 4. Evaluate Trigger Conditions
  let triggerType: NotificationTriggerType | null = null;
  let title = "";
  let message = "";
  let oldPrice: number | undefined;
  let newPrice: number = currentOffer.price;

  // Condition A: BACK_IN_STOCK (previous verified offer was out-of-stock, current offer is in-stock)
  if (
    consent.stockAlerts &&
    previousOffer &&
    previousOffer.availability === "out-of-stock" &&
    (currentOffer.availability === "in-stock" || currentOffer.availability === "limited-stock")
  ) {
    triggerType = "BACK_IN_STOCK";
    title = `Back in Stock: ${laptop.name}`;
    message = `${laptop.name} is now back in stock at ${currentOffer.retailerName} for ₹${currentOffer.price.toLocaleString("en-IN")}.`;
  }

  // Condition B: PRICE_DROP (current verified live price dropped below previous verified live price)
  // NEVER compare against laptop.price or laptop.originalPrice (static catalog)
  else if (
    consent.priceDropAlerts &&
    previousOffer &&
    isValidLiveRetailerOffer(previousOffer, laptop) &&
    typeof previousOffer.price === "number" &&
    previousOffer.price > 0 &&
    currentOffer.price < previousOffer.price
  ) {
    triggerType = "PRICE_DROP";
    oldPrice = previousOffer.price;
    const diff = oldPrice - currentOffer.price;
    title = `Price Drop: ${laptop.name}`;
    message = `Price dropped by ₹${diff.toLocaleString("en-IN")} to ₹${currentOffer.price.toLocaleString("en-IN")} at ${currentOffer.retailerName}.`;
  }

  // Condition C: BETTER_OFFER (new verified offer is cheaper than other currently available valid live offers)
  else if (
    consent.betterOfferAlerts &&
    otherOffers &&
    Array.isArray(otherOffers) &&
    otherOffers.length > 0
  ) {
    const validOtherOffers = otherOffers.filter(
      (o) =>
        isValidLiveRetailerOffer(o, laptop) &&
        o.availability !== "out-of-stock" &&
        o.retailerId !== currentOffer.retailerId
    );

    if (validOtherOffers.length > 0) {
      const lowestOtherPrice = Math.min(...validOtherOffers.map((o) => o.price));
      if (currentOffer.price < lowestOtherPrice) {
        triggerType = "BETTER_OFFER";
        oldPrice = lowestOtherPrice;
        const diff = lowestOtherPrice - currentOffer.price;
        title = `Better Offer Found: ${laptop.name}`;
        message = `${currentOffer.retailerName} now offers ${laptop.name} for ₹${currentOffer.price.toLocaleString("en-IN")} (₹${diff.toLocaleString("en-IN")} lower than other stores).`;
      }
    }
  }

  if (!triggerType) {
    return {
      shouldTrigger: false,
      skippedReason: "no_price_change",
      reason: "No qualifying price drop, stock change, or better offer detected",
    };
  }

  // 5. Deduplication and Cooldown Check
  const dedupKey = `${triggerType}_${laptop.id}_${currentOffer.retailerId}_${currentOffer.price}_${currentOffer.availability}`;
  const { isDuplicate, isCooldownActive } = checkDuplicateOrCooldown(
    laptop.id,
    triggerType,
    dedupKey,
    cooldownMs,
    nowMs
  );

  if (isDuplicate) {
    return {
      shouldTrigger: false,
      triggerType,
      skippedReason: "duplicate",
      reason: "An identical notification has already been delivered",
    };
  }

  if (isCooldownActive) {
    return {
      shouldTrigger: false,
      triggerType,
      skippedReason: "cooldown_active",
      reason: `Notification for ${laptop.name} (${triggerType}) is currently in cooldown`,
    };
  }

  const notification: SmartNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    triggerType,
    productId: laptop.id,
    productName: laptop.name,
    retailerId: currentOffer.retailerId,
    retailerName: currentOffer.retailerName,
    title,
    message,
    oldPrice,
    newPrice,
    priceDifference: oldPrice ? oldPrice - newPrice : undefined,
    currency: currentOffer.currency,
    targetUrl: currentOffer.productUrl || currentOffer.affiliateUrl || undefined,
    timestamp: new Date(nowMs).toISOString(),
    read: false,
    delivered: false,
    channel: "mock",
    dedupKey,
  };

  return {
    shouldTrigger: true,
    triggerType,
    reason: "Valid trigger conditions met",
    notification,
  };
}

/**
 * Evaluates trigger and dispatches notification through the active adapter if valid
 */
export async function evaluateAndDispatchNotification(
  laptop: Laptop,
  context: TriggerEvaluationContext,
  options: TriggerEvaluationOptions = {}
): Promise<NotificationTriggerEvaluationResult> {
  const result = evaluateNotificationTrigger(laptop, context, options);

  if (result.shouldTrigger && result.notification) {
    const adapter = getActiveNotificationAdapter();
    const sent = await adapter.sendNotification(result.notification);

    if (sent) {
      result.notification.delivered = true;
      recordDeliveredNotification(result.notification);
    }
  }

  return result;
}
