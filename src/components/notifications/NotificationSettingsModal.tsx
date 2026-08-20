"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  ShieldCheck,
  Moon,
  Trash2,
  TrendingDown,
  PackageCheck,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getNotificationConsent,
  updateNotificationPreferences,
  grantNotificationConsent,
  revokeNotificationConsent,
  clearNotificationConsent,
  getNotificationHistory,
  clearNotificationHistory,
  requestBrowserNotificationPermission,
} from "@/services/notifications/consent";
import { NotificationConsentState, SmartNotification } from "@/services/notifications/types";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONSENT: NotificationConsentState = {
  permission: "default",
  enabled: false,
  quietMode: false,
  priceDropAlerts: true,
  stockAlerts: true,
  betterOfferAlerts: true,
  anonymousUserId: "anon_default",
};

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [consent, setConsent] = useState<NotificationConsentState>(DEFAULT_CONSENT);
  const [history, setHistory] = useState<SmartNotification[]>([]);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConsent(getNotificationConsent());
      setHistory(getNotificationHistory());
      setClearedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    if (consent.enabled) {
      const updated = revokeNotificationConsent();
      setConsent(updated);
    } else {
      const updated = grantNotificationConsent(consent.quietMode);
      setConsent(updated);
    }
  };

  const handleToggleQuiet = () => {
    const updated = updateNotificationPreferences({ quietMode: !consent.quietMode });
    setConsent(updated);
  };

  const handleTogglePriceDrops = () => {
    const updated = updateNotificationPreferences({ priceDropAlerts: !consent.priceDropAlerts });
    setConsent(updated);
  };

  const handleToggleStock = () => {
    const updated = updateNotificationPreferences({ stockAlerts: !consent.stockAlerts });
    setConsent(updated);
  };

  const handleToggleBetterOffer = () => {
    const updated = updateNotificationPreferences({ betterOfferAlerts: !consent.betterOfferAlerts });
    setConsent(updated);
  };

  const handleRequestBrowserPermission = async () => {
    await requestBrowserNotificationPermission();
    setConsent(getNotificationConsent());
  };

  const handleClearAll = () => {
    clearNotificationConsent();
    clearNotificationHistory();
    setConsent(getNotificationConsent());
    setHistory([]);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const getTriggerIcon = (type: SmartNotification["triggerType"]) => {
    switch (type) {
      case "PRICE_DROP":
        return <TrendingDown className="h-4 w-4 text-emerald-400" />;
      case "BACK_IN_STOCK":
        return <PackageCheck className="h-4 w-4 text-brand-400" />;
      case "BETTER_OFFER":
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      default:
        return <Bell className="h-4 w-4 text-brand-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/80 bg-surface-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 id="notification-settings-title" className="text-base sm:text-lg font-bold text-white">
                Notification Settings
              </h2>
              <p className="text-xs text-surface-400">
                Price drops and stock alerts for laptops you browse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Privacy Reassurance Badge */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-900/90 border border-surface-800 text-xs text-surface-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">100% Anonymous & Privacy-Safe:</span> Alerts are powered entirely by your local browsing interest. No account creation, login, or personal data tracking required.
            </div>
          </div>

          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/60 border border-surface-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Enable Smart Alerts</span>
                {consent.enabled ? (
                  <Badge variant="verdict-buy" size="sm" className="text-[10px] py-0 px-1.5 font-mono">
                    ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5 font-mono">
                    DISABLED
                  </Badge>
                )}
              </div>
              <p className="text-xs text-surface-400">
                Receive notifications when verified prices drop on your favorite laptops
              </p>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consent.enabled ? "bg-brand-500" : "bg-surface-700"
              }`}
              role="switch"
              aria-checked={consent.enabled}
              aria-label="Toggle smart alerts"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consent.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Quiet Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/40 border border-surface-800/80">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-surface-800 text-surface-300 mt-0.5">
                <Moon className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Quiet Mode</div>
                <p className="text-xs text-surface-400">
                  Mute all popups and browser alerts while keeping history updated
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleQuiet}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consent.quietMode ? "bg-cyan-500" : "bg-surface-700"
              }`}
              role="switch"
              aria-checked={consent.quietMode}
              aria-label="Toggle quiet mode"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consent.quietMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Alert Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 font-mono">
              Alert Types
            </h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-900/30 border border-surface-800/60 cursor-pointer hover:bg-surface-900/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-surface-200">Price Drops (Verified Retailers)</span>
                </div>
                <input
                  type="checkbox"
                  checked={consent.priceDropAlerts}
                  onChange={handleTogglePriceDrops}
                  className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-brand-400 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-900/30 border border-surface-800/60 cursor-pointer hover:bg-surface-900/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="h-4 w-4 text-brand-400" />
                  <span className="text-xs sm:text-sm text-surface-200">Back in Stock Alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={consent.stockAlerts}
                  onChange={handleToggleStock}
                  className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-brand-400 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-900/30 border border-surface-800/60 cursor-pointer hover:bg-surface-900/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-surface-200">Better Store Deals</span>
                </div>
                <input
                  type="checkbox"
                  checked={consent.betterOfferAlerts}
                  onChange={handleToggleBetterOffer}
                  className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-brand-400 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Browser Web Push Permission Request */}
          {consent.permission !== "granted" && (
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">Browser Push Notifications</div>
                <p className="text-xs text-surface-400">
                  Allow your browser to display alerts even when BuyWise is in the background
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestBrowserPermission}
                className="shrink-0 text-xs"
              >
                Enable Web Push
              </Button>
            </div>
          )}

          {/* Notification History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 font-mono">
                Recent Alerts ({history.length})
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    clearNotificationHistory();
                    setHistory([]);
                  }}
                  className="text-[11px] text-surface-400 hover:text-rose-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl bg-surface-900/30 border border-surface-800/50 text-surface-400 text-xs">
                No alerts received yet. As you browse laptops and verified prices drop, alerts will appear here.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-surface-900/50 border border-surface-800 flex items-start gap-3 text-xs"
                  >
                    <div className="p-1 rounded bg-surface-800 mt-0.5">
                      {getTriggerIcon(item.triggerType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white truncate">{item.title}</span>
                        <span className="text-[10px] text-surface-500 shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-surface-300 text-[11px] mt-0.5 line-clamp-2">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {clearedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Notification consent and all history have been cleared.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-800/80 bg-surface-900/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Permissions</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
