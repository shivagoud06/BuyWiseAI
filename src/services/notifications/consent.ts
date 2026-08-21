import { getAnonymousId } from "@/services/interest/tracker";
import {
  NotificationConsentState,
  NotificationPermissionStatus,
  NotificationPreferencesUpdate,
  NotificationTriggerType,
  SmartNotification,
} from "./types";

const STORAGE_KEY_CONSENT = "buywise_notification_consent_v1";
const STORAGE_KEY_HISTORY = "buywise_notification_history_v1";
const MAX_HISTORY_ITEMS = 50;

// Default in-memory state for SSR, Node, or testing
let inMemoryConsent: NotificationConsentState = {
  permission: "default",
  enabled: false,
  quietMode: false,
  priceDropAlerts: true,
  stockAlerts: true,
  betterOfferAlerts: true,
  anonymousUserId: "anon_default",
};

let inMemoryHistory: SmartNotification[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Gets current notification consent state
 */
export function getNotificationConsent(): NotificationConsentState {
  const anonId = getAnonymousId();

  if (isBrowser()) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_CONSENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          anonymousUserId: anonId,
        };
      }
    } catch {
      // Storage fallback
    }
  }

  return {
    ...inMemoryConsent,
    anonymousUserId: anonId,
  };
}

/**
 * Saves notification consent state
 */
function saveConsent(state: NotificationConsentState): void {
  inMemoryConsent = state;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY_CONSENT, JSON.stringify(state));
    } catch {
      // Storage fallback
    }
  }
}

/**
 * Updates user notification preferences
 */
export function updateNotificationPreferences(
  updates: NotificationPreferencesUpdate
): NotificationConsentState {
  const current = getNotificationConsent();
  const updated: NotificationConsentState = {
    ...current,
    ...updates,
    consentTimestamp: current.consentTimestamp || new Date().toISOString(),
  };

  saveConsent(updated);
  return updated;
}

/**
 * Checks whether user has explicitly granted consent and notifications are enabled
 */
export function isNotificationConsentGranted(): boolean {
  const consent = getNotificationConsent();
  return consent.permission === "granted" && consent.enabled;
}

/**
 * Requests browser notification permission and saves user consent
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isBrowser() || !("Notification" in window)) {
    const current = getNotificationConsent();
    const updated: NotificationConsentState = {
      ...current,
      permission: "unsupported",
      enabled: false,
    };
    saveConsent(updated);
    return "unsupported";
  }

  try {
    const permission = await window.Notification.requestPermission();
    const status: NotificationPermissionStatus =
      permission === "granted" ? "granted" : permission === "denied" ? "denied" : "default";

    const current = getNotificationConsent();
    const updated: NotificationConsentState = {
      ...current,
      permission: status,
      enabled: status === "granted",
      consentTimestamp: new Date().toISOString(),
    };

    saveConsent(updated);
    return status;
  } catch {
    return "default";
  }
}

/**
 * Grants notification consent manually (e.g. In-App notifications or mock tests)
 */
export function grantNotificationConsent(quietMode: boolean = false): NotificationConsentState {
  const current = getNotificationConsent();
  const updated: NotificationConsentState = {
    ...current,
    permission: "granted",
    enabled: true,
    quietMode,
    consentTimestamp: new Date().toISOString(),
  };
  saveConsent(updated);
  return updated;
}

/**
 * Denies or revokes notification consent
 */
export function revokeNotificationConsent(): NotificationConsentState {
  const current = getNotificationConsent();
  const updated: NotificationConsentState = {
    ...current,
    permission: "denied",
    enabled: false,
    consentTimestamp: new Date().toISOString(),
  };
  saveConsent(updated);
  return updated;
}

/**
 * Clears all notification consent and history
 */
export function clearNotificationConsent(): void {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_CONSENT);
      window.localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // Storage fallback
    }
  }

  inMemoryConsent = {
    permission: "default",
    enabled: false,
    quietMode: false,
    priceDropAlerts: true,
    stockAlerts: true,
    betterOfferAlerts: true,
    anonymousUserId: getAnonymousId(),
  };
  inMemoryHistory = [];
}

/**
 * Gets notification history
 */
export function getNotificationHistory(): SmartNotification[] {
  if (isBrowser()) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Storage fallback
    }
  }
  return [...inMemoryHistory];
}

/**
 * Clears notification history
 */
export function clearNotificationHistory(): void {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // Storage fallback
    }
  }
  inMemoryHistory = [];
}

/**
 * Records a delivered notification into history
 */
export function recordDeliveredNotification(notification: SmartNotification): void {
  const history = getNotificationHistory();
  const updated = [notification, ...history.filter((n) => n.id !== notification.id)].slice(
    0,
    MAX_HISTORY_ITEMS
  );

  inMemoryHistory = updated;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }
}

/**
 * Checks whether a notification is a duplicate or is within the cooldown period
 */
export function checkDuplicateOrCooldown(
  productId: string,
  triggerType: NotificationTriggerType,
  dedupKey: string,
  cooldownMs: number = 60 * 60 * 1000, // 1 hour default
  nowMs: number = Date.now()
): { isDuplicate: boolean; isCooldownActive: boolean } {
  const history = getNotificationHistory();

  // 1. Exact Duplicate check
  const isDuplicate = history.some((n) => n.dedupKey === dedupKey);

  // 2. Cooldown check for the same product and trigger type
  const recentSameTrigger = history.find(
    (n) => n.productId === productId && n.triggerType === triggerType
  );

  let isCooldownActive = false;
  if (recentSameTrigger) {
    const elapsed = nowMs - new Date(recentSameTrigger.timestamp).getTime();
    if (elapsed < cooldownMs) {
      isCooldownActive = true;
    }
  }

  return { isDuplicate, isCooldownActive };
}

/**
 * Marks all notifications in history as read
 */
export function markAllNotificationsRead(): SmartNotification[] {
  const history = getNotificationHistory();
  const updated = history.map((n) => ({ ...n, read: true }));
  inMemoryHistory = updated;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }
  return updated;
}

/**
 * Marks a specific notification as read
 */
export function markNotificationRead(id: string): SmartNotification[] {
  const history = getNotificationHistory();
  const updated = history.map((n) => (n.id === id ? { ...n, read: true } : n));
  inMemoryHistory = updated;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }
  return updated;
}

/**
 * Gets count of unread notifications
 */
export function getUnreadNotificationCount(): number {
  const history = getNotificationHistory();
  return history.filter((n) => !n.read).length;
}
