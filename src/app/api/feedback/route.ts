import { NextRequest, NextResponse } from "next/server";
import { validateFeedbackSubmission, feedbackStorage } from "@/services/feedback";

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

    // 4. Save to storage
    const result = await feedbackStorage.saveFeedback(validation.cleanData);

    return NextResponse.json({
      success: true,
      message: "Thanks for your feedback!",
      id: result.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while saving feedback." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const count = await feedbackStorage.getFeedbackCount();
  return NextResponse.json({
    status: "ok",
    service: "BuyWise AI Feedback System",
    activeSubmissionsCount: count,
  });
}
