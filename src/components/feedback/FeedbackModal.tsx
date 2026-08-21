"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Lightbulb,
  Bug,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FeedbackCategory } from "@/services/feedback/types";
import { analytics } from "@/lib/analytics";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
  source?: string;
}

const FEEDBACK_TYPES: { id: FeedbackCategory; title: string; subtitle: string; icon: React.ElementType }[] = [
  {
    id: "Suggestion",
    title: "Suggestion",
    subtitle: "New features or improvements",
    icon: Lightbulb,
  },
  {
    id: "Bug Report",
    title: "Bug Report",
    subtitle: "Something isn't working or specs inaccurate",
    icon: Bug,
  },
  {
    id: "General Feedback",
    title: "General Feedback",
    subtitle: "Overall BuyWise experience & thoughts",
    icon: MessageCircle,
  },
];

export function FeedbackModal({
  isOpen,
  onClose,
  productId,
  productName,
  source = "navbar",
}: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>("Suggestion");
  const [comment, setComment] = useState<string>("" );
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showNamePublicly, setShowNamePublicly] = useState<boolean>(false);
  const [includeBrowserInfo, setIncludeBrowserInfo] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      analytics.trackFeedbackOpen({ source, productId });
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen, source, productId]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();

    // Immediate client-side validation
    if (!trimmed) {
      setErrorMessage("Please enter your feedback message.");
      if (textareaRef.current) textareaRef.current.focus();
      return;
    }

    if (trimmed.length > 500) {
      setErrorMessage("Feedback must be 500 characters or less.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const browserInfo =
        includeBrowserInfo && typeof navigator !== "undefined"
          ? ` [Browser: ${navigator.userAgent.slice(0, 100)}]`
          : "";

      const payload = {
        rating: 5,
        category,
        comment: trimmed + browserInfo,
        displayName: displayName.trim() || undefined,
        email: email.trim() || undefined,
        showNamePublicly,
        productId,
        productName,
        feedbackType: "modal",
      };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Unable to send feedback. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      analytics.trackFeedbackSubmit({
        rating: 5,
        category,
        hasComment: true,
        productId,
      });

      // Auto dismiss modal after brief toast
      setTimeout(() => {
        setIsSuccess(false);
        setComment("");
        setDisplayName("");
        setEmail("");
        setShowNamePublicly(false);
        onClose();
      }, 2000);
    } catch {
      setErrorMessage("Unable to send feedback. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-[calc(100vw-24px)] sm:w-full sm:max-w-[520px] max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] my-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl p-5 sm:p-7 space-y-5 overflow-y-auto animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
          aria-label="Close feedback dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] font-sans">
              ✓ Thanks for your feedback!
            </h3>
            <p className="text-sm text-[#64748B] max-w-xs mx-auto">
              We really appreciate it. Your thoughts help us make BuyWise AI smarter and more helpful.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-1.5 text-[#0EA5A4] text-xs font-bold uppercase tracking-wider">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>BuyWise AI Feedback</span>
              </div>
              <h2
                id="feedback-modal-title"
                className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-sans"
              >
                Help us improve BuyWise AI
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Your feedback helps us make laptop recommendations better.
              </p>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback Type Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Feedback Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {FEEDBACK_TYPES.map((type) => {
                    const isSelected = category === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setCategory(type.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 shadow-xs ${
                          isSelected
                            ? "border-[#0EA5A4] bg-[#E6FFFE] text-[#111827] ring-1 ring-[#0EA5A4]"
                            : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-[#0EA5A4]" : "text-[#64748B]"}`} />
                          <span
                            className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-[#0EA5A4] bg-[#0EA5A4]"
                                : "border-[#CBD5E1] bg-white"
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold font-sans text-[#111827]">
                            {type.title}
                          </div>
                          <div className="text-[10px] text-[#64748B] line-clamp-1">
                            {type.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="feedback-message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#475569]"
                  >
                    Your feedback <span className="text-[#0EA5A4]">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      comment.length > 500 ? "text-[#DC2626] font-bold" : "text-[#94A3B8]"
                    }`}
                  >
                    {comment.length} / 500
                  </span>
                </div>
                <textarea
                  id="feedback-message"
                  ref={textareaRef}
                  rows={4}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Tell us what you think..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#0EA5A4] focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 resize-none shadow-xs"
                />
              </div>

              {/* Optional Contact Fields: Display Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label
                    htmlFor="feedback-name"
                    className="block text-xs font-bold uppercase tracking-wider text-[#475569]"
                  >
                    Display Name <span className="text-[10px] text-[#94A3B8] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    maxLength={50}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Shiva"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#111827] placeholder:text-[#94A3B8] focus:border-[#0EA5A4] focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="feedback-email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#475569]"
                  >
                    Email <span className="text-[10px] text-[#94A3B8] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    maxLength={100}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#111827] placeholder:text-[#94A3B8] focus:border-[#0EA5A4] focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 shadow-xs"
                  />
                </div>
              </div>

              {/* Public Name Preference Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs text-[#334155] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNamePublicly}
                    onChange={(e) => setShowNamePublicly(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  />
                  <span className="font-medium">Show my name publicly on the feedback wall</span>
                </label>
              </div>

              {/* User Privacy Note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0EA5A4] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  We only use the information you provide to process your feedback. Your email will never be shown publicly.
                </p>
              </div>

              {/* Community Link & Submit Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
                <Link
                  href="/feedback"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0EA5A4] hover:text-[#087F7E] transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>See community feedback →</span>
                </Link>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#111827] hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#087F7E] active:scale-98 disabled:opacity-60 transition-all shadow-xs min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Feedback</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
