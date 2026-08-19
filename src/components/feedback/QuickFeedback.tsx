"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface QuickFeedbackProps {
  productId?: string;
  productName?: string;
  className?: string;
}

export function QuickFeedback({ productId, productName, className = "" }: QuickFeedbackProps) {
  const [voted, setVoted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleVote = async (isHelpful: boolean) => {
    if (voted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isHelpful) {
        analytics.trackRecommendationHelpful({ productId, productName, isHelpful: true });
      } else {
        analytics.trackRecommendationNotHelpful({ productId, productName, isHelpful: false });
      }

      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: isHelpful ? 5 : 1,
          category: "Recommendation",
          feedbackType: "quick_vote",
          helpfulVote: isHelpful,
          productId,
          productName,
        }),
      });

      setVoted(true);
    } catch {
      // Gracefully show voted state even on network error
      setVoted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface-900/80 border border-surface-800/80 text-xs text-surface-300 ${className}`}
    >
      {voted ? (
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>Thanks for your feedback!</span>
        </div>
      ) : (
        <>
          <span className="font-medium text-surface-300">Was this recommendation helpful?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleVote(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/60 transition-colors active:scale-95 disabled:opacity-50"
              aria-label="Yes, this recommendation was helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Yes</span>
            </button>
            <button
              type="button"
              onClick={() => handleVote(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700/60 transition-colors active:scale-95 disabled:opacity-50"
              aria-label="No, this recommendation was not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5 text-rose-400" />
              <span>No</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
