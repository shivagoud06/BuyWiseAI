"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Scale,
  BrainCircuit,
  Search,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { NotificationSettingsModal } from "@/components/notifications/NotificationSettingsModal";
import { AlertsNotificationCenter } from "@/components/notifications/AlertsNotificationCenter";
import {
  getNotificationConsent,
  getNotificationHistory,
  getUnreadNotificationCount,
} from "@/services/notifications/consent";
import { Logo } from "@/components/brand/Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { count } = useCompare();

  useEffect(() => {
    try {
      setUnreadCount(getUnreadNotificationCount());
    } catch {
      // safe fallback
    }
  }, [alertsOpen, notifSettingsOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">

        {/* Unique BuyWise AI Logo */}
        <Link href="/" className="group flex items-center transition-transform hover:opacity-95" aria-label="BuyWise AI Home">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <Link href="/" className="text-sm font-semibold text-[#475569] hover:text-[#0EA5A4] transition-colors duration-150">
            Home
          </Link>
          <Link href="/laptops" className="text-sm font-semibold text-[#475569] hover:text-[#0EA5A4] transition-colors duration-150">
            Laptops
          </Link>
          <Link href="/compare" className="text-sm font-semibold text-[#475569] hover:text-[#0EA5A4] transition-colors duration-150 flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-[#0EA5A4]" />
            <span>Compare</span>
            {count > 0 && (
              <span className="rounded-full bg-[#0EA5A4] text-white text-[11px] font-bold px-1.5 py-0.5 leading-none shadow-xs">
                {count}
              </span>
            )}
          </Link>
          <Link href="/advisor" className="text-sm font-semibold text-[#475569] hover:text-[#0EA5A4] transition-colors duration-150 flex items-center gap-1.5">
            <BrainCircuit className="h-3.5 w-3.5 text-[#0EA5A4]" />
            <span>AI Advisor</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-1.5 relative">
          {/* Alerts Trigger with Dropdown Positioning */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                alertsOpen
                  ? "bg-[#E6FFFE] text-[#0EA5A4] ring-1 ring-[#0EA5A4]/30"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              }`}
              title="Notification alerts"
              aria-label="Notification alerts"
              aria-expanded={alertsOpen}
            >
              <Bell className="h-4 w-4 text-[#0EA5A4]" />
              <span>Alerts</span>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0EA5A4] text-white text-[9px] font-bold px-1 leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown */}
            <AlertsNotificationCenter
              isOpen={alertsOpen}
              onClose={() => setAlertsOpen(false)}
              onOpenSettings={() => setNotifSettingsOpen(true)}
            />
          </div>

          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-slate-100 hover:text-[#111827] transition-all duration-150"
            title="Provide feedback"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#0EA5A4]" />
            <span>Feedback</span>
          </button>

          <Link
            href="/laptops"
            className="rounded-xl p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] transition-all duration-150"
            title="Search laptops"
            aria-label="Search laptops"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link href="/advisor">
            <button
              type="button"
              className="ml-1 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] active:scale-98 px-3.5 py-2 rounded-xl transition-all duration-150 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Find My Laptop
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          {count > 0 && (
            <Link
              href="/compare"
              className="flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200 px-2 py-1 text-xs text-teal-700 font-semibold"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{count}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setAlertsOpen(true)}
            className="relative rounded-lg p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] transition-colors"
            aria-label="Smart alerts"
          >
            <Bell className="h-4 w-4 text-[#0EA5A4]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0EA5A4]" />
            )}
          </button>

          <Link
            href="/laptops"
            className="rounded-lg p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] transition-colors"
            aria-label="Search laptops"
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#64748B] hover:bg-slate-100 hover:text-[#111827] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5">
              Home
            </Link>
            <Link href="/laptops" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5">
              Laptops
            </Link>
            <Link href="/compare" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#0EA5A4]" />
                <span>Compare</span>
              </div>
              {count > 0 && (
                <span className="rounded-full bg-[#0EA5A4] text-white text-xs font-bold px-2 py-0.5">{count}</span>
              )}
            </Link>
            <Link href="/advisor" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[#0EA5A4]" />
              <span>AI Advisor</span>
            </Link>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setAlertsOpen(true); }}
              className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5 flex items-center justify-between text-left w-full"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#0EA5A4]" />
                <span>Smart Alerts</span>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#0EA5A4] text-white text-xs font-bold px-2 py-0.5">{unreadCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setFeedbackOpen(true); }}
              className="text-sm font-semibold text-[#334155] hover:text-[#0EA5A4] hover:bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-2 text-left w-full"
            >
              <MessageSquare className="h-4 w-4 text-[#0EA5A4]" />
              <span>Feedback</span>
            </button>
          </nav>
          <div className="pt-2 border-t border-[#E2E8F0]">
            <Link href="/advisor" onClick={() => setMobileMenuOpen(false)}>
              <button type="button" className="w-full justify-center inline-flex items-center gap-2 text-sm font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] px-4 py-2.5 rounded-xl transition-all shadow-xs">
                <Sparkles className="h-4 w-4" />
                Find My Laptop
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Alerts Center & Modals */}
      <div className="md:hidden">
        <AlertsNotificationCenter
          isOpen={alertsOpen}
          onClose={() => setAlertsOpen(false)}
          onOpenSettings={() => setNotifSettingsOpen(true)}
        />
      </div>
      <NotificationSettingsModal isOpen={notifSettingsOpen} onClose={() => setNotifSettingsOpen(false)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} source="navbar" />
    </header>
  );
}
