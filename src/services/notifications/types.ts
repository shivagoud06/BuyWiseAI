import { CurrencyCode, RetailerId } from "@/types";

export type NotificationTriggerType = "PRICE_DROP" | "BACK_IN_STOCK" | "BETTER_OFFER";

export type NotificationChannel = "in_app" | "browser_push" | "mock";

export type NotificationPermissionStatus = "default" | "granted" | "denied" | "unsupported";

export interface NotificationConsentState {
  permission: NotificationPermissionStatus;
  enabled: boolean;
  quietMode: boolean;
  priceDropAlerts: boolean;
  stockAlerts: boolean;
  betterOfferAlerts: boolean;
  consentTimestamp?: string;
  anonymousUserId: string;
}

export interface SmartNotification {
  id: string;
  triggerType: NotificationTriggerType;
  productId: string;
  productName: string;
  retailerId: RetailerId;
  retailerName: string;
  title: string;
  message: string;
  oldPrice?: number;
  newPrice?: number;
  priceDifference?: number;
  currency: CurrencyCode;
  targetUrl?: string;
  timestamp: string; // ISO 8601 string
  read: boolean;
  delivered: boolean;
  channel: NotificationChannel;
  dedupKey: string;
}

export interface NotificationTriggerEvaluationResult {
  shouldTrigger: boolean;
  triggerType?: NotificationTriggerType;
  reason?: string;
  notification?: SmartNotification;
  skippedReason?:
    | "low_interest"
    | "no_consent"
    | "quiet_mode"
    | "invalid_offer"
    | "mock_offer"
    | "no_price_change"
    | "duplicate"
    | "cooldown_active";
}

export interface NotificationHistoryEntry {
  notification: SmartNotification;
  deliveredAt: string;
}

export interface NotificationPreferencesUpdate {
  enabled?: boolean;
  quietMode?: boolean;
  priceDropAlerts?: boolean;
  stockAlerts?: boolean;
  betterOfferAlerts?: boolean;
}
