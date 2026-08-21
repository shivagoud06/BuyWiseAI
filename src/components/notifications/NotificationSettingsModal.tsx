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
  Clock,
} from "lucide-react";
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

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white shadow-modal-soft p-6 sm:p-8 space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
          aria-label="Close notification settings"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-1.5 text-[#0EA5A4] text-xs font-bold uppercase tracking-wider">
            <Bell className="h-4 w-4" />
            <span>BuyWise AI Smart Alerts</span>
          </div>
          <h2 id="notification-modal-title" className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-sans">
            Notification Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Manage browser alerts for verified price drops and stock changes on laptops you track.
          </p>
        </div>

        {/* Main Enable/Disable Toggle Card */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${consent.enabled ? "bg-[#E6FFFE] border-[#99F6F3] text-[#0EA5A4]" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
              {consent.enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-[#111827] block">
                BuyWise Smart Alerts
              </span>
              <span className="text-xs text-[#64748B]">
                {consent.enabled ? "Active — tracking price drops & stock" : "Disabled — no alerts will be sent"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] focus:ring-offset-2 ${
              consent.enabled ? "bg-[#0EA5A4]" : "bg-slate-300"
            }`}
            role="switch"
            aria-checked={consent.enabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                consent.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Browser Permission Prompt if default */}
        {consent.permission === "default" && (
          <div className="p-3.5 rounded-xl border border-[#99F6F3] bg-[#E6FFFE] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#111827]">
              <Sparkles className="h-4 w-4 text-[#0EA5A4] shrink-0" />
              <span>Browser permission is required for push notifications.</span>
            </div>
            <button
              type="button"
              onClick={handleRequestBrowserPermission}
              className="text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] px-3 py-1.5 rounded-lg shrink-0 shadow-xs"
            >
              Allow in Browser
            </button>
          </div>
        )}

        {/* Alert Triggers Preferences */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            Alert Categories
          </h3>

          <div className="space-y-2 text-xs">
            {/* Price Drop */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2.5">
                <TrendingDown className="h-4 w-4 text-[#16A34A]" />
                <div>
                  <span className="font-semibold text-[#111827] block">Price Drops</span>
                  <span className="text-[#64748B]">When a high-interest laptop price drops</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consent.priceDropAlerts}
                onChange={handleTogglePriceDrops}
                disabled={!consent.enabled}
                className="rounded border-[#CBD5E1] text-[#0EA5A4] focus:ring-[#0EA5A4] disabled:opacity-50"
              />
            </div>

            {/* Back in Stock */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="h-4 w-4 text-[#2563EB]" />
                <div>
                  <span className="font-semibold text-[#111827] block">Back in Stock</span>
                  <span className="text-[#64748B]">When an unavailable laptop returns in stock</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consent.stockAlerts}
                onChange={handleToggleStock}
                disabled={!consent.enabled}
                className="rounded border-[#CBD5E1] text-[#0EA5A4] focus:ring-[#0EA5A4] disabled:opacity-50"
              />
            </div>

            {/* Better Store Deal */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#0EA5A4]" />
                <div>
                  <span className="font-semibold text-[#111827] block">Better Retailer Offers</span>
                  <span className="text-[#64748B]">When another verified store offers a lower price</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consent.betterOfferAlerts}
                onChange={handleToggleBetterOffer}
                disabled={!consent.enabled}
                className="rounded border-[#CBD5E1] text-[#0EA5A4] focus:ring-[#0EA5A4] disabled:opacity-50"
              />
            </div>

            {/* Quiet Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2.5">
                <Moon className="h-4 w-4 text-purple-600" />
                <div>
                  <span className="font-semibold text-[#111827] block">Quiet Mode</span>
                  <span className="text-[#64748B]">Limit notifications to top 1 highest-interest laptop only</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consent.quietMode}
                onChange={handleToggleQuiet}
                disabled={!consent.enabled}
                className="rounded border-[#CBD5E1] text-[#0EA5A4] focus:ring-[#0EA5A4] disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0EA5A4] shrink-0 mt-0.5" />
          <p>
            BuyWise AI does not collect personal identity or track passwords. Notifications are based entirely on anonymous browser interest scores.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset All Alert Data</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] transition-all shadow-xs"
          >
            Done
          </button>
        </div>

        {clearedNotice && (
          <div className="p-2.5 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-xs text-center font-semibold">
            ✓ Notification preferences and history have been cleared.
          </div>
        )}
      </div>
    </div>
  );
}
