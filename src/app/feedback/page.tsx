"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Plus,
  Clock,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Bug,
  MessageCircle,
} from "lucide-react";
import { PublicFeedbackItem, FeedbackCategory } from "@/services/feedback/types";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { analytics } from "@/lib/analytics";

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<PublicFeedbackItem[]>([]);
  const [stats, setStats] = useState<{ averageRating: number; totalApproved: number; fiveStarPercentage: number }>({
    averageRating: 5.0,
    totalApproved: 0,
    fiveStarPercentage: 100,
  });
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "helpful">("newest");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [votedItems, setVotedItems] = useState<Record<string, "helpful" | "not_helpful">>({});

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      params.set("sortBy", sortBy);
      params.set("limit", "30");

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setFeedbackList(data.data);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [categoryFilter, sortBy]);

  const handleVote = async (feedbackId: string, vote: "helpful" | "not_helpful") => {
    if (votedItems[feedbackId]) return;

    // Optimistic UI update
    setVotedItems((prev) => ({ ...prev, [feedbackId]: vote }));
    setFeedbackList((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            helpfulCount: vote === "helpful" ? item.helpfulCount + 1 : item.helpfulCount,
            notHelpfulCount: vote === "not_helpful" ? item.notHelpfulCount + 1 : item.notHelpfulCount,
          };
        }
        return item;
      })
    );

    // Track safe aggregate event
    if (vote === "helpful") {
      analytics.trackFeedbackHelpful?.({ feedbackId });
    }

    try {
      await fetch("/api/feedback/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, vote }),
      });
    } catch {
      // safe fallback
    }
  };

  const formatRelativeDate = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 24) {
        if (diffHours <= 1) return "Just now";
        return `${diffHours} hours ago`;
      }
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      return new Date(isoString).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getCategoryBadge = (category: FeedbackCategory) => {
    switch (category) {
      case "Suggestion":
        return {
          icon: Lightbulb,
          label: "Suggestion",
          cls: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "Bug Report":
        return {
          icon: Bug,
          label: "Bug Report",
          cls: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "General Feedback":
      default:
        return {
          icon: MessageCircle,
          label: "General",
          cls: "bg-teal-50 text-teal-700 border-teal-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 border-b border-[#E2E8F0]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[#0EA5A4] text-xs font-bold uppercase tracking-wider bg-[#E6FFFE] border border-[#99F6F3] px-3 py-1 rounded-full shadow-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Community Feedback</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
              What our users think
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] max-w-xl font-normal">
              Real feedback and ratings from people using BuyWise AI to find and compare laptops.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] shadow-xs transition-all active:scale-98 self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Share Your Feedback</span>
          </button>
        </div>

        {/* Real Statistics Cards */}
        {stats.totalApproved > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-200 shrink-0">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-sans">
                  {stats.averageRating.toFixed(1)} / 5.0
                </div>
                <div className="text-xs text-[#64748B]">Average community rating</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-[#0EA5A4] border border-teal-200 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-sans">
                  {stats.totalApproved}
                </div>
                <div className="text-xs text-[#64748B]">Approved verified reviews</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111827] font-sans">
                  {stats.fiveStarPercentage}%
                </div>
                <div className="text-xs text-[#64748B]">5-Star satisfaction rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </span>
            {(["All", "Suggestion", "Bug Report", "General Feedback"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  categoryFilter === cat
                    ? "bg-[#0EA5A4] text-white border-[#0EA5A4] shadow-xs"
                    : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="feedback-sort" className="text-xs font-medium text-[#64748B] flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#0EA5A4]" />
              Sort:
            </label>
            <select
              id="feedback-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "helpful")}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111827] bg-white border border-[#E2E8F0] focus:border-[#0EA5A4] focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Feedback Cards Feed */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#64748B] space-y-2">
            <div className="h-6 w-6 border-2 border-[#0EA5A4] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading community feedback...</p>
          </div>
        ) : feedbackList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {feedbackList.map((item) => {
              const badge = getCategoryBadge(item.category);
              const Icon = badge.icon;
              const hasVoted = votedItems[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card-light hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Rating Stars + Category Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}
                      >
                        <Icon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    </div>

                    {/* Feedback Message Quote */}
                    <p className="text-sm text-[#334155] leading-relaxed font-normal italic">
                      &ldquo;{item.message}&rdquo;
                    </p>
                  </div>

                  {/* Bottom Row: User Name & Helpfulness Counter */}
                  <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#111827] flex items-center gap-1.5">
                        <span>— {item.displayName}</span>
                        {item.isVerifiedUser && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-md border border-[#BBF7D0]"
                            title="Verified BuyWise User"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Verified User
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Helpful / Not Helpful Actions */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[11px] text-[#64748B] mr-1">Helpful?</span>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, "helpful")}
                        disabled={Boolean(hasVoted)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          hasVoted === "helpful"
                            ? "bg-[#E6FFFE] text-[#0EA5A4] border-[#99F6F3]"
                            : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#111827] hover:bg-slate-50"
                        }`}
                        aria-label="Mark helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{item.helpfulCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote(item.id, "not_helpful")}
                        disabled={Boolean(hasVoted)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          hasVoted === "not_helpful"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#111827] hover:bg-slate-50"
                        }`}
                        aria-label="Mark not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-3">
            <MessageSquare className="h-8 w-8 text-[#94A3B8] mx-auto" />
            <h3 className="text-base font-bold text-[#111827]">No feedback in this category yet</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Be the first to share your thoughts, feature requests, or spec corrections.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Share Feedback</span>
            </button>
          </div>
        )}
      </div>

      <FeedbackModal isOpen={modalOpen} onClose={() => setModalOpen(false)} source="feedback_page" />
    </div>
  );
}
