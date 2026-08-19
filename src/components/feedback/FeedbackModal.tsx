"use client";

import React, { useState, useEffect } from "react";
import { Star, X, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedbackCategory, VALID_FEEDBACK_CATEGORIES } from "@/services/feedback/types";
import { analytics } from "@/lib/analytics";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
  source?: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  productId,
  productName,
  source = "navbar",
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>("Website");
  const [comment, setComment] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      analytics.trackFeedbackOpen({ source, productId });
    }
  }, [isOpen, source, productId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        rating,
        category,
        comment: comment.trim(),
        email: email.trim().length > 0 ? email.trim() : undefined,
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
        setErrorMessage(data.error || "Failed to submit feedback. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      analytics.trackFeedbackSubmit({
        rating,
        category,
        hasComment: comment.trim().length > 0,
        hasEmail: email.trim().length > 0,
        productId,
      });

      setTimeout(() => {
        setIsSuccess(false);
        setComment("");
        setEmail("");
        onClose();
      }, 2000);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const starLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-800 bg-surface-900 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          aria-label="Close feedback dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">Thanks for your feedback!</h3>
            <p className="text-sm text-surface-300 max-w-xs mx-auto">
              Your feedback directly helps us improve BuyWise recommendations for Indian laptop buyers.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1.5 pr-6">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                <MessageSquare className="h-4 w-4" />
                <span>BuyWise AI Feedback</span>
              </div>
              <h2 id="feedback-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                Share Your Feedback
              </h2>
              <p className="text-xs sm:text-sm text-surface-400">
                Help us make laptop shopping faster, transparent, and completely unbiased.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300">
                  How would you rate your experience? <span className="text-brand-400">*</span>
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-lg hover:bg-surface-800 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating ?? rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-surface-600 hover:text-surface-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-surface-400 ml-2">
                    {starLabels[(hoverRating ?? rating) - 1]}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-category" className="block text-xs font-semibold uppercase tracking-wider text-surface-300">
                  Category <span className="text-brand-400">*</span>
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {VALID_FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="feedback-comment" className="block text-xs font-semibold uppercase tracking-wider text-surface-300">
                    Your Comments
                  </label>
                  <span className="text-[11px] text-surface-500">
                    {comment.length}/1000
                  </span>
                </div>
                <textarea
                  id="feedback-comment"
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked, what felt inaccurate, or what could be improved..."
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/80 p-3.5 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Optional Email */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-email" className="block text-xs font-semibold uppercase tracking-wider text-surface-300">
                  Email <span className="text-[11px] font-normal text-surface-500 lowercase">(optional - for follow-up only)</span>
                </label>
                <input
                  type="email"
                  id="feedback-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
