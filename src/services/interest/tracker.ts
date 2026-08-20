import {
  InterestEvent,
  InterestEventInput,
  PrivacyPreferences,
} from "./types";

const STORAGE_KEY_EVENTS = "buywise_interest_events_v1";
const STORAGE_KEY_OPT_OUT = "buywise_tracking_opt_out_v1";
const STORAGE_KEY_ANON_ID = "buywise_anon_tracker_id_v1";
const MAX_STORED_EVENTS = 200;

const FORBIDDEN_SENSITIVE_WORDS = [
  "password",
  "secret",
  "apikey",
  "token",
  "auth",
  "bearer",
  "cardnumber",
  "cvv",
  "creditcard",
  "email",
  "address",
  "location",
  "coordinates",
  "ssn",
  "phone",
];

// In-memory store for SSR, Node, or when localStorage is unavailable
let inMemoryEvents: InterestEvent[] = [];
let inMemoryTrackingEnabled = true;
let inMemoryAnonId: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Generates an anonymous, non-identifying session ID
 */
export function generateAnonymousId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `bw_anon_${time}_${rand}`;
}

/**
 * Gets or creates the anonymous ID for the current browser session
 */
export function getAnonymousId(): string {
  if (isBrowser()) {
    try {
      let storedId = window.localStorage.getItem(STORAGE_KEY_ANON_ID);
      if (!storedId) {
        storedId = generateAnonymousId();
        window.localStorage.setItem(STORAGE_KEY_ANON_ID, storedId);
      }
      return storedId;
    } catch {
      // LocalStorage error fallback
    }
  }

  if (!inMemoryAnonId) {
    inMemoryAnonId = generateAnonymousId();
  }
  return inMemoryAnonId;
}

/**
 * Checks whether user tracking is enabled (not opted out)
 */
export function isTrackingEnabled(): boolean {
  if (isBrowser()) {
    try {
      const optOut = window.localStorage.getItem(STORAGE_KEY_OPT_OUT);
      return optOut !== "true";
    } catch {
      return true;
    }
  }
  return inMemoryTrackingEnabled;
}

/**
 * Sets tracking preference
 */
export function setTrackingEnabled(enabled: boolean): void {
  if (isBrowser()) {
    try {
      if (enabled) {
        window.localStorage.removeItem(STORAGE_KEY_OPT_OUT);
      } else {
        window.localStorage.setItem(STORAGE_KEY_OPT_OUT, "true");
        clearInterestData();
      }
    } catch {
      // LocalStorage error fallback
    }
  }
  inMemoryTrackingEnabled = enabled;
  if (!enabled) {
    inMemoryEvents = [];
  }
}

/**
 * Privacy control to opt out and clear all tracking data
 */
export function optOutTracking(): void {
  setTrackingEnabled(false);
}

/**
 * Privacy control to opt in
 */
export function optInTracking(): void {
  setTrackingEnabled(true);
}

/**
 * Clears all stored interest events
 */
export function clearInterestData(): void {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_EVENTS);
    } catch {
      // LocalStorage error fallback
    }
  }
  inMemoryEvents = [];
}

/**
 * Retrieves all stored interest events
 */
export function getStoredInterestEvents(): InterestEvent[] {
  if (!isTrackingEnabled()) {
    return [];
  }

  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_EVENTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // JSON parse or storage read failed
    }
  }

  return [...inMemoryEvents];
}

/**
 * Saves events to storage (with bounded limit)
 */
function saveEvents(events: InterestEvent[]): void {
  // Prune older events if exceeding maximum size
  const boundedEvents = events.slice(-MAX_STORED_EVENTS);
  inMemoryEvents = boundedEvents;

  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(boundedEvents));
    } catch {
      // Storage write error fallback
    }
  }
}

/**
 * Sanitizes input string to remove any HTML tags and excessive whitespace
 */
function sanitizeString(str?: string | null): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Checks whether an object or string contains sensitive keywords
 */
export function containsSensitiveData(data: Record<string, any> | string): boolean {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  const lower = str.toLowerCase();
  return FORBIDDEN_SENSITIVE_WORDS.some((word) => lower.includes(word));
}

/**
 * Normalizes search queries for safe interest indexing
 */
export function normalizeSearchQuery(query?: string | null): string {
  if (!query || typeof query !== "string") return "";
  return sanitizeString(query)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

/**
 * Generates an event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Main recording function for all interest events
 */
export function recordInterestEvent(input: InterestEventInput): boolean {
  if (!isTrackingEnabled()) {
    return false;
  }

  const timestamp = input.timestamp || new Date().toISOString();
  const anonymousSessionId = getAnonymousId();
  const id = generateEventId();

  let event: InterestEvent | null = null;

  switch (input.type) {
    case "product_view": {
      if (!input.productId || typeof input.productId !== "string") return false;
      const cleanId = sanitizeString(input.productId);
      if (!cleanId) return false;

      event = {
        id,
        type: "product_view",
        productId: cleanId,
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "search": {
      const norm = normalizeSearchQuery(input.query);
      if (!norm) return false;

      const cleanMatches = Array.isArray(input.matchedProductIds)
        ? input.matchedProductIds.map(sanitizeString).filter(Boolean)
        : undefined;

      event = {
        id,
        type: "search",
        query: sanitizeString(input.query).slice(0, 100),
        normalizedQuery: norm,
        matchedProductIds: cleanMatches,
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "compare": {
      if (!Array.isArray(input.productIds) || input.productIds.length === 0) return false;
      const cleanIds = input.productIds.map(sanitizeString).filter(Boolean);
      if (cleanIds.length === 0) return false;

      event = {
        id,
        type: "compare",
        productIds: cleanIds,
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "advisor_use": {
      const cleanCategory = input.category ? sanitizeString(input.category).slice(0, 50) : undefined;
      const cleanUseCase = input.useCase ? sanitizeString(input.useCase).slice(0, 50) : undefined;
      const cleanBudget = input.budget ? sanitizeString(input.budget).slice(0, 50) : undefined;
      const cleanMatches = Array.isArray(input.recommendedProductIds)
        ? input.recommendedProductIds.map(sanitizeString).filter(Boolean)
        : undefined;

      event = {
        id,
        type: "advisor_use",
        category: cleanCategory,
        useCase: cleanUseCase,
        budget: cleanBudget,
        recommendedProductIds: cleanMatches,
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "advisor_recommendation_click": {
      if (!input.productId) return false;
      const cleanId = sanitizeString(input.productId);
      if (!cleanId) return false;

      event = {
        id,
        type: "advisor_recommendation_click",
        productId: cleanId,
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "retailer_click": {
      if (!input.productId || !input.retailerId) return false;
      const cleanProduct = sanitizeString(input.productId);
      const cleanRetailer = sanitizeString(input.retailerId);
      if (!cleanProduct || !cleanRetailer) return false;

      event = {
        id,
        type: "retailer_click",
        productId: cleanProduct,
        retailerId: cleanRetailer,
        clickType: input.clickType === "affiliate" ? "affiliate" : "product",
        timestamp,
        anonymousSessionId,
      };
      break;
    }

    case "feedback_submit": {
      const cleanProduct = input.productId ? sanitizeString(input.productId) : undefined;
      const cleanCat = input.category ? sanitizeString(input.category).slice(0, 50) : undefined;
      const rating = typeof input.rating === "number" && input.rating >= 1 && input.rating <= 5 ? input.rating : undefined;

      event = {
        id,
        type: "feedback_submit",
        productId: cleanProduct,
        rating,
        category: cleanCat,
        timestamp,
        anonymousSessionId,
      };
      break;
    }
  }

  if (!event) {
    return false;
  }

  const existing = getStoredInterestEvents();
  saveEvents([...existing, event]);
  return true;
}

// Convenient helper methods for direct invocation
export const interestTracker = {
  recordProductView: (productId: string, timestamp?: string) =>
    recordInterestEvent({ type: "product_view", productId, timestamp }),

  recordSearch: (query: string, matchedProductIds?: string[], timestamp?: string) =>
    recordInterestEvent({ type: "search", query, matchedProductIds, timestamp }),

  recordCompare: (productIds: string[], timestamp?: string) =>
    recordInterestEvent({ type: "compare", productIds, timestamp }),

  recordAdvisorUse: (params: { category?: string; useCase?: string; budget?: string; recommendedProductIds?: string[]; timestamp?: string }) =>
    recordInterestEvent({ type: "advisor_use", ...params }),

  recordAdvisorRecommendationClick: (productId: string, timestamp?: string) =>
    recordInterestEvent({ type: "advisor_recommendation_click", productId, timestamp }),

  recordRetailerClick: (retailerId: string, productId: string, clickType?: "affiliate" | "product", timestamp?: string) =>
    recordInterestEvent({ type: "retailer_click", retailerId, productId, clickType, timestamp }),

  recordFeedback: (params: { productId?: string; rating?: number; category?: string; timestamp?: string }) =>
    recordInterestEvent({ type: "feedback_submit", ...params }),

  getEvents: getStoredInterestEvents,
  clear: clearInterestData,
  isTrackingEnabled,
  setTrackingEnabled,
  optOut: optOutTracking,
  optIn: optInTracking,
  getAnonymousId,

  getPrivacyPreferences: (): PrivacyPreferences => ({
    trackingEnabled: isTrackingEnabled(),
    anonymousId: getAnonymousId(),
    totalEventsStored: getStoredInterestEvents().length,
  }),
};
