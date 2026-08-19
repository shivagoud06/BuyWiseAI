export type FeedbackCategory =
  | "Recommendation"
  | "Search"
  | "Retailer/Price"
  | "BUY NOW"
  | "Website"
  | "Other";

export const VALID_FEEDBACK_CATEGORIES: readonly FeedbackCategory[] = [
  "Recommendation",
  "Search",
  "Retailer/Price",
  "BUY NOW",
  "Website",
  "Other",
] as const;

export interface FeedbackSubmission {
  id: string;
  rating: number; // 1 - 5
  category: FeedbackCategory;
  comment?: string;
  email?: string | null;
  productId?: string;
  productName?: string;
  pageUrl?: string;
  feedbackType: "modal" | "quick_vote";
  helpfulVote?: boolean;
  timestamp: string; // ISO 8601 string
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
