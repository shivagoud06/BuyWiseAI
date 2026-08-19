import { FeedbackSubmission } from "./types";

export interface FeedbackStorageAdapter {
  saveFeedback(submission: FeedbackSubmission): Promise<{ success: boolean; id: string }>;
  checkRateLimit(clientIp: string): boolean;
  getFeedbackCount(): Promise<number>;
}

interface RateLimitEntry {
  count: number;
  firstTimestamp: number;
}

/**
 * In-Memory Feedback Storage Adapter
 * Default zero-cost implementation suitable for serverless / edge environments.
 * Prevents spam with sliding window rate limiting.
 */
class InMemoryFeedbackStorage implements FeedbackStorageAdapter {
  private feedbackBuffer: FeedbackSubmission[] = [];
  private maxBufferSize = 500;
  private rateLimitWindowMs = 60 * 1000; // 1 minute
  private maxRequestsPerWindow = 10;
  private clientRateLimits = new Map<string, RateLimitEntry>();
  private recentContentHashes = new Set<string>();

  /**
   * Rate limiting and duplicate protection
   */
  checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const entry = this.clientRateLimits.get(clientIp);

    if (!entry || now - entry.firstTimestamp > this.rateLimitWindowMs) {
      this.clientRateLimits.set(clientIp, { count: 1, firstTimestamp: now });
      return true;
    }

    if (entry.count >= this.maxRequestsPerWindow) {
      return false; // Rate limit exceeded
    }

    entry.count += 1;
    return true;
  }

  /**
   * Generates a deduplication key for duplicate spam protection
   */
  private generateContentHash(submission: FeedbackSubmission): string {
    const text = `${submission.rating}_${submission.category}_${submission.comment || ""}_${submission.productId || ""}`;
    return text.toLowerCase().trim();
  }

  /**
   * Stores a validated feedback entry
   */
  async saveFeedback(submission: FeedbackSubmission): Promise<{ success: boolean; id: string }> {
    const hash = this.generateContentHash(submission);
    
    // Check recent duplicate content if comment is non-empty
    if (submission.comment && this.recentContentHashes.has(hash)) {
      // Duplicate submission detected safely
      return { success: true, id: submission.id };
    }

    if (submission.comment) {
      this.recentContentHashes.add(hash);
      // Prune hash set if growing large
      if (this.recentContentHashes.size > 200) {
        this.recentContentHashes.clear();
      }
    }

    this.feedbackBuffer.push(submission);

    // Keep memory footprint bounded
    if (this.feedbackBuffer.length > this.maxBufferSize) {
      this.feedbackBuffer.shift();
    }

    return { success: true, id: submission.id };
  }

  async getFeedbackCount(): Promise<number> {
    return this.feedbackBuffer.length;
  }
}

export const feedbackStorage: FeedbackStorageAdapter = new InMemoryFeedbackStorage();
