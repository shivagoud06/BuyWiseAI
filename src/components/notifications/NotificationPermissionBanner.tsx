"use client";

import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, X } from "lucide-react";
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
      <div className="relative bg-[#E6FFFE] border-b border-[#99F6F3] py-2 px-4 text-xs shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-[#334155]">
            <div className="p-1 rounded-md bg-white text-[#0EA5A4] border border-[#99F6F3] shrink-0">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <span>
              <strong className="text-[#111827]">Enable BuyWise alerts:</strong> Get verified price-drop &amp; stock notifications for laptops you browse.
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
              <ShieldCheck className="h-3 w-3" /> Anonymous
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEnable}
              type="button"
              className="text-xs py-1 px-3 rounded-lg font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] shadow-xs transition-all"
            >
              Enable Alerts
            </button>
            <button
              onClick={handleDismiss}
              type="button"
              className="text-[#64748B] hover:text-[#111827] px-2 py-1 text-xs transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              type="button"
              className="text-[#0EA5A4] hover:text-[#087F7E] font-semibold px-1 py-1 text-xs transition-colors"
              title="Alert Preferences"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <NotificationSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
