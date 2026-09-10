"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Tag,
  Database,
  BellRing,
  TrendingUp,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Share2,
} from "lucide-react";

export default function HubOverviewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-[#134E4A] text-white shadow-card-light">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#34D399] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#5EEAD4]">
              Operations Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
            AutoBot HUB — Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time deal ingestion, affiliate tracking, pipeline automation, and multi-channel publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hub/deal-alerts-drafts"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0EA5A4] hover:bg-[#087F7E] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xs"
          >
            <BellRing className="h-4 w-4" />
            <span>Deal Alerts Drafts</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">3</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Live Deals</span>
            <Tag className="h-4 w-4 text-[#0EA5A4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">148</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+18 in last 2 hours</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Products Catalog</span>
            <Database className="h-4 w-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">30</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Normalized</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Draft Alerts</span>
            <BellRing className="h-4 w-4 text-[#D97706]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">3</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
            <span>Ready for review</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Pipeline Health</span>
            <Activity className="h-4 w-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#16A34A]">99.9%</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#64748B]">
            <span>All nodes synchronized</span>
          </div>
        </div>
      </div>

      {/* Quick Access Pipeline Modules */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#111827]">
          Core Operations Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/hub/curated-deals"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0EA5A4] hover:shadow-card-hover transition-all space-y-2.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0EA5A4] group-hover:bg-[#0EA5A4] group-hover:text-white transition-colors">
                <Tag className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0EA5A4] group-hover:translate-x-1 transition-transform">
                Open &rarr;
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Curated Deals</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Filter and verify high-discount laptop deals and affiliate tags.
              </p>
            </div>
          </Link>

          <Link
            href="/hub/deal-alerts-drafts"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0EA5A4] hover:shadow-card-hover transition-all space-y-2.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                <BellRing className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#D97706] group-hover:translate-x-1 transition-transform">
                Open &rarr;
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Deal Alerts Drafts</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Review automated price drop alerts before broadcasting to Telegram & WhatsApp.
              </p>
            </div>
          </Link>

          <Link
            href="/hub/automation-pipeline"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0EA5A4] hover:shadow-card-hover transition-all space-y-2.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
                Open &rarr;
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Automation Pipeline</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Manage automated scrapers, price trackers, and sync cron triggers.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
