import {
  evaluateAndDispatchNotification,
  evaluateNotificationTrigger,
  getHighInterestProducts,
  isProductHighInterest,
  DEFAULT_HIGH_INTEREST_THRESHOLD,
  DEFAULT_COOLDOWN_MS,
} from "./engine";
import {
  getNotificationConsent,
  updateNotificationPreferences,
  requestBrowserNotificationPermission,
  grantNotificationConsent,
  revokeNotificationConsent,
  clearNotificationConsent,
  isNotificationConsentGranted,
  getNotificationHistory,
  clearNotificationHistory,
} from "./consent";
import {
  getActiveNotificationAdapter,
  setActiveNotificationAdapter,
  MockNotificationAdapter,
  BrowserNotificationAdapter,
} from "./adapter";

export * from "./types";
export * from "./adapter";
export * from "./consent";
export * from "./engine";

/**
 * Main Notification Service Abstraction
 */
export const notificationService = {
  // Consent & Settings
  getConsent: getNotificationConsent,
  updatePreferences: updateNotificationPreferences,
  requestPermission: requestBrowserNotificationPermission,
  grantConsent: grantNotificationConsent,
  revokeConsent: revokeNotificationConsent,
  clearConsent: clearNotificationConsent,
  isConsentGranted: isNotificationConsentGranted,

  // History & In-App Alerts
  getHistory: getNotificationHistory,
  clearHistory: clearNotificationHistory,

  // High Interest
  getHighInterestProducts,
  isHighInterest: isProductHighInterest,

  // Trigger Evaluator
  evaluateTrigger: evaluateNotificationTrigger,
  evaluateAndDispatch: evaluateAndDispatchNotification,

  // Adapters
  getAdapter: getActiveNotificationAdapter,
  setAdapter: setActiveNotificationAdapter,
  MockAdapter: MockNotificationAdapter,
  BrowserAdapter: BrowserNotificationAdapter,

  // Constants
  HIGH_INTEREST_THRESHOLD: DEFAULT_HIGH_INTEREST_THRESHOLD,
  DEFAULT_COOLDOWN_MS,
};
