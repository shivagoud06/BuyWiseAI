export type FeedbackCategory =
  | "Suggestion"
  | "Bug Report"
  | "General Feedback"
  | "Recommendation"
  | "Search"
  | "Retailer/Price"
  | "BUY NOW"
  | "Website"
  | "Other";

export const VALID_FEEDBACK_CATEGORIES: readonly FeedbackCategory[] = [
  "Suggestion",
  "Bug Report",
  "General Feedback",
  "Recommendation",
  "Search",
  "Retailer/Price",
  "BUY NOW",
  "Website",
  "Other",
] as const;

export type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface FeedbackSubmission {
  id: string;
  rating: number; // 1 - 5
  category: FeedbackCategory;
  comment?: string;
  displayName?: string | null;
  email?: string | null;
  showNamePublicly?: boolean;
  status: FeedbackStatus;
  helpfulCount?: number;
  notHelpfulCount?: number;
  isVerifiedUser?: boolean;
  productId?: string;
  productName?: string;
  pageUrl?: string;
  feedbackType: "modal" | "quick_vote";
  helpfulVote?: boolean;
  timestamp: string; // ISO 8601 string
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicFeedbackItem {
  id: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
  displayName: string; // Sanitized public name or "BuyWise User"
  isVerifiedUser: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  productId?: string;
  productName?: string;
}

export interface FeedbackValidationIssue {
  field: string;
  message: string;
}

export interface FeedbackValidationResult {
  isValid: boolean;
  cleanData?: FeedbackSubmission;
  issues: FeedbackValidationIssue[];
}

