import { NextRequest, NextResponse } from "next/server";
import { validateFeedbackSubmission, feedbackStorage, FeedbackCategory } from "@/services/feedback";

/**
 * Public Feedback Submission Endpoint
 * Accepts feedback submissions and stores them as PENDING moderation.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";

    // 1. Rate limiting
    if (!feedbackStorage.checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    // 2. Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 3. Validation
    const validation = validateFeedbackSubmission(body);
    if (!validation.isValid || !validation.cleanData) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          issues: validation.issues,
        },
        { status: 400 }
      );
    }

    // 4. Save to storage (starts as PENDING moderation)
    const result = await feedbackStorage.saveFeedback(validation.cleanData);

    return NextResponse.json({
      success: true,
      message: "Thanks for your feedback! It will be reviewed by our team.",
      id: result.id,
      status: "PENDING",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while saving feedback." },
      { status: 500 }
    );
  }
}

/**
 * Public Feedback Retrieval Endpoint
 * Returns ONLY approved feedback items with strictly sanitized public data.
 * NEVER exposes emails, IP addresses, or internal moderation logs.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "All") as FeedbackCategory | "All";
    const sortBy = (searchParams.get("sortBy") || "newest") as "newest" | "helpful";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const publicData = await feedbackStorage.getPublicFeedback({
      category,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: publicData.items,
      total: publicData.total,
      stats: publicData.stats,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to retrieve feedback." },
      { status: 500 }
    );
  }
}
