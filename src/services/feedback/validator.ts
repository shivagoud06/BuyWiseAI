import {
  FeedbackCategory,
  FeedbackSubmission,
  FeedbackValidationResult,
  FeedbackValidationIssue,
  VALID_FEEDBACK_CATEGORIES,
} from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_COMMENT_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 120;

/**
 * Escapes potentially hazardous characters from user input strings
 */
export function sanitizeText(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Strip HTML tag angle brackets
    .trim();
}

/**
 * Validates a user feedback submission against security and business rules
 */
export function validateFeedbackSubmission(raw: any): FeedbackValidationResult {
  const issues: FeedbackValidationIssue[] = [];

  if (!raw || typeof raw !== "object") {
    return {
      isValid: false,
      issues: [{ field: "root", message: "Feedback payload must be an object" }],
    };
  }

  // 1. Feedback Type
  const feedbackType: "modal" | "quick_vote" =
    raw.feedbackType === "quick_vote" ? "quick_vote" : "modal";

  // 2. Rating Validation (1 to 5)
  let rating = Number(raw.rating);
  if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    // If quick vote, map helpfulVote to 5 (helpful) or 1 (not helpful)
    if (feedbackType === "quick_vote" && typeof raw.helpfulVote === "boolean") {
      rating = raw.helpfulVote ? 5 : 1;
    } else {
      issues.push({ field: "rating", message: "Rating must be an integer between 1 and 5 stars" });
    }
  }

  // 3. Category Validation
  let category: FeedbackCategory = raw.category;
  if (!VALID_FEEDBACK_CATEGORIES.includes(category)) {
    if (feedbackType === "quick_vote") {
      category = "Recommendation";
    } else {
      issues.push({
        field: "category",
        message: `Category must be one of: ${VALID_FEEDBACK_CATEGORIES.join(", ")}`,
      });
    }
  }

  // 4. Comment / Message Validation (Max 500 characters)
  let cleanComment = "";
  const rawComment = raw.comment !== undefined ? raw.comment : raw.message;
  if (rawComment !== undefined && rawComment !== null) {
    if (typeof rawComment !== "string") {
      issues.push({ field: "comment", message: "Comment must be a text string" });
    } else {
      cleanComment = sanitizeText(rawComment);
      if (cleanComment.length > 500) {
        issues.push({
          field: "comment",
          message: `Comment must be 500 characters or less (received ${cleanComment.length})`,
        });
      }
    }
  }

  // 5. Optional Display Name Validation (Max 50 characters)
  let cleanDisplayName: string | null = null;
  if (raw.displayName !== undefined && raw.displayName !== null && String(raw.displayName).trim().length > 0) {
    cleanDisplayName = sanitizeText(String(raw.displayName)).slice(0, 50);
  }

  // 6. Optional Email Validation
  let cleanEmail: string | null = null;
  if (raw.email !== undefined && raw.email !== null && String(raw.email).trim().length > 0) {
    const emailStr = String(raw.email).trim();
    if (emailStr.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(emailStr)) {
      issues.push({ field: "email", message: "Please provide a valid email address or leave it blank" });
    } else {
      cleanEmail = emailStr.toLowerCase();
    }
  }

  // 7. Show Name Publicly Preference
  const showNamePublicly = Boolean(raw.showNamePublicly);

  if (issues.length > 0) {
    return {
      isValid: false,
      issues,
    };
  }

  const nowIso = new Date().toISOString();
  const cleanData: FeedbackSubmission = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    rating,
    category,
    comment: cleanComment.length > 0 ? cleanComment : undefined,
    displayName: cleanDisplayName,
    email: cleanEmail,
    showNamePublicly,
    status: "PENDING",
    helpfulCount: 0,
    notHelpfulCount: 0,
    isVerifiedUser: true,
    productId: raw.productId ? sanitizeText(String(raw.productId)).slice(0, 80) : undefined,
    productName: raw.productName ? sanitizeText(String(raw.productName)).slice(0, 120) : undefined,
    pageUrl: raw.pageUrl ? sanitizeText(String(raw.pageUrl)).slice(0, 200) : undefined,
    feedbackType,
    helpfulVote: typeof raw.helpfulVote === "boolean" ? raw.helpfulVote : undefined,
    timestamp: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return {
    isValid: true,
    cleanData,
    issues: [],
  };
}
