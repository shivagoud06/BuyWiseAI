"use client";

import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getNotificationConsent,
  grantNotificationConsent,
  requestBrowserNotificationPermission,
} from "@/services/notifications/consent";
import { NotificationSettingsModal } from "./NotificationSettingsModal";

const DISMISS_SESSION_KEY = "buywise_notif_banner_dismissed_session";

export function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const isDismissed = window.sessionStorage?.getItem(DISMISS_SESSION_KEY) === "true";
        const consent = getNotificationConsent();
        // Show only if consent has not been decided yet and not dismissed this session
        if (!isDismissed && consent.permission === "default" && !consent.enabled) {
          setIsVisible(true);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  if (!isVisible) {
    return (
      <>
        {settingsOpen && (
          <NotificationSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        )}
      </>
    );
  }

  const handleEnable = async () => {
    try {
      await requestBrowserNotificationPermission();
      grantNotificationConsent();
      setIsVisible(false);
    } catch {
      grantNotificationConsent();
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_SESSION_KEY, "true");
    } catch {
      // safe fallback
    }
    setIsVisible(false);
  };

  return (
    <>
      <div className="relative bg-gradient-to-r from-surface-950 via-surface-900 to-surface-950 border-b border-brand-500/20 py-2.5 px-4 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-surface-200">
            <div className="p-1 rounded-md bg-brand-500/10 text-brand-400">
              <Bell className="h-4 w-4" />
            </div>
            <span>
              <strong className="text-white">Enable BuyWise notifications</strong> — Get instant verified price-drop & stock alerts for laptops you browse.
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Anonymous
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnable}
              className="text-xs py-1 px-3 h-7 font-medium"
            >
              Enable Notifications
            </Button>
            <button
              onClick={handleDismiss}
              className="text-surface-400 hover:text-white px-2 py-1 text-xs transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-surface-400 hover:text-brand-400 px-1 py-1 text-xs transition-colors"
              title="Alert Preferences"
            >
              Settings
            </button>
            <button
              onClick={handleDismiss}
              className="text-surface-500 hover:text-white p-1 ml-1"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <NotificationSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}
