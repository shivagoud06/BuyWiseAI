"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Bot,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { HUB_NAV_GROUPS, NavItem, NavGroup } from "@/config/hubNavigation";

interface AutoBotHubLayoutProps {
  children: React.ReactNode;
}

export function AutoBotHubLayout({ children }: AutoBotHubLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [drawerOpen]);

  // Close drawer helper
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Determine if a navigation item is active
  const isItemActive = (href: string) => {
    if (href === "/hub") {
      return pathname === "/hub" || pathname === "/hub/overview";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Reusable Navigation Group Renderer
  const renderNavGroup = (group: NavGroup, onItemClick?: () => void) => {
    return (
      <div key={group.id} className="space-y-1.5 pt-4 first:pt-0">
        <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          {group.title}
        </div>
        <div className="space-y-0.5">
          {group.items.map((item: NavItem) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (onItemClick) {
                    onItemClick();
                  }
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#E6FFFE] text-[#0EA5A4] font-bold shadow-xs ring-1 ring-[#99F6F3]"
                    : "text-[#475569] hover:bg-slate-100/80 hover:text-[#111827]"
                }`}
                aria-current={active ? "page" : undefined}
                data-testid={`nav-item-${item.id}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-[#0EA5A4] text-white shadow-xs"
                        : "bg-slate-100 text-[#64748B] group-hover:bg-slate-200 group-hover:text-[#111827]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${
                        active
                          ? "bg-[#0EA5A4] text-white"
                          : "bg-teal-50 text-[#0EA5A4] border border-teal-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.optional && (
                    <span className="text-[10px] text-[#94A3B8] font-normal italic">
                      opt
                    </span>
                  )}
                  {active && (
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0EA5A4]" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#111827] flex flex-col antialiased">
      {/* ============================================================ */}
      {/* 2. MOBILE HEADER (Shown on mobile widths < 1024px / lg:hidden) */}
      {/* ============================================================ */}
      <header
        className="sticky top-0 z-30 lg:hidden w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 shadow-xs transition-all"
        data-testid="mobile-hub-header"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Mobile Branding: [ AutoBot HUB ] [ Operations Center ] */}
          <Link
            href="/hub"
            className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
            aria-label="AutoBot HUB Home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4] via-[#0EA5A4] to-[#0F766E] text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-[#111827] truncate font-sans">
                  AutoBot HUB
                </span>
                <span className="rounded-md bg-[#E6FFFE] border border-[#99F6F3] px-1.5 py-0.2 text-[9px] font-extrabold text-[#0EA5A4] uppercase tracking-wider">
                  OPS
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] truncate">
                Operations Center
              </span>
            </div>
          </Link>

          {/* Hamburger Button (Min touch target 44px x 44px, clear 3-line icon) */}
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-xl text-[#334155] hover:bg-slate-100 active:bg-slate-200 border border-[#E2E8F0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/40"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
            data-testid="hamburger-button"
          >
            {drawerOpen ? (
              <X className="h-5 w-5 text-[#111827]" />
            ) : (
              <Menu className="h-5 w-5 text-[#111827]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container Layout (Sidebar + Content) */}
      <div className="flex flex-1 w-full max-w-full overflow-x-hidden relative">
        {/* ============================================================ */}
        {/* 1. DESKTOP SIDEBAR (Permanent, hidden on mobile < 1024px)     */}
        {/* ============================================================ */}
        <aside
          className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col border-r border-[#E2E8F0] bg-white sticky top-0 h-screen overflow-y-auto"
          aria-label="Desktop Sidebar Navigation"
          data-testid="desktop-sidebar"
        >
          {/* Desktop Branding Header */}
          <div className="p-5 border-b border-[#E2E8F0]">
            <Link
              href="/hub"
              className="flex items-center gap-3 group"
              aria-label="AutoBot HUB Home"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4] via-[#0EA5A4] to-[#0F766E] text-white shadow-xs group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-[#111827] font-sans">
                    AutoBot HUB
                  </span>
                  <span className="rounded-md bg-[#DCFCE7] border border-[#BBF7D0] px-1.5 py-0.5 text-[10px] font-extrabold text-[#16A34A] uppercase">
                    PRO
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  Operations Center
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Groups */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto" aria-label="Desktop Navigation">
            {HUB_NAV_GROUPS.map((group) => renderNavGroup(group))}
          </nav>

          {/* Desktop Footer Status */}
          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="font-semibold text-[#334155]">Pipeline Online</span>
              </div>
              <span className="font-mono text-[11px] text-[#94A3B8]">v2.4.0</span>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 3. MOBILE DRAWER NAVIGATION (Slides from left on mobile)      */}
        {/* ============================================================ */}
        {/* Backdrop (closes on click, subtle blur, non-excessive dark) */}
        <div
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 lg:hidden ${
            drawerOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDrawer}
          aria-hidden="true"
          data-testid="drawer-backdrop"
        />

        {/* Mobile Left Drawer Container */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white border-r border-[#E2E8F0] shadow-2xl transition-transform duration-200 ease-in-out lg:hidden max-w-[320px] w-[85vw] overflow-hidden ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: "min(320px, 85vw)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          data-testid="mobile-drawer"
        >
          {/* Drawer Top Branding & Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
            <Link
              href="/hub"
              onClick={closeDrawer}
              className="flex items-center gap-2.5 min-w-0"
              aria-label="AutoBot HUB Home"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4] via-[#0EA5A4] to-[#0F766E] text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-[#111827] font-sans truncate">
                    AutoBot HUB
                  </span>
                  <span className="rounded-md bg-[#E6FFFE] border border-[#99F6F3] px-1.5 py-0.2 text-[9px] font-extrabold text-[#0EA5A4]">
                    OPS
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] truncate">
                  Operations Center
                </span>
              </div>
            </Link>

            {/* X Close Button (min touch target 44px x 44px, aria-label) */}
            <button
              type="button"
              onClick={closeDrawer}
              className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#111827] hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/40"
              aria-label="Close navigation"
              data-testid="drawer-close-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation Content (Vertical Scrolling) */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4"
            data-testid="drawer-nav-content"
          >
            {HUB_NAV_GROUPS.map((group) => renderNavGroup(group, closeDrawer))}
          </div>

          {/* Drawer Footer Status */}
          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/80 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="font-semibold text-[#334155]">Active Node</span>
              </div>
              <span className="font-mono text-[11px] text-[#94A3B8]">v2.4.0</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 12. PAGE CONTENT (Uses FULL available viewport width)         */}
        {/* ============================================================ */}
        <main
          className="flex-1 min-w-0 w-full bg-[#F5F7FA] overflow-x-hidden"
          data-testid="hub-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
