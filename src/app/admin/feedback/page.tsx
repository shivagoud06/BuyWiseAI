"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  User,
  Filter,
  Lock,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { FeedbackSubmission, FeedbackStatus } from "@/services/feedback/types";

export default function AdminFeedbackPage() {
  const [adminKey, setAdminKey] = useState<string>("buywise-admin-secret");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const authenticateAndFetch = async (keyToUse = adminKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback?status=${filterStatus}`, {
        headers: {
          "x-admin-key": keyToUse,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setError("Invalid Admin Secret Key. Please enter the correct key.");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setIsAuthenticated(true);
        setFeedbackList(data.data);
      } else {
        setError(data.error || "Failed to load feedback entries.");
      }
    } catch {
      setError("Network error while connecting to Admin API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      authenticateAndFetch();
    }
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
        setActionSuccess(`Feedback ${id.slice(-6)} set to ${newStatus}`);
        setTimeout(() => setActionSuccess(null), 2500);
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Error contacting Admin API.");
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
            <CheckCircle2 className="h-3 w-3" />
            APPROVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
            <XCircle className="h-3 w-3" />
            REJECTED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="h-3 w-3" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A4] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>BuyWise Internal Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-sans">
              Feedback Moderation Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Review user suggestions, verify bug reports, and manage public community publishing.
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => authenticateAndFetch()}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0EA5A4] bg-[#E6FFFE] border border-[#99F6F3] hover:bg-[#CCFBF1] transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Action toast */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold animate-fadeIn">
            ✓ {actionSuccess}
          </div>
        )}

        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-card-light space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0EA5A4] border border-teal-200">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">Admin Verification Required</h3>
                <p className="text-xs text-[#64748B]">Enter your Admin Secret Key to access user submissions.</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                authenticateAndFetch();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Admin Secret Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs text-[#111827] focus:border-[#0EA5A4] focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 shadow-xs"
                />
                <span className="text-[10px] text-[#94A3B8]">
                  Default local demo key: <code className="bg-slate-100 px-1 py-0.5 rounded">buywise-admin-secret</code>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] transition-all shadow-xs"
              >
                {isLoading ? "Authenticating..." : "Unlock Dashboard"}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mr-2">
                  Status Filter:
                </span>
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      filterStatus === st
                        ? "bg-[#0EA5A4] text-white border-[#0EA5A4]"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-[#64748B]">
                Total: <strong className="text-[#111827]">{feedbackList.length}</strong> items
              </div>
            </div>

            {/* Moderation Items */}
            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#64748B]">Loading feedback...</div>
            ) : feedbackList.length > 0 ? (
              <div className="space-y-4">
                {feedbackList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getStatusBadge(item.status)}
                        <span className="text-xs font-bold text-[#111827] bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-xs font-semibold text-amber-600">
                          ★ {item.rating}/5
                        </span>
                        <span className="text-[11px] text-[#94A3B8] font-mono">
                          ID: {item.id}
                        </span>
                      </div>

                      <div className="text-xs text-[#64748B]">
                        Submitted: {new Date(item.timestamp || item.createdAt || "").toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-sm text-[#111827] font-medium leading-relaxed">
                      &ldquo;{item.comment || "No message content"}&rdquo;
                    </div>

                    {/* Metadata & User Contact (Admin only) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#475569]">
                        <User className="h-3.5 w-3.5 text-[#0EA5A4]" />
                        <span>
                          Name: <strong>{item.displayName || "Not provided"}</strong>{" "}
                          {item.showNamePublicly ? "(Public OK)" : "(Private)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[#475569]">
                        <Mail className="h-3.5 w-3.5 text-[#0EA5A4]" />
                        <span>Email: <strong>{item.email || "Not provided"}</strong></span>
                      </div>

                      {item.productName && (
                        <div className="text-[#475569] truncate">
                          Product: <strong>{item.productName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                      {item.status !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors shadow-xs"
                        >
                          Approve for Public Wall
                        </button>
                      )}

                      {item.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors shadow-xs"
                        >
                          Reject
                        </button>
                      )}

                      {item.status !== "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "PENDING")}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-[#E2E8F0] p-8 text-xs text-[#64748B]">
                No feedback entries found matching &ldquo;{filterStatus}&rdquo;.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
