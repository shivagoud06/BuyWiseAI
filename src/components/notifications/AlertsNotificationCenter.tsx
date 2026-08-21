"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  TrendingDown,
  PackageCheck,
  Sparkles,
  CheckCheck,
  Settings,
  ArrowRight,
  Clock,
  Laptop as LaptopIcon,
} from "lucide-react";
import { SmartNotification, NotificationTriggerType } from "@/services/notifications/types";
import {
  getNotificationHistory,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications/consent";

interface AlertsNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export function AlertsNotificationCenter({
  isOpen,
  onClose,
  onOpenSettings,
}: AlertsNotificationCenterProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [alerts, setAlerts] = useState<SmartNotification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAlerts(getNotificationHistory());
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsRead();
    setAlerts(updated);
  };

  const handleAlertClick = (alert: SmartNotification) => {
    markNotificationRead(alert.id);
    onClose();
    if (alert.productId) {
      router.push(`/laptops/${alert.productId}`);
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 5) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getAlertBadge = (type: NotificationTriggerType) => {
    switch (type) {
      case "PRICE_DROP":
        return {
          icon: TrendingDown,
          label: "PRICE DROP",
          badgeClass: "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]",
        };
      case "BACK_IN_STOCK":
        return {
          icon: PackageCheck,
          label: "BACK IN STOCK",
          badgeClass: "bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]",
        };
      case "BETTER_OFFER":
      default:
        return {
          icon: Sparkles,
          label: "BETTER STORE DEAL",
          badgeClass: "bg-[#E6FFFE] text-[#0EA5A4] border border-[#99F6F3]",
        };
    }
  };

  const content = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Subtle Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/15 pointer-events-auto transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Fixed Popover Panel - Exactly positioned in viewport */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Alerts Notification Center"
        className="fixed top-16 right-3 sm:right-6 md:right-8 lg:right-12 z-[10000] pointer-events-auto w-[calc(100vw-24px)] sm:w-[380px] max-w-[420px] max-h-[70vh] flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          wordBreak: "normal",
          overflowWrap: "break-word",
        }}
      >
        {/* Panel Header */}
        <div className="flex items-start justify-between p-4 pb-3 border-b border-[#E2E8F0] bg-slate-50/90 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
              <Bell className="h-4 w-4 text-[#0EA5A4]" />
              <span>Alerts</span>
              {alerts.some((a) => !a.read) && (
                <span className="h-2 w-2 rounded-full bg-[#0EA5A4]" />
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
              Stay updated on laptops you&apos;re interested in.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {alerts.length > 0 && alerts.some((a) => !a.read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#0EA5A4] hover:bg-[#E6FFFE] transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-200/60 transition-colors"
                title="Alert preferences"
                aria-label="Alert preferences"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-200/60 transition-colors"
              aria-label="Close alerts"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Panel Body / Internal Scroll Only */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0] min-h-[140px]">
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const badge = getAlertBadge(alert.triggerType);
              const Icon = badge.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-4 transition-all hover:bg-slate-50/80 ${
                    !alert.read ? "bg-teal-50/30" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${badge.badgeClass}`}>
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-medium flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111827] line-clamp-1 leading-snug">
                    {alert.productName}
                  </h4>

                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    {alert.retailerName && (
                      <span className="text-[10px] font-semibold text-[#64748B]">
                        Store: <strong className="text-[#111827]">{alert.retailerName}</strong>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAlertClick(alert)}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#0EA5A4] hover:text-[#087F7E] transition-colors"
                    >
                      <span>View Laptop</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#0EA5A4] border border-teal-200 shadow-xs">
                <Bell className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#111827] font-sans">
                  No alerts yet
                </h4>
                <p className="text-xs text-[#64748B] max-w-[260px] mx-auto leading-relaxed">
                  We&apos;ll notify you about verified price drops, stock changes, and better laptop deals.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/laptops" onClick={onClose}>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] shadow-xs transition-all"
                  >
                    <LaptopIcon className="h-3.5 w-3.5" />
                    <span>Browse Laptops</span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info link */}
        {alerts.length > 0 && onOpenSettings && (
          <div className="p-2.5 border-t border-[#E2E8F0] bg-slate-50/50 text-center shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#0EA5A4] transition-colors"
            >
              Configure alert triggers &amp; quiet mode →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
